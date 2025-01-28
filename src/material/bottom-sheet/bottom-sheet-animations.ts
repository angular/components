/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  animate,
  state,
  style,
  transition,
  trigger,
  AnimationTriggerMetadata,
  group,
  query,
  animateChild,
} from '@angular/animations';

/**
 * Animations used by the Material bottom sheet.
 * @deprecated No longer used. Will be removed.
 * @breaking-change 21.0.0
 */
export const matBottomSheetAnimations: {
  readonly bottomSheetState: AnimationTriggerMetadata;
} = {
  /** Animation that shows and hides a bottom sheet. */
  bottomSheetState: trigger('state', [
    state('void, hidden', style({transform: 'translateY(100%)'})),
    state('visible', style({transform: 'translateY(0%)'})),
    transition(
      'visible => void, visible => hidden',
      group([
        animate('375ms cubic-bezier(0.4, 0, 1, 1)'),
        query('@*', animateChild(), {optional: true}),
      ]),
    ),
    transition(
      'void => visible',
      group([
        animate('195ms cubic-bezier(0, 0, 0.2, 1)'),
        query('@*', animateChild(), {optional: true}),
      ]),
    ),
  ]),
};
