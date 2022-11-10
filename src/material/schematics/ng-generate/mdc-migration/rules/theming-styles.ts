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
import {ComponentMigrator, MIGRATORS, PERMANENT_MIGRATORS} from '.';
import {
  COMBINED_TYPOGRAPHY_LEVELS,
  RENAMED_TYPOGRAPHY_LEVELS,
} from './components/typography-hierarchy/constants';
import {StyleMigrator} from './style-migrator';

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
          use: this._atUseHandler.bind(this),
          include: atRule => this._atIncludeHandler(atRule),
        },
        Rule: rule => this._ruleHandler(rule),
      },
    ]);

    try {
      const result = processor.process(styles, {syntax: scss}).toString();
      // PostCSS will re-run the processors if it detects that an AST has been mutated. We want to
      // avoid this when removing the unwrapped values, because it may cause them to be re-migrated
      // incorrectly. This is achieved by unwrapping after the AST has been converted to a string.
      return result === styles ? styles : StyleMigrator.unwrapAllValues(result);
    } catch (e) {
      this.context.logger.error(`${e}`);
      this.context.logger.warn(`Failed to process stylesheet: ${filename} (see error above).`);
      return styles;
    }
  }

  private _atUseHandler(atRule: postcss.AtRule) {
    if (isAngularMaterialImport(atRule)) {
      this._namespace = parseNamespace(atRule);
    }
  }

  private _atIncludeHandler(atRule: postcss.AtRule) {
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
    return this.upgradeData.length !== MIGRATORS.length + PERMANENT_MIGRATORS.length;
  }

  private _ruleHandler(rule: postcss.Rule) {
    let isLegacySelector = false;
    let isDeprecatedSelector = false;

    const migrator = this.upgradeData.find(m => {
      isLegacySelector = m.styles.isLegacySelector(rule);
      isDeprecatedSelector = m.styles.isDeprecatedSelector(rule);
      return isLegacySelector || isDeprecatedSelector;
    });

    if (!migrator) {
      return;
    }

    if (isLegacySelector) {
      migrator.styles.replaceLegacySelector(rule);
    } else if (isDeprecatedSelector) {
      addCommentBeforeNode(
        rule,
        `TODO(mdc-migration): The following rule targets internal classes of ${migrator.component} ` +
          `that may no longer apply for the MDC version.`,
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
    const parameters = extractNamedParameters(content, args);
    const addedParameters = new Set<string>();

    RENAMED_TYPOGRAPHY_LEVELS.forEach((newName, oldName) => {
      const correspondingParam = parameters.get(oldName);

      if (correspondingParam) {
        addedParameters.add(newName);
        replacements.push({
          start: correspondingParam.key.start + 1, // + 1 to skip over the $ in the parameter name.
          end: correspondingParam.key.end,
          text: newName,
        });
      }
    });

    COMBINED_TYPOGRAPHY_LEVELS.forEach((newName, oldName) => {
      const correspondingParam = parameters.get(oldName);

      if (correspondingParam) {
        if (addedParameters.has(newName)) {
          const fullContent = content.slice(
            correspondingParam.key.start,
            correspondingParam.value.fullEnd,
          );
          replacements.push({
            start: correspondingParam.key.start,
            end: correspondingParam.value.fullEnd,
            text: `/* TODO(mdc-migration): No longer supported. Use \`${newName}\` instead. ${fullContent} */`,
          });
        } else {
          addedParameters.add(newName);
          replacements.push({
            start: correspondingParam.key.start + 1, // + 1 to skip over the $ in the parameter name.
            end: correspondingParam.key.end,
            text: newName,
          });
        }
      }
    });

    replacements.push({start: name.start, end: name.end, text: newFunctionName});
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

/** Extracts all of the named parameters and their values from a string. */
function extractNamedParameters(content: string, argsRange: {start: number; end: number}) {
  let escapeCount = 0;

  const args = content
    .slice(argsRange.start, argsRange.end)
    // The top-level function parameters can contain function calls with named parameters of their
    // own (e.g. `$display-4: mat.define-typography-level($font-family: $foo))` which we don't want to
    // extract. Escape everything between parentheses to make it easier to parse out the value later
    // on. Note that we escape with an equal-length string so that the string indexes remain the same.
    .replace(/\(.*\)/g, current => ++escapeCount + '◬'.repeat(current.length - 1));

  let colonIndex = args.indexOf(':');

  const params = new Map<
    string,
    {key: {start: number; end: number}; value: {start: number; end: number; fullEnd: number}}
  >();

  while (colonIndex > -1) {
    const keyRange = extractKeyRange(args, colonIndex);
    const valueRange = extractValueRange(args, colonIndex);

    if (keyRange && valueRange) {
      // + 1 to exclude the $ in the key name.
      params.set(args.slice(keyRange.start + 1, keyRange.end), {
        // Add the argument start offset since the indexes are relative to the argument string.
        key: {start: keyRange.start + argsRange.start, end: keyRange.end + argsRange.start},
        value: {
          start: valueRange.start + argsRange.start,
          end: valueRange.end + argsRange.start,
          fullEnd: valueRange.fullEnd + argsRange.start,
        },
      });
    }

    colonIndex = args.indexOf(':', colonIndex + 1);
  }

  return params;
}

/**
 * Extracts the text range that contains the key of a named Sass parameter, including the leading $.
 * @param content Text content in which to search.
 * @param colonIndex Index of the colon between the key and value.
 * Used as a starting point for the search.
 */
function extractKeyRange(content: string, colonIndex: number) {
  let index = colonIndex - 1;
  let start = -1;
  let end = -1;

  while (index > -1) {
    const char = content[index];
    if (char !== ' ' && char !== '\n') {
      if (end === -1) {
        end = index + 1;
      } else if (char === '$') {
        start = index;
        break;
      }
    }
    index--;
  }

  return start > -1 && end > -1 ? {start, end} : null;
}

/**
 * Extracts the text range that contains the value of a named Sass parameter.
 * @param content Text content in which to search.
 * @param colonIndex Index of the colon between the key and value.
 * Used as a starting point for the search.
 */
function extractValueRange(content: string, colonIndex: number) {
  let index = colonIndex + 1;
  let start = -1;
  let end = -1;
  let fullEnd = -1; // This is the end including any separators (e.g. commas).

  while (index < content.length) {
    const char = content[index];
    const isWhitespace = char === ' ' || char === '\n';

    if (!isWhitespace && start === -1) {
      start = index;
    } else if (start > -1 && (isWhitespace || char === ',')) {
      end = index;
      fullEnd = index + 1;
      break;
    }

    if (start > -1 && index === content.length - 1) {
      fullEnd = end = content.length;
      break;
    }

    index++;
  }

  return start > -1 && end > -1 ? {start, end, fullEnd} : null;
}
