/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {MatTooltip} from '@angular/material/tooltip';

/** Shows the deprecation message for a specific field as a tooltip. */
@Component({
  selector: 'deprecated-field',
  template: `<div class="deprecated-content" [matTooltip]="message"></div>`,
  imports: [MatTooltip],
})
export class DeprecatedFieldComponent {
  /** Message regarding the deprecation  */
  message = '';
}
