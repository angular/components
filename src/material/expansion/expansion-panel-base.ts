/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CdkAccordionItem} from '@angular/cdk/accordion';
import {InjectionToken} from '@angular/core';

/**
 * Base interface for a `MatExpansionPanel`.
 * @nodoc
 */
export interface MatExpansionPanelBase extends CdkAccordionItem {
  /** Whether the toggle indicator should be hidden. */
  hideToggle: boolean;
}

/**
 * Token used to provide a `MatExpansionPanel` to `MatExpansionPanelContent`.
 * Used to avoid circular imports between `MatExpansionPanel` and `MatExpansionPanelContent`.
 */
export const MAT_EXPANSION_PANEL = new InjectionToken<MatExpansionPanelBase>('MAT_EXPANSION_PANEL');
