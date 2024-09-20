/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';

/**
 * Component used to load the .cdk-visually-hidden styles.
 * @docs-private
 */
@Component({
  standalone: true,
  styleUrl: 'visually-hidden.css',
  exportAs: 'cdkVisuallyHidden',
  encapsulation: ViewEncapsulation.None,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class _VisuallyHiddenLoader {}
