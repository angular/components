/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core';


/**
 * Fixed header that will be rendered above a select's options.
 */
@Directive({
  selector: 'md-select-header, mat-select-header',
  host: {
    'class': 'mat-select-header',
  }
})
export class MdSelectHeader { }
