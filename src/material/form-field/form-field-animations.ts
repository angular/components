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
} from '@angular/animations';

/**
 * Animations used by the MatFormField.
 * @docs-private
 * @deprecated No longer used, will be removed.
 * @breaking-change 21.0.0
 */
export const matFormFieldAnimations: {
  readonly transitionMessages: AnimationTriggerMetadata;
} = {
  /** Animation that transitions the form field's error and hint messages. */
  transitionMessages: trigger('transitionMessages', [
    // TODO(mmalerba): Use angular animations for label animation as well.
    state('enter', style({opacity: 1, transform: 'translateY(0%)'})),
    transition('void => enter', [
      style({opacity: 0, transform: 'translateY(-5px)'}),
      animate('300ms cubic-bezier(0.55, 0, 0.55, 0.2)'),
    ]),
  ]),
};
