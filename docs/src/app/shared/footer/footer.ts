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
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
  imports: [AppLogo],
})
export class Footer {
  year = new Date().getFullYear();
}
