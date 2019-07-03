/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  Input,
} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'mat-sitemap',
  exportAs: 'matSitemap',
  templateUrl: 'sitemap.html',
  styleUrls: ['sitemap.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatSitemap {
  @Input() menuItems = [];
}
