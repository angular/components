/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {dirname} from 'path';
import * as ts from 'typescript';
import {FileSystem, WorkspacePath} from './file-system';
import {getAngularDecorators} from './utils/decorators';
import {unwrapExpression} from './utils/functions';
import {
  computeLineStartsMap,
  getLineAndCharacterFromPosition,
  LineAndCharacter,
} from './utils/line-mappings';
import {getPropertyNameText} from './utils/property-name';

export interface ResolvedResource {
  /** Class declaration that contains this resource. */
  container: ts.ClassDeclaration | null;
  /** File content of the given template. */
  content: string;
  /** Start offset of the resource content (e.g. in the inline source file) */
  start: number;
  /** Whether the given resource is inline or not. */
  inline: boolean;
  /** Path to the file that contains this resource. */
  filePath: WorkspacePath;
  /**
   * Gets the character and line of a given position index in the resource.
   * If the resource is declared inline within a TypeScript source file, the line and
   * character are based on the full source file content.
   */
  getCharacterAndLineOfPosition: (pos: number) => LineAndCharacter;
}

/**
 * Collector that can be used to find Angular templates and stylesheets referenced within
 * given TypeScript source files (inline or external referenced files)
 */
export class ComponentResourceCollector {
  resolvedTemplates: ResolvedResource[] = [];
  resolvedStylesheets: ResolvedResource[] = [];

  constructor(
    public typeChecker: ts.TypeChecker,
    private _fileSystem: FileSystem,
  ) {}

  visitNode(node: ts.Node) {
    if (node.kind === ts.SyntaxKind.ClassDeclaration) {
      this._visitClassDeclaration(node as ts.ClassDeclaration);
    }
  }

  private _visitClassDeclaration(node: ts.ClassDeclaration) {
    const decorators = ts.getDecorators(node);

    if (!decorators || !decorators.length) {
      return;
    }

    const ngDecorators = getAngularDecorators(this.typeChecker, decorators);
    const componentDecorator = ngDecorators.find(dec => dec.name === 'Component');

    // In case no "@Component" decorator could be found on the current class, skip.
    if (!componentDecorator) {
      return;
    }

    const decoratorCall = componentDecorator.node.expression;

    // In case the component decorator call is not valid, skip this class declaration.
    if (decoratorCall.arguments.length !== 1) {
      return;
    }

    const componentMetadata = unwrapExpression(decoratorCall.arguments[0]);

    // Ensure that the component metadata is an object literal expression.
    if (!ts.isObjectLiteralExpression(componentMetadata)) {
      return;
    }

    const sourceFile = node.getSourceFile();
    const filePath = this._fileSystem.resolve(sourceFile.fileName);
    const sourceFileDirPath = dirname(sourceFile.fileName);

    // Walk through all component metadata properties and determine the referenced
    // HTML templates (either external or inline)
    componentMetadata.properties.forEach(property => {
      if (!ts.isPropertyAssignment(property)) {
        return;
      }

      const propertyName = getPropertyNameText(property.name);

      if (propertyName === 'styles') {
        const elements = ts.isArrayLiteralExpression(property.initializer)
          ? property.initializer.elements
          : [property.initializer];

        elements.forEach(el => {
          if (ts.isStringLiteralLike(el)) {
            // Need to add an offset of one to the start because the template quotes are
            // not part of the template content.
            const templateStartIdx = el.getStart() + 1;
            const content = stripBom(el.text);
            this.resolvedStylesheets.push({
              filePath,
              container: node,
              content,
              inline: true,
              start: templateStartIdx,
              getCharacterAndLineOfPosition: pos =>
                ts.getLineAndCharacterOfPosition(sourceFile, pos + templateStartIdx),
            });
          }
        });
      }

      // In case there is an inline template specified, ensure that the value is statically
      // analyzable by checking if the initializer is a string literal-like node.
      if (propertyName === 'template' && ts.isStringLiteralLike(property.initializer)) {
        // Need to add an offset of one to the start because the template quotes are
        // not part of the template content.
        const templateStartIdx = property.initializer.getStart() + 1;
        this.resolvedTemplates.push({
          filePath,
          container: node,
          content: property.initializer.text,
          inline: true,
          start: templateStartIdx,
          getCharacterAndLineOfPosition: pos =>
            ts.getLineAndCharacterOfPosition(sourceFile, pos + templateStartIdx),
        });
      }

      if (propertyName === 'styleUrls' && ts.isArrayLiteralExpression(property.initializer)) {
        property.initializer.elements.forEach(el => {
          if (ts.isStringLiteralLike(el)) {
            this._trackExternalStylesheet(sourceFileDirPath, el, node);
          }
        });
      }

      if (propertyName === 'styleUrl' && ts.isStringLiteralLike(property.initializer)) {
        this._trackExternalStylesheet(sourceFileDirPath, property.initializer, node);
      }

      if (propertyName === 'templateUrl' && ts.isStringLiteralLike(property.initializer)) {
        const templateUrl = property.initializer.text;
        const templatePath = this._fileSystem.resolve(sourceFileDirPath, templateUrl);

        // In case the template does not exist in the file system, skip this
        // external template.
        if (!this._fileSystem.fileExists(templatePath)) {
          return;
        }

        const fileContent = stripBom(this._fileSystem.read(templatePath) || '');

        if (fileContent) {
          const lineStartsMap = computeLineStartsMap(fileContent);

          this.resolvedTemplates.push({
            filePath: templatePath,
            container: node,
            content: fileContent,
            inline: false,
            start: 0,
            getCharacterAndLineOfPosition: p => getLineAndCharacterFromPosition(lineStartsMap, p),
          });
        }
      }
    });
  }

  /** Resolves an external stylesheet by reading its content and computing line mappings. */
  resolveExternalStylesheet(
    filePath: WorkspacePath,
    container: ts.ClassDeclaration | null,
  ): ResolvedResource | null {
    // Strip the BOM to avoid issues with the Sass compiler. See:
    // https://github.com/angular/components/issues/24227#issuecomment-1200934258
    const fileContent = stripBom(this._fileSystem.read(filePath) || '');

    if (!fileContent) {
      return null;
    }

    const lineStartsMap = computeLineStartsMap(fileContent);

    return {
      filePath: filePath,
      container: container,
      content: fileContent,
      inline: false,
      start: 0,
      getCharacterAndLineOfPosition: pos => getLineAndCharacterFromPosition(lineStartsMap, pos),
    };
  }

  private _trackExternalStylesheet(
    sourceFileDirPath: string,
    node: ts.StringLiteralLike,
    container: ts.ClassDeclaration,
  ) {
    const stylesheetPath = this._fileSystem.resolve(sourceFileDirPath, node.text);
    const stylesheet = this.resolveExternalStylesheet(stylesheetPath, container);

    if (stylesheet) {
      this.resolvedStylesheets.push(stylesheet);
    }
  }
}

/** Strips the BOM from a string. */
function stripBom(content: string): string {
  return content.replace(/\uFEFF/g, '');
}
