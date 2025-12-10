/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {chain, Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {getProjectFromWorkspace} from '@angular/cdk/schematics';
import {readWorkspace} from '@schematics/angular/utility';
import {ProjectType} from '@schematics/angular/utility/workspace-models';
import {addFontsToIndex} from './fonts/material-fonts';
import {Schema} from './schema';
import {addThemeToAppStyles} from './theming/theming';

/**
 * Scaffolds the basics of a Angular Material application, this includes:
 *  - Add Packages to package.json
 *  - Adds pre-built themes to styles.ext
 */
export default function (options: Schema): Rule {
  return async (host: Tree, context: SchematicContext) => {
    const workspace = await readWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);

    if (project.extensions['projectType'] === ProjectType.Application) {
      return chain([addThemeToAppStyles(options), addFontsToIndex(options)]);
    }
    context.logger.warn(
      'Angular Material has been set up in your workspace. There is no additional setup ' +
        'required for consuming Angular Material in your library project.\n\n' +
        'If you intended to run the schematic on a different project, pass the `--project` ' +
        'option.',
    );
    return;
  };
}
