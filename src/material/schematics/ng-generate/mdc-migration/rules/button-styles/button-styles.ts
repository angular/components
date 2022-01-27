/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as postcss from 'postcss';

const OLD_MIXIN = 'button-theme';
const NEW_MIXINS = [
  'mdc-button-theme',
  'mdc-button-typography',
  'mdc-fab-theme',
  'mdc-fab-typography',
  'mdc-icon-theme',
  'mdc-icon-typography',
];

/**
 * If the given AtRule is a legacy button mixin, replaces it with the new ones and returns true.
 *
 * @param namespace the namespace being used for @angular/material.
 * @param atRule a postcss AtRule node.
 * @returns true if the given node is a legacy button mixin that gets updated.
 */
export function updateMixin(namespace: string, atRule: postcss.AtRule): boolean {
  if (isLegacyMixin(namespace, atRule)) {
    replaceMixin(namespace, atRule);
    return true;
  }
  return false;
}

/**
 * Returns whether the given AtRule is a use of the legacy button mixin.
 *
 * @param namespace the namespace being used for @angular/material.
 * @param atRule a postcss AtRule node.
 * @returns true if the given AtRule is a use of the legacy button mixin.
 */
function isLegacyMixin(namespace: string, atRule: postcss.AtRule): boolean {
  if (atRule.name !== 'include') {
    return false;
  }
  return atRule.params.includes(`${namespace}.${OLD_MIXIN}`);
}

/**
 *
 * @param namespace
 * @param atRule
 */
function replaceMixin(namespace: string, atRule: postcss.AtRule): void {
  // Cloning & inserting the first node before changing the
  // indentation preserves the indentation of the first node (e.g. 3 newlines).
  atRule.cloneBefore({params: createButtonParams(atRule, 0)});

  // We change the indentation before inserting all of the other nodes
  // because the additional @includes should only be separated by a single newline
  const indentation = atRule.raws.before?.split('\n').pop();
  atRule.raws.before = '\n' + indentation;

  // Note: It may be more efficient to create an array of clones and then insert
  // them all at once. If we are having performance issues, we should revisit this.
  for (let i = 1; i < NEW_MIXINS.length; i++) {
    atRule.cloneBefore({params: createButtonParams(atRule, i)});
  }
  atRule.remove();
}

/**
 * Replace and returns the legacy button mixin of the
 * given @include AtRule with the new one at the given index.
 *
 * @param atRule a postcss @include AtRule using the legacy button.
 * @param index the index of the new button mixin to use.
 * @returns the new params for an AtRule.
 */
function createButtonParams(atRule: postcss.AtRule, index: number): string {
  return atRule.params.replace(OLD_MIXIN, NEW_MIXINS[index]);
}
