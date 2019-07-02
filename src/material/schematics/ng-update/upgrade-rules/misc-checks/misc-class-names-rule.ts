/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MigrationRule} from '@angular/cdk/schematics';
import * as ts from 'typescript';

/**
 * Rule that looks for class name identifiers that have been removed but
 * cannot be automatically migrated.
 */
export class MiscClassNamesRule extends MigrationRule<null> {
  visitNode(node: ts.Node): void {
    if (ts.isIdentifier(node)) {
      this._visitIdentifier(node);
    }
  }

  private _visitIdentifier(identifier: ts.Identifier) {
    if (identifier.getText() === 'MatDrawerToggleResult') {
      this.createFailureAtNode(
          identifier,
          `Found "MatDrawerToggleResult" which has changed from a class type to a string ` +
              `literal type. Your code may need to be updated.`);
    }

    if (identifier.getText() === 'MatListOptionChange') {
      this.createFailureAtNode(
          identifier,
          `Found usage of "MatListOptionChange" which has been removed. Please listen for ` +
              `"selectionChange" on "MatSelectionList" instead.`);
    }
  }
}
