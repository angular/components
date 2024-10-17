/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Home component which includes a welcome message for the dev-app. */
import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  template: `
    <p>Welcome to the development demos for Angular Material!</p>
    <p>Open the sidenav to select a demo.</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevAppHome {}
