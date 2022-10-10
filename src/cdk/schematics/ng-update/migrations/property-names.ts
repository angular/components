/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {Migration, Replacement} from '../../update-tool/migration';

import {PropertyNameUpgradeData} from '../data';
import {getVersionUpgradeData, UpgradeData} from '../upgrade-data';

/**
 * Migration that walks through every property access expression and updates
 * accessed properties that have been updated to a new name.
 */
export class PropertyNamesMigration extends Migration<UpgradeData> {
  /** Change data that upgrades to the specified target version. */
  data: PropertyNameUpgradeData[] = getVersionUpgradeData(this, 'propertyNames');

  // Only enable the migration rule if there is upgrade data.
  enabled = this.data.length !== 0;

  override visitNode(node: ts.Node) {
    if (ts.isPropertyAccessExpression(node)) {
      return this._visitPropertyAccessExpression(node);
    }

    return null;
  }

  private _visitPropertyAccessExpression(node: ts.PropertyAccessExpression) {
    const hostType = this.typeChecker.getTypeAtLocation(node.expression);
    const typeNames: string[] = [];
    const replacements: Replacement[] = [];

    if (hostType) {
      if (hostType.isIntersection()) {
        hostType.types.forEach(type => {
          if (type.symbol) {
            typeNames.push(type.symbol.getName());
          }
        });
      } else if (hostType.symbol) {
        typeNames.push(hostType.symbol.getName());
      }
    }

    this.data.forEach(data => {
      if (node.name.text !== data.replace) {
        return;
      }

      if (!data.limitedTo || typeNames.some(type => data.limitedTo.classes.includes(type))) {
        replacements.push({
          start: node.name.getStart(),
          length: node.name.getWidth(),
          content: data.replaceWith,
        });
      }
    });

    return replacements;
  }
}
