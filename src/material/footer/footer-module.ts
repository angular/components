/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NgModule} from '@angular/core';
import {MatFooter} from './footer';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';


@NgModule({
    imports: [CommonModule, RouterModule],
    exports: [MatFooter],
    declarations: [MatFooter]
})
export class MatFooterModule {}
