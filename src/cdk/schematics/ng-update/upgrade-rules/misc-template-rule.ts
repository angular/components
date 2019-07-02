/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ResolvedResource} from '../../update-tool/component-resource-collector';
import {MigrationRule} from '../../update-tool/migration-rule';
import {findAllSubstringIndices} from '../typescript/literal';
import {RuleUpgradeData} from '../upgrade-data';

/**
 * Rule that walks through every template and reports if there are
 * instances of outdated Angular CDK API that can't be migrated automatically.
 */
export class MiscTemplateRule extends MigrationRule<RuleUpgradeData> {
  visitTemplate(template: ResolvedResource): void {
    findAllSubstringIndices(template.content, 'cdk-focus-trap').forEach(offset => {
      this.failures.push({
        filePath: template.filePath,
        position: template.getCharacterAndLineOfPosition(template.start + offset),
        message: `Found deprecated element selector "cdk-focus-trap" which has been ` +
            `changed to an attribute selector "[cdkTrapFocus]".`
      });
    });
  }
}
