/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'tailwind-layer-e2e',
  template: `
    <button
      id="tailwind-utility-button"
      class="tw-bg-lime-500"
      mat-flat-button>
      Tailwind utility should win
    </button>
    <button
      id="unlayered-utility-button"
      class="tw-bg-fuchsia-unlayered"
      mat-flat-button>
      Unlayered utility control
    </button>
  `,
  imports: [MatButtonModule],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class TailwindLayerE2e {}
