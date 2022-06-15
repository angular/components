/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Platform} from '@angular/cdk/platform';
import {DOCUMENT} from '@angular/common';
import {Inject, Injectable} from '@angular/core';

/** Set of possible high-contrast mode backgrounds. */
export const enum HighContrastMode {
  NONE,
  ACTIVE,
  BLACK_ON_WHITE /** DEPRECATED */,
  WHITE_ON_BLACK /** DEPRECATED */,
}

/**
 * DEPRECATED
 *
 * CSS class applied to the document body when in black-on-white high-contrast mode.
 */
export const BLACK_ON_WHITE_CSS_CLASS = 'cdk-high-contrast-black-on-white';

/**
 * DEPRECATED
 *
 * CSS class applied to the document body when in white-on-black high-contrast mode.
 */
export const WHITE_ON_BLACK_CSS_CLASS = 'cdk-high-contrast-white-on-black';

/** CSS class applied to the document body when in high-contrast mode. */
export const HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS = 'cdk-high-contrast-active';

/**
 * Service to determine whether the browser is currently in a high-contrast-mode environment.
 *
 * Microsoft Windows supports an accessibility feature called "High Contrast Mode". This mode
 * changes the appearance of all applications, including web applications, to dramatically increase
 * contrast.
 *
 * IE, Edge, and Firefox currently support this mode. Chrome does not support Windows High Contrast
 * Mode. This service does not detect high-contrast mode as added by the Chrome "High Contrast"
 * browser extension.
 */
@Injectable({providedIn: 'root'})
export class HighContrastModeDetector {
  /**
   * Figuring out the high contrast mode and adding the body classes can cause
   * some expensive layouts. This flag is used to ensure that we only do it once.
   */
  private _document: Document;

  private _isHighContrastQuery: MediaQueryList;

  constructor(private _platform: Platform, @Inject(DOCUMENT) document: any) {
    this._document = document;

    const _window: Window = this._document.defaultView || window;
    this._isHighContrastQuery = _window.matchMedia('(forced-colors: active)');
  }

  /** Gets the current high-contrast-mode for the page. */
  getHighContrastMode(): HighContrastMode {
    if (this._platform.isBrowser && this._isHighContrastQuery.matches) {
      return HighContrastMode.ACTIVE;
    }
    return HighContrastMode.NONE;
  }

  _unsubscribeFromMediaChanges(): void {
    this._isHighContrastQuery.removeListener(this._setBodyCssClasses);
  }

  /** Applies CSS classes indicating high-contrast mode to document listens for changes to
   * `forced-colors` and updates CSS classes if high contrast mode is enabled or disabled
   * (browser-only). */
  _applyBodyHighContrastModeCssClasses(): void {
    if (this._platform.isBrowser) {
      this._isHighContrastQuery.addListener(this._setBodyCssClasses.bind(this));
      this._setBodyCssClasses();
    }
  }

  /** Applies CSS classes indicating high-contrast mode to document body (browser-only). */
  private _setBodyCssClasses(): void {
    if (this._platform.isBrowser && this._document.body) {
      const bodyClasses = this._document.body.classList;
      bodyClasses.remove(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS);

      const mode = this.getHighContrastMode();
      if (mode === HighContrastMode.ACTIVE) {
        bodyClasses.add(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS);
      }
    }
  }
}
