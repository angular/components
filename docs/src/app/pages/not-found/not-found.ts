/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {MatAnchor} from '@angular/material/button';
import {Footer} from '../../shared/footer/footer';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.html',
  styleUrls: ['./not-found.scss'],
  imports: [MatAnchor, RouterLink, Footer],
  host: {
    'class': 'main-content',
  },
})
export class NotFound {}
