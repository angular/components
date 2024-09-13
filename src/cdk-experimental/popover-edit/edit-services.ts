/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, NgZone, inject} from '@angular/core';
import {FocusTrapFactory} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {Overlay} from '@angular/cdk/overlay';
import {ScrollDispatcher, ViewportRuler} from '@angular/cdk/scrolling';

import {EditEventDispatcher} from './edit-event-dispatcher';
import {FocusDispatcher} from './focus-dispatcher';
import {EditRef} from './edit-ref';

/**
 * Optimization
 * Collects multiple Injectables into a singleton shared across the table. By reducing the
 * number of services injected into each CdkPopoverEdit, this saves about 0.023ms of cpu time
 * and 56 bytes of memory per instance.
 */
@Injectable()
export class EditServices {
  readonly directionality = inject(Directionality);
  readonly editEventDispatcher = inject<EditEventDispatcher<EditRef<unknown>>>(EditEventDispatcher);
  readonly focusDispatcher = inject(FocusDispatcher);
  readonly focusTrapFactory = inject(FocusTrapFactory);
  readonly ngZone = inject(NgZone);
  readonly overlay = inject(Overlay);
  readonly scrollDispatcher = inject(ScrollDispatcher);
  readonly viewportRuler = inject(ViewportRuler);
}
