/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {MainComponent} from './main-component';
import {SubComponent} from './sub-component';

@NgModule({
  imports: [FormsModule, BrowserModule],
  declarations: [MainComponent, SubComponent],
  exports: [MainComponent],
  bootstrap: [MainComponent],
})

export class TestAppModule {
}
