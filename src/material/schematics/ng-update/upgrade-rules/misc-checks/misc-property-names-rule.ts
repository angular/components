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
 * Rule that walks through every property access expression and and reports a failure if
 * a given property name no longer exists but cannot be automatically migrated.
 */
export class MiscPropertyNamesRule extends MigrationRule<null> {
  visitNode(node: ts.Node): void {
    if (ts.isPropertyAccessExpression(node)) {
      this._visitPropertyAccessExpression(node);
    }
  }

  private _visitPropertyAccessExpression(node: ts.PropertyAccessExpression) {
    const hostType = this.typeChecker.getTypeAtLocation(node.expression);
    const typeName = hostType && hostType.symbol && hostType.symbol.getName();

    if (typeName === 'MatListOption' && node.name.text === 'selectionChange') {
      this.createFailureAtNode(
          node,
          `Found deprecated property "selectionChange" of ` +
              `class "MatListOption". Use the "selectionChange" property on the ` +
              `parent "MatSelectionList" instead.`);
    }

    if (typeName === 'MatDatepicker' && node.name.text === 'selectedChanged') {
      this.createFailureAtNode(
          node,
          `Found deprecated property "selectedChanged" of ` +
              `class "MatDatepicker". Use the "dateChange" or "dateInput" methods ` +
              `on "MatDatepickerInput" instead.`);
    }
  }
}
