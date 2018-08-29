/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {WorkspaceProject} from '@schematics/angular/utility/config';
import {Schema as ComponentOptions} from '@schematics/angular/component/schema';

/**
 * Looks for options that are not explicitly specified but can fall back to a default value that
 * has been specified at project initialization (ng new or ng init).
 *
 * This is necessary because the Angular CLI only exposes the default values for the "--style",
 * "--inlineStyle", "--skipTests" and "--inlineTemplate" options to the "component" schematic.
 */
export function setDefaultSchematicOptions(project: WorkspaceProject,
                                           options: ComponentOptions) {

  // Note: Not all options which are available when running "ng new" will be stored in the
  // workspace config. List of options which will be stored in the configuration:
  // angular/angular-cli/blob/master/packages/schematics/angular/application/index.ts#L109-L131

  if (!options.styleext) {
    options.styleext = getDefaultSchematicOption(project, 'styleext', 'css');
  }

  if (options.inlineStyle === undefined) {
    options.inlineStyle = getDefaultSchematicOption(project, 'inlineStyle', false);
  }

  if (options.inlineTemplate === undefined) {
    options.inlineTemplate = getDefaultSchematicOption(project, 'inlineTemplate', false);
  }

  if (options.spec === undefined) {
    options.spec = getDefaultSchematicOption(project, 'spec', true);
  }
}

/**
 * Gets the default value for the specified option. The default options will be determined
 * by looking at the stored schematic options for `@schematics/angular:component` in the
 * CLI workspace configuration.
 */
function getDefaultSchematicOption<T>(project: WorkspaceProject, optionName: string,
                                      fallbackValue: T): T | null {
  if (project.schematics &&
      project.schematics['@schematics/angular:component'] &&
      project.schematics['@schematics/angular:component'][optionName] !== undefined) {

    return project.schematics['@schematics/angular:component'][optionName];
  }

  return fallbackValue;
}
