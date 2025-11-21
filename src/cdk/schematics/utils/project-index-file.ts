/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {join} from 'node:path/posix';
import {getProjectBuildTargets} from './project-targets';
import {ProjectDefinition} from '@schematics/angular/utility';

/**
 * Gets the path of the index file in the given project.
 * This only searches the base options for each target and not any defined target configurations.
 */
export function getProjectIndexFiles(project: ProjectDefinition): string[] {
  // Use a Set to remove duplicate index files referenced in multiple build targets of a project.
  const paths = new Set<string>();

  for (const target of getProjectBuildTargets(project)) {
    const indexValue = target.options?.['index'];

    switch (typeof indexValue) {
      case 'string':
        // "index": "src/index.html"
        paths.add(indexValue);
        break;
      case 'object':
        // "index": { "input": "src/index.html", ... }
        if (indexValue && 'input' in indexValue) {
          paths.add(indexValue['input'] as string);
        }
        break;
      case 'undefined':
        // v20+ supports an optional index field; default of `<project_source_root>/index.html`
        // `project_source_root` is the project level `sourceRoot`; default of `<project_root>/src`
        paths.add(join(project.sourceRoot ?? join(project.root, 'src'), 'index.html'));
        break;
    }
  }

  return Array.from(paths);
}
