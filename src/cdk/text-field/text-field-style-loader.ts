/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';

/** Component used to load the structural styles of the text field. */
@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: 'text-field-prebuilt.css',
  host: {'cdk-text-field-style-loader': ''},
})
export class _CdkTextFieldStyleLoader {}
