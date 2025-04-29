/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, OnInit, inject} from '@angular/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';

import {MatAnchor} from '@angular/material/button';
import {MatRipple} from '@angular/material/core';
import {Footer} from '../../shared/footer/footer';
import {RouterLink} from '@angular/router';
import {ComponentPageTitle} from '../page-title/page-title';
import {NavigationFocus} from '../../shared/navigation-focus/navigation-focus';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';
import {GuideItems} from '../../shared/guide-items/guide-items';

import {Support} from '../../shared/support/support';
import {Carousel, CarouselItem} from '../../shared/carousel/carousel';
import {AppLogo} from '../../shared/logo/logo';

const TOP_COMPONENTS = ['datepicker', 'input', 'slide-toggle', 'slider', 'button'];

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.html',
  styleUrls: ['./homepage.scss'],
  imports: [
    NavigationFocus,
    MatAnchor,
    RouterLink,
    MatDivider,
    MatIcon,
    Carousel,
    CarouselItem,
    MatCard,
    MatCardTitle,
    MatCardContent,
    Support,
    Footer,
    AppLogo,
    MatRipple,
  ],
  host: {
    'class': 'main-content',
    '[class.animations-disabled]': 'animationsDisabled',
  },
})
export class Homepage implements OnInit {
  _componentPageTitle = inject(ComponentPageTitle);
  guideItems = inject(GuideItems);

  readonly animationsDisabled: boolean;

  constructor() {
    const animationsModule = inject(ANIMATION_MODULE_TYPE, {optional: true});

    this.animationsDisabled = animationsModule === 'NoopAnimations';
  }

  ngOnInit(): void {
    this._componentPageTitle.title = '';
  }

  getTopComponents(): string[] {
    return TOP_COMPONENTS;
  }
}
