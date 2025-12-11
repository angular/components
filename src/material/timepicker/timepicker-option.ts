/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, TemplateRef, inject} from '@angular/core';
import {MatTimepickerOption} from './util';

/** Template to be used to override the timepicker's option labels. */
@Directive({
  selector: 'ng-template[matTimepickerOption]',
})
export class MatTimepickerOptionTemplate<D> {
  readonly template = inject<TemplateRef<MatTimepickerOption<D>>>(TemplateRef);
}
