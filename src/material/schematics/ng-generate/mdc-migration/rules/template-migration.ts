/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Migration, ResolvedResource} from '@angular/cdk/schematics';
import {SchematicContext} from '@angular-devkit/schematics';
import {parseTemplate} from './tree-traversal';
import {ComponentMigrator} from '.';
import {Update, writeUpdates} from '../../../migration-utilities';

export class TemplateMigration extends Migration<ComponentMigrator[], SchematicContext> {
  enabled = true;

  override visitTemplate(template: ResolvedResource) {
    this.fileSystem
      .edit(template.filePath)
      .remove(template.start, template.content.length)
      .insertRight(template.start, this.migrate(template.content, template.filePath));
  }

  migrate(template: string, templateUrl?: string): string {
    const ast = parseTemplate(template, templateUrl);
    const migrators = this.upgradeData.filter(m => m.template).map(m => m.template!);
    const updates: Update[] = [];
    migrators.forEach(m => {
      try {
        updates.push(...m.getUpdates(ast));
      } catch (error: any) {
        this.logger.error(`${error}`);
        if (error instanceof Error) {
          this.logger.error(`${error.stack}`);
        }
        this.logger.warn(`Failed to process template: ${templateUrl} (see error above).`);
      }
    });

    return writeUpdates(template, updates);
  }
}
