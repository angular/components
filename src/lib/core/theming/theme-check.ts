import {NgModule, isDevMode} from '@angular/core';

/** Whether the theme presence has already been checked. */
let hasBeenChecked = false;

/**
 * Module that verifies that the user has loaded the core theming file,
 * without which most Material module won't work as expected.
 *
 * Note on testing methodology: A more efficient way to check for the theme
 * would be to loop through the `document.styleSheets`, however most browsers
 * don't expose the stylesheet rules, if the file was loaded from another domain.
 * This would trigger false positives if the theme is being loaded from a CDN.
 *
 * @docs-private
 */
@NgModule()
export class MdThemeCheckModule {
  constructor() {
    if (hasBeenChecked || typeof document === 'undefined' || !isDevMode()) {
      return;
    }

    let testElement = document.createElement('div');

    testElement.classList.add('md-theme-loaded-marker');
    document.body.appendChild(testElement);

    if (getComputedStyle(testElement).display !== 'none') {
      console.warn(
        'Could not find Angular Material core theme. Most Material ' +
        'components may not work as expected. For more info refer ' +
        'to the theming guide: https://github.com/angular/material2/blob/master/guides/theming.md'
      );
    }

    document.body.removeChild(testElement);
    hasBeenChecked = true;
  }
}
