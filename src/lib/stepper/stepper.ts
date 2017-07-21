/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkStepper} from '@angular/cdk';
import {
  // This import is only used to define a generic type. The current TypeScript version incorrectly
  // considers such imports as unused (https://github.com/Microsoft/TypeScript/issues/14953)
  // tslint:disable-next-line:no-unused-variable
  ElementRef,
  QueryList,
  ViewChildren
}from '@angular/core';

export class MdStepper extends CdkStepper {
  @ViewChildren('stepHeader') _stepHeader: QueryList<ElementRef>;
}
