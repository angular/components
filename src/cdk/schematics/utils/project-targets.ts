/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {JsonValue} from '@angular-devkit/core';
import {SchematicsException} from '@angular-devkit/schematics';
import {ProjectDefinition, TargetDefinition} from '@schematics/angular/utility';

/** Possible names of CLI builders used to configure the project. */
const PROJECT_BUILDERS = new Set([
  '@angular-devkit/build-angular:browser-esbuild',
  '@angular-devkit/build-angular:application',
  '@angular-devkit/build-angular:browser',
  '@angular/build:application',
]);

/** Possible name of CLI builders used to run tests in the project. */
const TEST_BUILDERS = new Set(['@angular-devkit/build-angular:karma', '@angular/build:karma']);

/** Resolves the architect options for the build target of the given project. */
export function getProjectTargetOptions(
  project: ProjectDefinition,
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
export function getProjectBuildTargets(project: ProjectDefinition): TargetDefinition[] {
  return getTargetsByBuilderName(project, builder => !!builder && PROJECT_BUILDERS.has(builder));
}

/** Gets all of the default CLI-provided testing targets in a project. */
export function getProjectTestTargets(project: ProjectDefinition): TargetDefinition[] {
  return getTargetsByBuilderName(project, builder => !!builder && TEST_BUILDERS.has(builder));
}

/** Gets all targets from the given project that pass a predicate check. */
function getTargetsByBuilderName(
  project: ProjectDefinition,
  predicate: (name: string | undefined) => boolean,
): TargetDefinition[] {
  return Array.from(project.targets.keys())
    .filter(name => predicate(project.targets.get(name)?.builder))
    .map(name => project.targets.get(name)!);
}
