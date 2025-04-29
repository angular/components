import {Component, OnDestroy, inject} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {MatButton, MatIconButton} from '@angular/material/button';
import {RouterLink, RouterLinkActive} from '@angular/router';

import {SECTIONS} from '../documentation-items/documentation-items';
import {Subscription} from 'rxjs';
import {NavigationFocusService} from '../navigation-focus/navigation-focus.service';
import {ThemePicker} from '../theme-picker/theme-picker';
import {VersionPicker} from '../version-picker/version-picker';
import {AppLogo} from '../logo/logo';

const SECTIONS_KEYS = Object.keys(SECTIONS);

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
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
export class NavBar implements OnDestroy {
  private _navigationFocusService = inject(NavigationFocusService);

  private _subscriptions = new Subscription();
  isNextVersion = location.hostname === 'next.material.angular.io';
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

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }
}
