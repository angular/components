/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Path, workspaces} from '@angular-devkit/core';
import {SchematicsException} from '@angular-devkit/schematics';
import {getProjectTargetOptions} from './project-targets';

/** Looks for the main TypeScript file in the given project and returns its path. */
export function getProjectMainFile(project: workspaces.ProjectDefinition): Path {
  const buildOptions = getProjectTargetOptions(project, 'build');

  // `browser` is for the `@angular-devkit/build-angular:application` builder while
  // `main` is for the `@angular-devkit/build-angular:browser` builder.
  const mainPath = (buildOptions['browser'] || buildOptions['main']) as Path | undefined;

  if (!mainPath) {
    throw new SchematicsException(
      `Could not find the project main file inside of the ` +
        `workspace config (${project.sourceRoot})`,
    );
  }

  return mainPath;
}
