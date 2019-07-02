/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  findInputsOnElementWithTag,
  findOutputsOnElementWithTag,
  MigrationRule,
  ResolvedResource,
} from '@angular/cdk/schematics';

/**
 * Rule that walks through every inline or external template and reports if there
 * are outdated usages of the Angular Material API that needs to be updated manually.
 */
export class MiscTemplateRule extends MigrationRule<null> {
  visitTemplate(template: ResolvedResource): void {
    findOutputsOnElementWithTag(template.content, 'selectionChange', [
      'mat-list-option'
    ]).forEach(offset => {
      this.failures.push({
        filePath: template.filePath,
        position: template.getCharacterAndLineOfPosition(template.start + offset),
        message: `Found deprecated "selectionChange" output binding on "mat-list-option". ` +
            `Use "selectionChange" on "mat-selection-list" instead.`
      });
    });

    findOutputsOnElementWithTag(template.content, 'selectedChanged', [
      'mat-datepicker'
    ]).forEach(offset => {
      this.failures.push({
        filePath: template.filePath,
        position: template.getCharacterAndLineOfPosition(template.start + offset),
        message: `Found deprecated "selectedChanged" output binding on "mat-datepicker". ` +
            `Use "dateChange" or "dateInput" on "<input [matDatepicker]>" instead.`
      });
    });

    findInputsOnElementWithTag(template.content, 'selected', [
      'mat-button-toggle-group'
    ]).forEach(offset => {
      this.failures.push({
        filePath: template.filePath,
        position: template.getCharacterAndLineOfPosition(template.start + offset),
        message: `Found deprecated "selected" input binding on "mat-radio-button-group". ` +
            `Use "value" instead.`
      });
    });
  }
}
