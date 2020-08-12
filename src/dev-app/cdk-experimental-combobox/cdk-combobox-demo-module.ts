/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {CdkComboboxModule} from '@angular/cdk-experimental/combobox';
// import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CdkComboboxDemo} from './cdk-combobox-demo';
import {PanelContent} from './panel-content';

@NgModule({
    imports: [
        CdkComboboxModule,
        CommonModule,
        RouterModule.forChild([{path: '', component: CdkComboboxDemo}]),
    ],
    declarations: [CdkComboboxDemo, PanelContent],
})
export class CdkComboboxDemoModule {}
