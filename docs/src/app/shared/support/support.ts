/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {AppLogo} from '../logo/logo';

@Component({
  selector: 'app-support',
  templateUrl: './support.html',
  styleUrls: ['./support.scss'],
  imports: [AppLogo],
})
export class Support {}
