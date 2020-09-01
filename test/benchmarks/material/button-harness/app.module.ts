/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {MatButtonModule} from '@angular/material/button';
<<<<<<< HEAD
<<<<<<< HEAD
import {NUM_BUTTONS} from './constants';

/** component: mat-button-harness-test */
<<<<<<< HEAD

@Component({
  selector: 'app-root',
  template: `
    <button *ngFor="let val of vals" mat-button> {{ val }} </button>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['//src/material/core/theming/prebuilt/indigo-pink.css'],
})
export class ButtonHarnessTest {
  vals = Array.from({ length: NUM_BUTTONS }, (_, i) => i);
=======
=======
import {NUM_BUTTONS} from './constants';
>>>>>>> 72a4ae020 (fixup! test(button-harness): add performance tests for buttons using the protractor harness env)

/** component: mat-raised-button-harness-test */
=======
>>>>>>> bf160e8de (fixup! test(button-harness): add performance tests for buttons using the protractor harness env)

@Component({
  selector: 'app-root',
  template: `
    <button *ngFor="let val of vals" mat-button> {{ val }} </button>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['//src/material/core/theming/prebuilt/indigo-pink.css'],
})
export class ButtonHarnessTest {
<<<<<<< HEAD
	vals = Array.from({ length: 100 }, (_, i) => i);
>>>>>>> e2db57750 (test(button-harness): add performance tests for buttons using the protractor harness env)
=======
  vals = Array.from({ length: NUM_BUTTONS }, (_, i) => i);
>>>>>>> 72a4ae020 (fixup! test(button-harness): add performance tests for buttons using the protractor harness env)
}

@NgModule({
  declarations: [ButtonHarnessTest],
  imports: [
    BrowserModule,
    MatButtonModule,
  ],
  bootstrap: [ButtonHarnessTest],
})
export class AppModule {}
