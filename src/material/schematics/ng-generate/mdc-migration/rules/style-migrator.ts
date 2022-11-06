/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as postcss from 'postcss';

const END_OF_SELECTOR_REGEX = '(?!-)';
const MIXIN_ARGUMENTS_REGEX = '\\(((\\s|.)*)\\)';

/** The changes to a class names. */
export interface ClassNameChange {
  /** The legacy class name. */
  old: string;

  /** The new class name. */
  new: string;
}

/** The changes to an scss mixin. */
export interface MixinChange {
  /** The name of the legacy scss mixin. */
  old: string;

  /** The name(s) of the new scss mixin(s). */
  new: string[] | null;

  /** Optional check to see if new scss mixin(s) already exist in the styles */
  checkForDuplicates?: boolean;
}

/** StyleMigrator implements the basic case for migrating old component styles to new ones. */
export abstract class StyleMigrator {
  /** The name of the component that this migration handles. */
  abstract component: string;

  /** The old and new class names of this component. */
  abstract classChanges: ClassNameChange[];

  /** The old mixins and their replacements. */
  abstract mixinChanges: MixinChange[];

  /** The prefix of classes that are specific to the old components */
  abstract deprecatedPrefixes: string[];

  /**
   * Data structure used to track which migrators have been applied to an AST node
   * already so they don't have to be re-run when PostCSS detects changes in the AST.
   */
  private _processedNodes = new WeakMap<postcss.Node, Set<string>>();

  /**
   * Wraps a value in a placeholder string to prevent it
   * from being matched multiple times in a migration.
   */
  static wrapValue(value: string): string {
    const escapeString = '__NG_MDC_MIGRATION_PLACEHOLDER__';
    return `${escapeString}${value}${escapeString}`;
  }

  /** Unwraps all the values that we wrapped by `wrapValue`. */
  static unwrapAllValues(content: string): string {
    return content.replace(/__NG_MDC_MIGRATION_PLACEHOLDER__/g, '');
  }

  /**
   * Returns whether the given at-include at-rule is a use of a legacy mixin for this component.
   *
   * @param namespace the namespace being used for angular/material.
   * @param atRule a postcss at-include at-rule.
   * @returns `true` if the given at-rule is a use of a legacy mixin for this component.
   */
  isLegacyMixin(namespace: string, atRule: postcss.AtRule): boolean {
    return this.mixinChanges.some(change => atRule.params.includes(`${namespace}.${change.old}`));
  }

  /**
   * Gets the mixin change object that has the new mixin(s) replacements if
   * found for the at rule node.
   *
   * @param namespace the namespace being used for angular/material.
   * @param atRule an at-include at-rule of a legacy mixin for this component.
   * @returns the mixin change object or null if not found
   */
  getMixinChange(namespace: string, atRule: postcss.AtRule): MixinChange | null {
    const processedKey = `mixinChange-${namespace}`;

    if (this._nodeIsProcessed(atRule, processedKey)) {
      return null;
    }

    const change = this.mixinChanges.find(c => {
      return atRule.params.includes(`${namespace}.${c.old}`);
    });

    if (!change) {
      return null;
    }

    // Check if mixin replacements already exist in the stylesheet
    const replacements = [...(change.new ?? [])];
    if (change.checkForDuplicates) {
      const mixinArgumentMatches = atRule.params?.match(MIXIN_ARGUMENTS_REGEX);
      atRule.root().walkAtRules(rule => {
        for (const index in replacements) {
          // Include arguments if applicable since there can be multiple themes.
          // The first element of the match object includes parentheses since
          // it's the whole match from the regex.
          const mixinName =
            replacements[index] + (mixinArgumentMatches ? mixinArgumentMatches[0] : '');
          // Remove replacement if mixin found in styles and make sure to not
          // count component-legacy-theme as a duplicate of component-theme
          if (rule.params.includes('.' + mixinName)) {
            replacements.splice(Number(index), 1);
          }
        }
      });
    }

    this._trackProcessedNode(atRule, processedKey);
    return {old: change.old, new: replacements.length ? replacements : null};
  }

  /**
   * Returns whether the given postcss rule uses a legacy selector of this component.
   *
   * @param rule a postcss rule.
   * @returns `true` if the given Rule uses a legacy selector of this component.
   */
  isLegacySelector(rule: postcss.Rule): boolean {
    // Since a legacy class can also have the deprecated prefix, we also
    // check that a match isn't actually a longer deprecated class.
    return this.classChanges.some(
      change => rule.selector?.match(change.old + END_OF_SELECTOR_REGEX) !== null,
    );
  }

  /**
   * Replaces a legacy selector of this component with the new one.
   *
   * @param rule a postcss rule.
   */
  replaceLegacySelector(rule: postcss.Rule): void {
    if (!this._nodeIsProcessed(rule, 'replaceLegacySelector')) {
      for (let i = 0; i < this.classChanges.length; i++) {
        const change = this.classChanges[i];
        if (rule.selector?.match(change.old + END_OF_SELECTOR_REGEX)) {
          rule.selector = rule.selector.replace(change.old, change.new);
        }
      }
      this._trackProcessedNode(rule, 'replaceLegacySelector');
    }
  }

  /**
   * Returns whether the given postcss rule uses a potentially deprecated
   * selector of the old component.
   *
   * @param rule a postcss rule.
   * @returns `true` if the given Rule uses a selector with the deprecated prefix.
   */
  isDeprecatedSelector(rule: postcss.Rule): boolean {
    return this.deprecatedPrefixes.some(deprecatedPrefix =>
      rule.selector.includes(deprecatedPrefix),
    );
  }

  /** Tracks that a node has been processed by a specific action. */
  private _trackProcessedNode(node: postcss.Node, action: string) {
    const appliedActions = this._processedNodes.get(node) || new Set();
    appliedActions.add(action);
    this._processedNodes.set(node, appliedActions);
  }

  /** Checks whether a node has been processed by an action in this migrator. */
  private _nodeIsProcessed(node: postcss.Node, action: string) {
    return !!this._processedNodes.get(node)?.has(action);
  }
}
