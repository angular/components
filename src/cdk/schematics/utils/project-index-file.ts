/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Path, workspaces} from '@angular-devkit/core';
import {defaultTargetBuilders, getTargetsByBuilderName} from './project-targets';

/** Gets the path of the index file in the given project. */
export function getProjectIndexFiles(project: workspaces.ProjectDefinition): Path[] {
  const paths = defaultTargetBuilders.build
    .flatMap(name => getTargetsByBuilderName(project, name))
    .filter(t => t.options?.index)
    .map(t => t.options!.index as Path);

  // Use a set to remove duplicate index files referenced in multiple build targets of a project.
  return Array.from(new Set(paths));
}
