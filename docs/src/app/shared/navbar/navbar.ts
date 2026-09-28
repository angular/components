/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {MatButton, MatIconButton} from '@angular/material/button';
import {RouterLink, RouterLinkActive} from '@angular/router';

import {SECTIONS} from '../documentation-items/documentation-items';
import {NavigationFocusService} from '../navigation-focus/navigation-focus.service';
import {ThemePicker} from '../theme-picker/theme-picker';
import {VersionPicker} from '../version-picker/version-picker';
import {AppLogo} from '../logo/logo';

const SECTIONS_KEYS = Object.keys(SECTIONS);

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatButton,
    MatIconButton,
    RouterLink,
    RouterLinkActive,
    VersionPicker,
    ThemePicker,
    AppLogo,
    NgTemplateOutlet,
  ],
})
export class NavBar {
  private _navigationFocusService = inject(NavigationFocusService);

  isNextVersion = location.hostname === 'next.material.angular.dev';
  skipLinkHref: string | null | undefined;
  skipLinkHidden = true;

  constructor() {
    setTimeout(() => (this.skipLinkHref = this._navigationFocusService.getSkipLinkHref()), 100);
  }

  get sections() {
    return SECTIONS;
  }

  get sectionKeys() {
    return SECTIONS_KEYS;
  }
}
