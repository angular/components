/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation, inject} from '@angular/core';
import {StyleManager} from '../style-manager';
import {DocsSiteTheme, ThemeStorage} from './theme-storage/theme-storage';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatTooltip} from '@angular/material/tooltip';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {map} from 'rxjs/operators';
import {LiveAnnouncer} from '@angular/cdk/a11y';

@Component({
  selector: 'theme-picker',
  templateUrl: 'theme-picker.html',
  styleUrls: ['theme-picker.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [MatIconButton, MatTooltip, MatMenu, MatMenuItem, MatMenuTrigger, MatIcon],
})
export class ThemePicker {
  readonly styleManager = inject(StyleManager);
  private readonly _themeStorage = inject(ThemeStorage);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _liveAnnouncer = inject(LiveAnnouncer);

  currentTheme: DocsSiteTheme | undefined;

  // The below colors need to align with the themes defined in theme-picker.scss
  themes: DocsSiteTheme[] = [
    {
      color: '#ffd9e1',
      displayName: 'Rose & Red',
      name: 'rose-red',
      background: '#fffbff',
    },
    {
      color: '#d7e3ff',
      displayName: 'Azure & Blue',
      name: 'azure-blue',
      background: '#fdfbff',
      isDefault: true,
    },
    {
      color: '#810081',
      displayName: 'Magenta & Violet',
      name: 'magenta-violet',
      background: '#1e1a1d',
    },
    {
      color: '#004f4f',
      displayName: 'Cyan & Orange',
      name: 'cyan-orange',
      background: '#191c1c',
    },
  ];

  constructor() {
    this._activatedRoute.queryParamMap
      .pipe(
        map((params: ParamMap) => params.get('theme')),
        takeUntilDestroyed(),
      )
      .subscribe((themeName: string | null) => {
        if (themeName) {
          this.selectTheme(themeName);
        }
      });

    const themeName = this._themeStorage.getStoredThemeName();
    if (themeName) {
      this.selectTheme(themeName);
    } else {
      this.themes.find(themes => {
        if (themes.isDefault === true) {
          this.selectTheme(themes.name);
        }
      });
    }
  }

  selectTheme(themeName: string) {
    const theme =
      this.themes.find(currentTheme => currentTheme.name === themeName) ||
      this.themes.find(currentTheme => currentTheme.isDefault)!;

    this.currentTheme = theme;

    if (theme.isDefault) {
      this.styleManager.removeStyle('theme');
    } else {
      this.styleManager.setStyle('theme', `${theme.name}.css`);
    }

    if (this.currentTheme) {
      this._liveAnnouncer.announce(`${theme.displayName} theme selected.`, 'polite', 3000);
      this._themeStorage.storeTheme(this.currentTheme);
    }
  }
}
