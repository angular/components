import {Injectable, EventEmitter} from '@angular/core';

export interface DocsSiteTheme {
  href: string;
  accent: string;
  primary: string;
  isDark?: boolean;
  isDefault?: boolean;
}


@Injectable()
export class ThemeStorage {
  static storageKey = 'docs-theme-storage-current';

  public onThemeUpdate: EventEmitter<DocsSiteTheme> = new EventEmitter<DocsSiteTheme>();

  public storeTheme(theme: DocsSiteTheme) {
    try {
      window.localStorage[ThemeStorage.storageKey] = JSON.stringify(theme);
    } catch (e) { }

    this.onThemeUpdate.emit(theme);
  }

  public getStoredTheme(): DocsSiteTheme {
    try {
      return JSON.parse(window.localStorage[ThemeStorage.storageKey] || null);
    } catch (e) {
      return null;
    }
  }

  public clearStorage() {
    try {
      window.localStorage.removeItem(ThemeStorage.storageKey);
    } catch (e) { }
  }
}
