/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';
import {FocusableOption} from '@angular/cdk/a11y';
import {Subject} from 'rxjs';

/** Injection token used to return classes implementing the Menu interface */
export const CDK_MENU = new InjectionToken<Menu>('cdk-menu');

/** Interface which specifies Menu operations and used to break circular dependency issues */
export interface Menu {
  /** The orientation of the menu */
  orientation: 'horizontal' | 'vertical';

  /** Place focus on the first MenuItem in the menu. */
  focusFirstItem(): void;

  /** Place focus on the last MenuItem in the menu. */
  focusLastItem(): void;

  /** Place focus on the given MenuItem in the menu. */
  focusItem(child: FocusableOption): void;

  /** Get an emitter which emits bubbled-up keyboard events from the keyboard manager. */
  _getBubbledKeyboardEvents(): Subject<KeyboardEvent> | undefined;
}
