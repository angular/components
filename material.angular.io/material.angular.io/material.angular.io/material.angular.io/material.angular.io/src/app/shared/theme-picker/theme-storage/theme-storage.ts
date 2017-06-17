import {Injectable, EventEmitter} from '@angular/core';

export interface DocsSiteTheme {
  href: string;
  accent: string;
  primary: string;
  isDark?: boolean;
  isDefault?: boolean;
};


@Injectable()
export class ThemeStorage {
  static storageKey = 'docs-theme-storage-current';

  public onThemeUpdate: EventEmitter<DocsSiteTheme> = new EventEmitter<DocsSiteTheme>();

  public storeTheme(theme: DocsSiteTheme) {
    window.localStorage[ThemeStorage.storageKey] = JSON.stringify(theme);
    this.onThemeUpdate.emit(theme);
  }

  public getStoredTheme(): DocsSiteTheme {
    const theme = JSON.parse(window.localStorage[ThemeStorage.storageKey] || null);
    return theme
  }

  public clearStorage() {
    window.localStorage.removeItem(ThemeStorage.storageKey);
  }
}
