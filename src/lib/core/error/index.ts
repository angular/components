/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {NgModule} from '@angular/core';
import {MdError} from './error';
import {ErrorOptions} from './error-options';

@NgModule({
  declarations: [MdError],
  exports: [MdError],
  providers: [ErrorOptions],
})
export class MdErrorModule {}


export * from './error';
export * from './error-options';
