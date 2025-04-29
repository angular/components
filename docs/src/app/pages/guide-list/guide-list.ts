/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, OnInit, inject} from '@angular/core';
import {GuideItems} from '../../shared/guide-items/guide-items';
import {RouterLink} from '@angular/router';
import {Footer} from '../../shared/footer/footer';
import {NavigationFocus} from '../../shared/navigation-focus/navigation-focus';
import {ComponentPageTitle} from '../page-title/page-title';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {MatRipple} from '@angular/material/core';

@Component({
  selector: 'app-guides',
  templateUrl: './guide-list.html',
  styleUrls: ['./guide-list.scss'],
  imports: [NavigationFocus, RouterLink, MatCard, MatCardTitle, MatCardContent, Footer, MatRipple],
  host: {
    'class': 'main-content',
  },
})
export class GuideList implements OnInit {
  guideItems = inject(GuideItems);
  _componentPageTitle = inject(ComponentPageTitle);

  ngOnInit(): void {
    this._componentPageTitle.title = 'Guides';
  }
}
