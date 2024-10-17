/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {MatListBase} from './list-base';

@Component({
  selector: 'mat-action-list',
  exportAs: 'matActionList',
  template: '<ng-content></ng-content>',
  host: {
    'class': 'mat-mdc-action-list mat-mdc-list-base mdc-list',
    'role': 'group',
  },
  styleUrl: 'list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{provide: MatListBase, useExisting: MatActionList}],
})
export class MatActionList extends MatListBase {
  // An navigation list is considered interactive, but does not extend the interactive list
  // base class. We do this because as per MDC, items of interactive lists are only reachable
  // through keyboard shortcuts. We want all items for the navigation list to be reachable
  // through tab key as we do not intend to provide any special accessibility treatment. The
  // accessibility treatment depends on how the end-user will interact with it.
  override _isNonInteractive = false;
}
