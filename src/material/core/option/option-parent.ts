/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken, Signal} from '@angular/core';

/**
 * Describes a parent component that manages a list of options.
 * Contains properties that the options can inherit.
 * @nodoc
 */
export interface MatOptionParentComponent {
  disableRipple?: boolean | Signal<boolean>;
  multiple?: boolean;
  inertGroups?: boolean;
  hideSingleSelectionIndicator?: boolean;
}

/**
 * Injection token used to provide the parent component to options.
 */
export const MAT_OPTION_PARENT_COMPONENT = new InjectionToken<MatOptionParentComponent>(
  'MAT_OPTION_PARENT_COMPONENT',
);
