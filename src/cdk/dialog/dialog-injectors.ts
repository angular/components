/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken, Injector, inject} from '@angular/core';
import {createBlockScrollStrategy, ScrollStrategy} from '../overlay';
import {DialogConfig} from './dialog-config';

/** Injection token for the Dialog's ScrollStrategy. */
export const DIALOG_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>(
  'DialogScrollStrategy',
  {
    providedIn: 'root',
    factory: () => {
      const injector = inject(Injector);
      return () => createBlockScrollStrategy(injector);
    },
  },
);

/** Injection token for the Dialog's Data. */
export const DIALOG_DATA = new InjectionToken<any>('DialogData');

/** Injection token that can be used to provide default options for the dialog module. */
export const DEFAULT_DIALOG_CONFIG = new InjectionToken<DialogConfig>('DefaultDialogConfig');
