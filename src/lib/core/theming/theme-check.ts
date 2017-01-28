import {NgModule, isDevMode} from '@angular/core';

/**
 * Module that verifies that the user has loaded the core theming file,
 * without which most Material module won't work as expected.
 * @docs-private
 */
@NgModule()
export class MdThemeCheckModule {
  constructor() {
    if (!isDevMode() || typeof document === 'undefined') {
      return;
    }

    for (let i = 0; i < document.styleSheets.length; i++) {
      // The try/catch is needed, because some browsers can throw a security
      // error when accessing the `cssRules` from another domain.
      try {
        let rules = (document.styleSheets.item(i) as CSSStyleSheet).cssRules;

        if (rules) {
          for (let j = 0; j < rules.length; j++) {
            let selector = (rules.item(j) as CSSStyleRule).selectorText;

            if (selector && selector.includes('.md-theme-loaded-marker')) {
              return;
            }
          }
        }
      } catch (e) { }
    }

    console.warn(
      'Could not find Angular Material core theme. Most Material ' +
      'components may not work as expected. For more info refer ' +
      'to the theming guide: https://github.com/angular/material2/blob/master/guides/theming.md'
    );
  }
}
