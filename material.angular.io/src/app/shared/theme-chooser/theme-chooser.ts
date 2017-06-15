import {Component, ViewEncapsulation, ChangeDetectionStrategy} from '@angular/core';
import {StyleManager} from '../style-manager/style-manager';
import {ThemeStorage, DocsSiteTheme} from './theme-storage/theme-storage';


@Component({
  selector: 'theme-chooser',
  templateUrl: 'theme-chooser.html',
  styleUrls: ['theme-chooser.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { 'aria-hidden': 'true' },
})
export class ThemeChooser {
  currentTheme;

  themes = [
    {
      primary: '#673AB7',
      accent: '#FFC107',
      href: 'deeppurple-amber.css',
      isDark: false,
    },
    {
      primary: '#3F51B5',
      accent: '#E91E63',
      href: 'indigo-pink.css',
      isDark: false,
    },
    {
      primary: '#E91E63',
      accent: '#607D8B',
      href: 'pink-bluegrey.css',
      isDark: true,
    },
    {
      primary: '#9C27B0',
      accent: '#4CAF50',
      href: 'purple-green.css',
      isDark: true,
    },
  ];

  constructor(
    public styleManager : StyleManager,
    private _themeStorage: ThemeStorage
  ) {
    const currentTheme = this._themeStorage.getStoredTheme();
    if (currentTheme) {
      this.installTheme(currentTheme.href);
    }
  }

  installTheme(href: string) {
    this.currentTheme = this._getCurrentThemeFromHref(href);
    this.styleManager.setStyle('theme', `assets/${href}`);
    if (this.currentTheme) {
      this._themeStorage.storeTheme(this.currentTheme);
    }
  }

  private _getCurrentThemeFromHref(href: string): DocsSiteTheme {
    return this.themes.find(theme => theme.href === href);
  }
}
