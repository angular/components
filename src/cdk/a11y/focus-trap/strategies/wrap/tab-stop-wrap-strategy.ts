/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConfigurableFocusTrap} from '../../configurable-focus-trap';
import {FocusTrapWrapStrategy} from './wrap-strategy';

/**
 * Legacy FocusTrapWrapStrategy that adds hidden tab stops before and after the
 * FocusTrap elements.
 */
export class TabStopFocusTrapWrapStrategy implements FocusTrapWrapStrategy {
  /**
   * Adds hidden tab stops, unless config.defer is true, in which case attachAnchors
   * will be called manually.
   */
  init(focusTrap: ConfigurableFocusTrap): void {
    if (!focusTrap._config.defer) {
      focusTrap.attachAnchors();
    }
  }

  /** Sets tabindex=0 on the hidden tab stops, so that they will trap focus. */
  trapTab(focusTrap: ConfigurableFocusTrap): void {
    focusTrap._toggleAnchors(true);
  }

  /** Sets tabindex=-1 on the hidden tab stops, so they will allow focus to escape. */
  allowTabEscape(focusTrap: ConfigurableFocusTrap): void {
    focusTrap._toggleAnchors(false);
  }
}
