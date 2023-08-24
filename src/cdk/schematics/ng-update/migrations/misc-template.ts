/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ResolvedResource} from '../../update-tool/component-resource-collector';
import {Migration} from '../../update-tool/migration';
import {UpgradeData} from '../upgrade-data';

/**
 * Migration that walks through every template and reports if there are
 * instances of outdated Angular CDK API that can't be migrated automatically.
 */
export class MiscTemplateMigration extends Migration<UpgradeData> {
  // There are currently no migrations for V17 deprecations.
  enabled = false;

  override visitTemplate(template: ResolvedResource): void {}
}
