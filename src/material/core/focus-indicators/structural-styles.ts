/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';

/**
 * Component used to load structural styles for focus indicators.
 * @docs-private
 */
@Component({
  standalone: true,
  selector: 'structural-styles',
  styleUrl: 'structural-styles.css',
  encapsulation: ViewEncapsulation.None,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class _StructuralStylesLoader {}
