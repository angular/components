/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {strings, template as interpolateTemplate, workspaces} from '@angular-devkit/core';
import {
  apply,
  applyTemplates,
  branchAndMerge,
  chain,
  filter,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicsException,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {FileSystemSchematicContext} from '@angular-devkit/schematics/tools';
import {Schema as ComponentOptions, Style} from '@schematics/angular/component/schema';
import {InsertChange} from '@schematics/angular/utility/change';
import {getWorkspace} from '@schematics/angular/utility/workspace';
import {buildRelativePath, findModuleFromOptions} from '@schematics/angular/utility/find-module';
import {parseName} from '@schematics/angular/utility/parse-name';
import {validateHtmlSelector} from '@schematics/angular/utility/validation';
import {ProjectType} from '@schematics/angular/utility/workspace-models';
import {addDeclarationToModule, addExportToModule} from '@schematics/angular/utility/ast-utils';
import {readFileSync, statSync} from 'fs';
import {dirname, join, resolve} from 'path';
import * as ts from 'typescript';
import {getProjectFromWorkspace} from './get-project';
import {getDefaultComponentOptions, isStandaloneSchematic} from './schematic-options';

/**
 * Build a default project path for generating.
 * @param project The project to build the path for.
 */
function buildDefaultPath(project: workspaces.ProjectDefinition): string {
  const root = project.sourceRoot ? `/${project.sourceRoot}/` : `/${project.root}/src/`;

  const projectDirName =
    project.extensions['projectType'] === ProjectType.Application ? 'app' : 'lib';

  return `${root}${projectDirName}`;
}

/**
 * List of style extensions which are CSS compatible. All supported CLI style extensions can be
 * found here: angular/angular-cli/main/packages/schematics/angular/ng-new/schema.json#L118-L122
 */
const supportedCssExtensions = ['css', 'scss', 'less'];

function readIntoSourceFile(host: Tree, modulePath: string) {
  const text = host.read(modulePath);
  if (text === null) {
    throw new SchematicsException(`File ${modulePath} does not exist.`);
  }

  return ts.createSourceFile(modulePath, text.toString('utf-8'), ts.ScriptTarget.Latest, true);
}

function addDeclarationToNgModule(options: ComponentOptions): Rule {
  return (host: Tree) => {
    if (options.skipImport || options.standalone || !options.module) {
      return host;
    }

    const modulePath = options.module;
    let source = readIntoSourceFile(host, modulePath);

    const componentPath =
      `/${options.path}/` +
      (options.flat ? '' : strings.dasherize(options.name) + '/') +
      strings.dasherize(options.name) +
      '.component';
    const relativePath = buildRelativePath(modulePath, componentPath);
    const classifiedName = strings.classify(`${options.name}Component`);

    const declarationChanges = addDeclarationToModule(
      source,
      modulePath,
      classifiedName,
      relativePath,
    );

    const declarationRecorder = host.beginUpdate(modulePath);
    for (const change of declarationChanges) {
      if (change instanceof InsertChange) {
        declarationRecorder.insertLeft(change.pos, change.toAdd);
      }
    }
    host.commitUpdate(declarationRecorder);

    if (options.export) {
      // Need to refresh the AST because we overwrote the file in the host.
      source = readIntoSourceFile(host, modulePath);

      const exportRecorder = host.beginUpdate(modulePath);
      const exportChanges = addExportToModule(
        source,
        modulePath,
        strings.classify(`${options.name}Component`),
        relativePath,
      );

      for (const change of exportChanges) {
        if (change instanceof InsertChange) {
          exportRecorder.insertLeft(change.pos, change.toAdd);
        }
      }
      host.commitUpdate(exportRecorder);
    }

    return host;
  };
}

function buildSelector(options: ComponentOptions, projectPrefix?: string) {
  let selector = strings.dasherize(options.name);
  if (options.prefix) {
    selector = `${options.prefix}-${selector}`;
  } else if (options.prefix === undefined && projectPrefix) {
    selector = `${projectPrefix}-${selector}`;
  }

  return selector;
}

/**
 * Indents the text content with the amount of specified spaces. The spaces will be added after
 * every line-break. This utility function can be used inside of EJS templates to properly
 * include the additional files.
 */
function indentTextContent(text: string, numSpaces: number): string {
  // In the Material project there should be only LF line-endings, but the schematic files
  // are not being linted and therefore there can be also CRLF or just CR line-endings.
  return text.replace(/(\r\n|\r|\n)/g, `$1${' '.repeat(numSpaces)}`);
}

/**
 * Rule that copies and interpolates the files that belong to this schematic context. Additionally
 * a list of file paths can be passed to this rule in order to expose them inside the EJS
 * template context.
 *
 * This allows inlining the external template or stylesheet files in EJS without having
 * to manually duplicate the file content.
 */
export function buildComponent(
  options: ComponentOptions,
  additionalFiles: {[key: string]: string} = {},
): Rule {
  return async (host, ctx) => {
    const context = ctx as FileSystemSchematicContext;
    const workspace = await getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);
    const defaultComponentOptions = getDefaultComponentOptions(project);

    // TODO(devversion): Remove if we drop support for older CLI versions.
    // This handles an unreported breaking change from the @angular-devkit/schematics. Previously
    // the description path resolved to the factory file, but starting from 6.2.0, it resolves
    // to the factory directory.
    const schematicPath = statSync(context.schematic.description.path).isDirectory()
      ? context.schematic.description.path
      : dirname(context.schematic.description.path);

    const schematicFilesUrl = './files';
    const schematicFilesPath = resolve(schematicPath, schematicFilesUrl);

    // Add the default component option values to the options if an option is not explicitly
    // specified but a default component option is available.
    Object.keys(options)
      .filter(
        key =>
          options[key as keyof ComponentOptions] == null &&
          defaultComponentOptions[key as keyof ComponentOptions],
      )
      .forEach(
        key =>
          ((options as any)[key] = (defaultComponentOptions as ComponentOptions)[
            key as keyof ComponentOptions
          ]),
      );

    if (options.path === undefined) {
      options.path = buildDefaultPath(project);
    }

    options.standalone = await isStandaloneSchematic(host, options);

    if (!options.standalone) {
      options.module = findModuleFromOptions(host, options);
    }

    const parsedPath = parseName(options.path!, options.name);

    options.name = parsedPath.name;
    options.path = parsedPath.path;
    options.selector = options.selector || buildSelector(options, project.prefix);

    validateHtmlSelector(options.selector!);

    // In case the specified style extension is not part of the supported CSS supersets,
    // we generate the stylesheets with the "css" extension. This ensures that we don't
    // accidentally generate invalid stylesheets (e.g. drag-drop-comp.styl) which will
    // break the Angular CLI project. See: https://github.com/angular/components/issues/15164
    if (!supportedCssExtensions.includes(options.style!)) {
      options.style = Style.Css;
    }

    // Object that will be used as context for the EJS templates.
    const baseTemplateContext = {
      ...strings,
      'if-flat': (s: string) => (options.flat ? '' : s),
      ...options,
    };

    // Key-value object that includes the specified additional files with their loaded content.
    // The resolved contents can be used inside EJS templates.
    const resolvedFiles: Record<string, string> = {};

    for (let key in additionalFiles) {
      if (additionalFiles[key]) {
        const fileContent = readFileSync(join(schematicFilesPath, additionalFiles[key]), 'utf-8');

        // Interpolate the additional files with the base EJS template context.
        resolvedFiles[key] = interpolateTemplate(fileContent)(baseTemplateContext);
      }
    }

    const templateSource = apply(url(schematicFilesUrl), [
      options.skipTests ? filter(path => !path.endsWith('.spec.ts.template')) : noop(),
      options.inlineStyle ? filter(path => !path.endsWith('.__style__.template')) : noop(),
      options.inlineTemplate ? filter(path => !path.endsWith('.html.template')) : noop(),
      // Treat the template options as any, because the type definition for the template options
      // is made unnecessarily explicit. Every type of object can be used in the EJS template.
      applyTemplates({indentTextContent, resolvedFiles, ...baseTemplateContext} as any),
      // TODO(devversion): figure out why we cannot just remove the first parameter
      // See for example: angular-cli#schematics/angular/component/index.ts#L160
      move(null as any, parsedPath.path),
    ]);

    return () =>
      chain([
        branchAndMerge(chain([addDeclarationToNgModule(options), mergeWith(templateSource)])),
      ])(host, context);
  };
}
