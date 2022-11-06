/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassNameChange, StyleMigrator} from '../../style-migrator';
import {RENAMED_TYPOGRAPHY_CLASSES} from './constants';

export class TypographyHierarchyStylesMigrator extends StyleMigrator {
  component = 'typography-hierarchy';
  deprecatedPrefixes = [];
  classChanges: ClassNameChange[] = [];
  mixinChanges = [
    {
      old: 'legacy-typography-hierarchy',
      new: ['typography-hierarchy'],
      checkForDuplicates: false,
    },
  ];

  constructor() {
    super();

    RENAMED_TYPOGRAPHY_CLASSES.forEach((newClass, oldClass) => {
      // Some classes get renamed to each other. E.g. `subheading-1` -> `body-1` -> `body-2`.
      // PostCSS will re-run its processors whenever an AST is mutated which means that we'll
      // either end up with an incorrect result or potentially fall into an infinite loop. Wrap
      // the risky classes in a special string that will be stripped out later to avoid the issue.
      const wrappedNewClass = RENAMED_TYPOGRAPHY_CLASSES.has(newClass)
        ? `.${StyleMigrator.wrapValue(newClass)}`
        : `.${newClass}`;

      this.classChanges.push({new: wrappedNewClass, old: '.' + oldClass});
    });
  }
}
