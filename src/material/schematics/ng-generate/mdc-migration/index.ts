/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Schema} from './schema';
import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';

/** Groups of components that must be migrated together. */
const migrationGroups = [
  ['autocomplete', 'form-field', 'input', 'select'],
  ['button'],
  ['card'],
  ['checkbox'],
  ['chips'],
  ['dialog'],
  ['list'],
  ['menu'],
  ['paginator'],
  ['progress-bar'],
  ['progress-spinner'],
  ['radio'],
  ['slide-toggle'],
  ['slider'],
  ['snack-bar'],
  ['table'],
  ['tabs'],
  ['tooltip'],
];

function getComponentsToMigrate(requested: string[]): Set<string> {
  const componentsToMigrate = new Set<string>(requested);
  if (componentsToMigrate.has('all')) {
    componentsToMigrate.clear();
    migrationGroups.forEach(group =>
      group.forEach(component => componentsToMigrate.add(component)),
    );
  } else {
    for (const group of migrationGroups) {
      if (group.some(component => componentsToMigrate.has(component))) {
        group.forEach(component => componentsToMigrate.add(component));
      }
    }
  }
  return componentsToMigrate;
}

export default function (options: Schema): Rule {
  const componentsToMigrate = getComponentsToMigrate(options.components);

  // TODO(mmalerba): options.path comes through as undefined.
  // I assume it should be the cwd?
  console.log('Will migrate', [...componentsToMigrate], 'for', options.path);

  return (tree: Tree, context: SchematicContext) => tree;
}
