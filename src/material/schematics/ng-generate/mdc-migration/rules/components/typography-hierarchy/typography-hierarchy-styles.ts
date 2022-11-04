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
      this.classChanges.push({new: '.' + newClass, old: '.' + oldClass});
    });
  }
}
