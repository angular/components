/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';

@Component({
  selector: 'app-logo',
  styleUrl: 'logo.scss',
  templateUrl: './logo.html',
  host: {
    'aria-hidden': 'true',
  },
})
export class AppLogo {}
