/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {normalize, workspaces} from '@angular-devkit/core';
import {Tree} from '@angular-devkit/schematics';
import {getWorkspace} from '@schematics/angular/utility/workspace';
import {WorkspacePath} from '../update-tool/file-system';

/** Name of the default Angular CLI workspace configuration files. */
const defaultWorkspaceConfigPaths = ['/angular.json', '/.angular.json'];

/** Gets the tsconfig path from the given target within the specified project. */
export function getTargetTsconfigPath(
  project: workspaces.ProjectDefinition,
  targetName: string,
): WorkspacePath | null {
  const tsconfig = project.targets?.get(targetName)?.options?.['tsConfig'];
  return tsconfig ? normalize(tsconfig as string) : null;
}

/** Resolve the workspace configuration of the specified tree gracefully. */
export async function getWorkspaceConfigGracefully(
  tree: Tree,
): Promise<workspaces.WorkspaceDefinition | null> {
  const path = defaultWorkspaceConfigPaths.find(filePath => tree.exists(filePath));

  if (!path) {
    return null;
  }

  try {
    return getWorkspace(tree, path);
  } catch {
    return null;
  }
}
