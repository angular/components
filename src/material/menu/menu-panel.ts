/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FocusOrigin} from '@angular/cdk/a11y';
import {Direction} from '@angular/cdk/bidi';
import {EventEmitter, InjectionToken, TemplateRef} from '@angular/core';
import {MatMenuContent} from './menu-content';
import {MenuPositionX, MenuPositionY} from './menu-positions';

/**
 * Injection token used to provide the parent menu to menu-specific components.
 * @nodoc
 */
export const MAT_MENU_PANEL = new InjectionToken<MatMenuPanel>('MAT_MENU_PANEL');

/**
 * Interface for a custom menu panel that can be used with `matMenuTriggerFor`.
 * @nodoc
 */
export interface MatMenuPanel<T = any> {
  xPosition: MenuPositionX;
  yPosition: MenuPositionY;
  overlapTrigger: boolean;
  templateRef: TemplateRef<any>;
  readonly close: EventEmitter<void | 'click' | 'keydown' | 'tab'>;
  parentMenu?: MatMenuPanel | undefined;
  direction?: Direction;
  focusFirstItem: (origin?: FocusOrigin) => void;
  resetActiveItem: () => void;
  setPositionClasses?: (x: MenuPositionX, y: MenuPositionY) => void;

  /**
   * @deprecated No longer used and will be removed.
   * @breaking-change 21.0.0
   */
  setElevation?(depth: number): void;
  lazyContent?: MatMenuContent;
  backdropClass?: string;
  overlayPanelClass?: string | string[];
  hasBackdrop?: boolean;
  readonly panelId?: string;

  /**
   * @deprecated To be removed.
   * @breaking-change 8.0.0
   */
  addItem?: (item: T) => void;

  /**
   * @deprecated To be removed.
   * @breaking-change 8.0.0
   */
  removeItem?: (item: T) => void;
}
