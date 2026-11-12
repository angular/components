/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {join, normalize, Path} from '@angular-devkit/core';
import {Tree} from '@angular-devkit/schematics';
import {ProjectDefinition} from '@schematics/angular/utility';

/** Regular expression that matches stylesheet paths */
const STYLESHEET_REGEX = /.*\.(css|scss)$/;

/**
 * Finds stylesheets referenced by the workspace configuration. Falls back to scanning a
 * directory tree when a specific project definition is not provided.
 *
 * @param tree Virtual file system tree used by schematics.
 * @param projectOrDirectory Project definition to inspect or a path to scan recursively.
 */
export function findStylesheetFiles(
  tree: Tree,
  projectOrDirectory: ProjectDefinition | string = '/',
): string[] {
  if (isProjectDefinition(projectOrDirectory)) {
    return findFromWorkspaceProject(tree, projectOrDirectory);
  }

  return findByTraversal(tree, projectOrDirectory);
}

/**
 * Collects all styles declared inside the workspace configuration for a given project.
 *
 * @param tree Virtual file system tree used for file existence checks.
 * @param project Angular workspace project whose styles should be gathered.
 */
function findFromWorkspaceProject(tree: Tree, project: ProjectDefinition): string[] {
  const styles = new Set<string>();

  project.targets?.forEach(target => {
    collectFromTarget(target?.options, tree, styles);

    if (target?.configurations) {
      Object.values(target.configurations).forEach(config =>
        collectFromTarget(config, tree, styles),
      );
    }
  });

  return Array.from(styles);
}

/**
 * Extracts stylesheet entries from a target/options object and adds them to the accumulator.
 *
 * @param options Architect options object that may contain a `styles` array.
 * @param tree Virtual file system tree used to validate style paths.
 * @param styles Accumulator set that stores normalized stylesheet paths.
 */
function collectFromTarget(
  options: Record<string, any> | undefined,
  tree: Tree,
  styles: Set<string>,
) {
  const optionStyles = options?.['styles'];

  if (!Array.isArray(optionStyles)) {
    return;
  }

  optionStyles.forEach(entry => {
    const stylesheetPath = coerceStylesheetPath(entry);

    if (!stylesheetPath || !STYLESHEET_REGEX.test(stylesheetPath)) {
      return;
    }

    const normalizedPath = normalize(stylesheetPath);

    if (tree.exists(normalizedPath)) {
      styles.add(normalizedPath);
    }
  });
}

/**
 * Normalizes a `styles` entry into a plain path string.
 *
 * @param value Value from the `styles` array (string or object with `input`).
 */
function coerceStylesheetPath(value: unknown): string | null {
  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object') {
    const input = (value as Record<string, unknown>)['input'];
    return typeof input === 'string' ? input : null;
  }

  return null;
}

/**
 * Traverses directories starting from the provided path and gathers stylesheet files.
 *
 * @param tree Virtual file system tree used for directory traversal.
 * @param startDirectory Directory path whose subtree should be searched.
 */
function findByTraversal(tree: Tree, startDirectory: string): string[] {
  const result: string[] = [];
  const visitDir = (dirPath: Path) => {
    const {subfiles, subdirs} = tree.getDir(dirPath);

    subfiles.forEach(fileName => {
      if (STYLESHEET_REGEX.test(fileName)) {
        result.push(join(dirPath, fileName));
      }
    });

    // Visit directories within the current directory to find other stylesheets.
    subdirs.forEach(fragment => {
      // Do not visit directories or files inside node modules or `dist/` folders.
      if (fragment !== 'node_modules' && fragment !== 'dist') {
        visitDir(join(dirPath, fragment));
      }
    });
  };

  visitDir((startDirectory || '/') as Path);
  return result;
}

/**
 * Type guard that checks whether the provided value is a `ProjectDefinition`.
 *
 * @param value Unknown value to test.
 */
function isProjectDefinition(value: unknown): value is ProjectDefinition {
  return !!value && typeof value === 'object' && 'targets' in (value as ProjectDefinition);
}
