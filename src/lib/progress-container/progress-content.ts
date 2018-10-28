/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ChangeDetectionStrategy, Component, Host, ViewEncapsulation} from '@angular/core';
import {MatProgress} from './progress-directive';

@Component({
  moduleId: module.id,
  selector: 'mat-progress-content',
  template: '<ng-content></ng-content>',
  host: {
    '[attr.aria-hidden]': '_showProgress',
    '[class.mat-progress]': '_showProgress',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatProgressContent {
  /** @docs-private */
  get _showProgress(): boolean {
    return this._progressDirective.showProgress;
  }

  constructor(@Host() private _progressDirective: MatProgress) {}
}
