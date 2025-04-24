/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {chain, noop, Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {getProjectFromWorkspace, getProjectStyleFile} from '@angular/cdk/schematics';
import {getWorkspace} from '@schematics/angular/utility/workspace';
import {ProjectType} from '@schematics/angular/utility/workspace-models';
import {addFontsToIndex} from './fonts/material-fonts';
import {Schema} from './schema';
import {addThemeToAppStyles, addTypographyClass} from './theming/theming';

/**
 * Scaffolds the basics of a Angular Material application, this includes:
 *  - Add Packages to package.json
 *  - Adds pre-built themes to styles.ext
 */
export default function (options: Schema): Rule {
  return async (host: Tree, context: SchematicContext) => {
    const workspace = await getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);

    if (project.extensions['projectType'] === ProjectType.Application) {
      return chain([
        addThemeToAppStyles(options),
        addFontsToIndex(options),
        addMaterialAppStyles(options),
        options.typography ? addTypographyClass(options) : noop(),
      ]);
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

/**
 * Adds custom Material styles to the project style file. The custom CSS sets up the Roboto font
 * and reset the default browser body margin.
 */
function addMaterialAppStyles(options: Schema) {
  return async (host: Tree, context: SchematicContext) => {
    const workspace = await getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);
    const styleFilePath = getProjectStyleFile(project);
    const logger = context.logger;

    if (!styleFilePath) {
      logger.error(`Could not find the default style file for this project.`);
      logger.info(`Consider manually adding the Roboto font to your CSS.`);
      logger.info(`More information at https://fonts.google.com/specimen/Roboto`);
      return;
    }

    const buffer = host.read(styleFilePath);

    if (!buffer) {
      logger.error(
        `Could not read the default style file within the project ` + `(${styleFilePath})`,
      );
      logger.info(`Please consider manually setting up the Roboto font.`);
      return;
    }

    const htmlContent = buffer.toString();
    const insertion =
      '\n' +
      `html, body { height: 100%; }\n` +
      `body { margin: 0; font-family: Roboto, "Helvetica Neue", sans-serif; }\n`;

    if (htmlContent.includes(insertion)) {
      return;
    }

    const recorder = host.beginUpdate(styleFilePath);

    recorder.insertLeft(htmlContent.length, insertion);
    host.commitUpdate(recorder);
  };
}
