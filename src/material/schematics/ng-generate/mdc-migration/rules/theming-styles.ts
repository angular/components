/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Migration, ResolvedResource} from '@angular/cdk/schematics';
import {SchematicContext} from '@angular-devkit/schematics';
import * as postcss from 'postcss';
import * as scss from 'postcss-scss';
import {ComponentMigrator, MIGRATORS} from '.';
import {RENAMED_TYPOGRAPHY_LEVELS} from './components/typography-hierarchy/constants';

const COMPONENTS_MIXIN_NAME = /\.([^(;]*)/;

export class ThemingStylesMigration extends Migration<ComponentMigrator[], SchematicContext> {
  enabled = true;
  private _namespace: string;

  override visitStylesheet(stylesheet: ResolvedResource) {
    let migratedContent = this.migrate(stylesheet.content, stylesheet.filePath);

    // Note: needs to run after `migrate` so that the `namespace` has been resolved.
    if (this._namespace) {
      migratedContent = migrateTypographyConfigs(migratedContent, this._namespace);
    }

    this.fileSystem
      .edit(stylesheet.filePath)
      .remove(stylesheet.start, stylesheet.content.length)
      .insertRight(stylesheet.start, migratedContent);
  }

  migrate(styles: string, filename: string): string {
    const processor = new postcss.Processor([
      {
        postcssPlugin: 'theming-styles-migration-plugin',
        AtRule: {
          use: this.atUseHandler.bind(this),
          include: this.atIncludeHandler.bind(this),
        },
        Rule: this.ruleHandler.bind(this),
      },
    ]);

    try {
      return processor.process(styles, {syntax: scss}).toString();
    } catch (e) {
      this.context.logger.error(`${e}`);
      this.context.logger.warn(`Failed to process stylesheet: ${filename} (see error above).`);
      return styles;
    }
  }

  atUseHandler(atRule: postcss.AtRule) {
    if (isAngularMaterialImport(atRule)) {
      this._namespace = parseNamespace(atRule);
    }
  }

  atIncludeHandler(atRule: postcss.AtRule) {
    const migrator = this.upgradeData.find(m => {
      return m.styles.isLegacyMixin(this._namespace, atRule);
    });
    if (migrator) {
      const mixinChange = migrator.styles.getMixinChange(this._namespace, atRule);
      if (mixinChange) {
        if (mixinChange.new) {
          replaceAtRuleWithMultiple(atRule, mixinChange.old, mixinChange.new);
        } else {
          atRule.remove();
        }
      }
    } else if (atRule.parent && this.isCrossCuttingMixin(atRule.params)) {
      if (this.isPartialMigration()) {
        // the second element of the result from match is the matching text
        const mixinName = atRule.params.match(COMPONENTS_MIXIN_NAME)![1];
        const comment = `TODO(mdc-migration): Remove ${mixinName} once all legacy components are migrated`;
        if (!addLegacyCommentForPartialMigrations(atRule, comment)) {
          // same mixin already replaced, nothing to do here
          return;
        }
      }
      replaceCrossCuttingMixin(atRule, this._namespace);
    }
  }

  isCrossCuttingMixin(mixinText: string) {
    return [
      `${this._namespace}\\.all-legacy-component-`,
      `${this._namespace}\\.legacy-core([^-]|$)`,
    ].some(r => new RegExp(r).test(mixinText));
  }

  isPartialMigration() {
    return this.upgradeData.length !== MIGRATORS.length;
  }

  ruleHandler(rule: postcss.Rule) {
    let isLegacySelector;
    let isDeprecatedSelector;

    const migrator = this.upgradeData.find(m => {
      isLegacySelector = m.styles.isLegacySelector(rule);
      isDeprecatedSelector = m.styles.isDeprecatedSelector(rule);
      return isLegacySelector || isDeprecatedSelector;
    });

    if (isLegacySelector) {
      migrator?.styles.replaceLegacySelector(rule);
    } else if (isDeprecatedSelector) {
      addCommentBeforeNode(
        rule,
        'TODO(mdc-migration): The following rule targets internal classes of ' +
          migrator?.component +
          ' that may no longer apply for the MDC version.',
      );
    }
  }
}

/**
 * Returns whether the given AtRule is an import for @angular/material styles.
 *
 * @param atRule a postcss AtRule node.
 * @returns true if the given AtRule is an import for @angular/material styles.
 */
function isAngularMaterialImport(atRule: postcss.AtRule): boolean {
  const params = postcss.list.space(atRule.params);
  return params[0] === "'@angular/material'";
}

/**
 * Parses the given @use AtRule and returns the namespace being used.
 *
 * @param atRule a postcss @use AtRule.
 * @returns the namespace being used.
 */
function parseNamespace(atRule: postcss.AtRule): string {
  const params = postcss.list.space(atRule.params);
  return params[params.length - 1];
}

/**
 *
 * @param atRule a postcss @use AtRule.
 * @param legacyComment comment that will be added to legacy mixin
 * @returns true if comment added, false if comment already exists
 */
function addLegacyCommentForPartialMigrations(
  atRule: postcss.AtRule,
  legacyComment: string,
): boolean {
  let hasAddedComment = false;
  // Check if comment has been added before, we don't want to add multiple
  // comments. We need to check since replacing the original node causes
  // this function to be called again.
  atRule.parent?.walkComments(comment => {
    if (comment.text.includes(legacyComment)) {
      hasAddedComment = true;
    }
  });

  if (hasAddedComment) {
    // If comment has been added, no action to do anymore.
    return false;
  }

  addCommentBeforeNode(atRule.cloneBefore(), legacyComment);
  return true;
}

/**
 * Adds comment before postcss rule or at rule node
 *
 * @param node a postcss rule.
 * @param comment the text content for the comment
 */
function addCommentBeforeNode(node: postcss.Rule | postcss.AtRule, comment: string): void {
  let commentNode = postcss.comment({
    text: comment,
  });
  // We need to manually adjust the indentation and add new lines between the
  // comment and node
  const indentation = node.raws.before?.split('\n').pop();
  commentNode.raws.before = '\n' + indentation;
  // Since node is parsed and not a copy, will always have a parent node
  node.parent!.insertBefore(node, commentNode);
  node.raws.before = '\n' + indentation;
}

/**
 * Replaces a cross-cutting mixin that affects multiple components with the MDC equivalent.
 *
 * @param atRule A mixin inclusion node
 * @param namespace The @angular/material namespace
 */
function replaceCrossCuttingMixin(atRule: postcss.AtRule, namespace: string) {
  atRule.cloneBefore({
    params: atRule.params
      .replace(`${namespace}.all-legacy-component`, `${namespace}.all-component`)
      .replace(`${namespace}.legacy-core`, `${namespace}.core`),
  });
  atRule.remove();
}

/**
 * Replaces the text in an atRule with multiple replacements on new lines
 *
 * @param atRule a postcss @use AtRule.
 * @param textToReplace text to replace in the at rule node's params attributes
 * @param replacements an array of strings to replace the specified text. Each
 * entry appears on a new line.
 */
function replaceAtRuleWithMultiple(
  atRule: postcss.AtRule,
  textToReplace: string,
  replacements: string[],
) {
  // Cloning & inserting the first node before changing the
  // indentation preserves the indentation of the first node (e.g. 3 newlines).
  atRule.cloneBefore({
    params: atRule.params.replace(textToReplace, replacements[0]),
  });

  // We change the indentation before inserting all of the other nodes
  // because the additional @includes should only be separated by a single newline.
  const indentation = atRule.raws.before?.split('\n').pop();
  atRule.raws.before = '\n' + indentation;

  // Note: It may be more efficient to create an array of clones and then insert
  // them all at once. If we are having performance issues, we should revisit this.
  for (let i = 1; i < replacements.length; i++) {
    atRule.cloneBefore({
      params: atRule.params.replace(textToReplace, replacements[i]),
    });
  }
  atRule.remove();
}

/**
 * Migrates all of the `define-legacy-typography-config` calls within a file.
 * @param content Content of the file to be migrated.
 * @param namespace Namespace under which `define-legacy-typography-config` is being used.
 */
function migrateTypographyConfigs(content: string, namespace: string): string {
  const calls = extractFunctionCalls(`${namespace}.define-legacy-typography-config`, content);
  const newFunctionName = `${namespace}.define-typography-config`;
  const replacements: {start: number; end: number; text: string}[] = [];

  calls.forEach(({name, args}) => {
    const argContent = content.slice(args.start, args.end);
    replacements.push({start: name.start, end: name.end, text: newFunctionName});

    RENAMED_TYPOGRAPHY_LEVELS.forEach((newName, oldName) => {
      const pattern = new RegExp(`\\$(${oldName}) *:`, 'g');
      let match: RegExpExecArray | null;

      // Technically each argument can only match once, but keep going just in case.
      while ((match = pattern.exec(argContent))) {
        const start = args.start + match.index + 1;
        replacements.push({
          start,
          end: start + match[1].length,
          text: newName,
        });
      }
    });
  });

  replacements
    .sort((a, b) => b.start - a.start)
    .forEach(
      ({start, end, text}) => (content = content.slice(0, start) + text + content.slice(end)),
    );

  return content;
}

/**
 * Extracts the spans of all calls of a specific Sass function within a file.
 * @param name Name of the function to look for.
 * @param content Content of the file being searched.
 */
function extractFunctionCalls(name: string, content: string) {
  const results: {name: {start: number; end: number}; args: {start: number; end: number}}[] = [];
  const callString = name + '(';
  let index = content.indexOf(callString);

  // This would be much simpler with a regex, but it can be fragile when it comes to nested
  // parentheses. We use this manual parsing which should be more reliable.
  while (index > -1) {
    let openParens = 0;
    let endIndex = -1;
    let nameEnd = index + callString.length - 1; // -1 to exclude the opening paren.

    for (let i = nameEnd; i < content.length; i++) {
      const char = content[i];

      if (char === '(') {
        openParens++;
      } else if (char === ')') {
        openParens--;

        if (openParens === 0) {
          endIndex = i;
          break;
        }
      }
    }

    // Invalid call, skip over it.
    if (endIndex === -1) {
      index = content.indexOf(callString, nameEnd + 1);
    } else {
      results.push({name: {start: index, end: nameEnd}, args: {start: nameEnd + 1, end: endIndex}});
      index = content.indexOf(callString, endIndex);
    }
  }

  return results;
}
