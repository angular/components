/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {JsonValue, workspaces} from '@angular-devkit/core';
import {SchematicsException} from '@angular-devkit/schematics';

/** Resolves the architect options for the build target of the given project. */
export function getProjectTargetOptions(
  project: workspaces.ProjectDefinition,
  buildTarget: string,
): Record<string, JsonValue | undefined> {
  const options = project.targets?.get(buildTarget)?.options;

  if (!options) {
    throw new SchematicsException(
      `Cannot determine project target configuration for: ${buildTarget}.`,
    );
  }

  return options;
}

/** Gets all of the default CLI-provided build targets in a project. */
export function getProjectBuildTargets(
  project: workspaces.ProjectDefinition,
): workspaces.TargetDefinition[] {
  return getTargetsByBuilderName(
    project,
    builder =>
      builder === '@angular-devkit/build-angular:application' ||
      builder === '@angular-devkit/build-angular:browser',
  );
}

/** Gets all of the default CLI-provided testing targets in a project. */
export function getProjectTestTargets(
  project: workspaces.ProjectDefinition,
): workspaces.TargetDefinition[] {
  return getTargetsByBuilderName(
    project,
    builder => builder === '@angular-devkit/build-angular:karma',
  );
}

/** Gets all targets from the given project that pass a predicate check. */
function getTargetsByBuilderName(
  project: workspaces.ProjectDefinition,
  predicate: (name: string | undefined) => boolean,
): workspaces.TargetDefinition[] {
  return Array.from(project.targets.keys())
    .filter(name => predicate(project.targets.get(name)?.builder))
    .map(name => project.targets.get(name)!);
}
