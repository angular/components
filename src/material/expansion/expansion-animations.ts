/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  animate,
  AnimationTriggerMetadata,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

/** Time and timing curve for expansion panel animations. */
// Note: Keep this in sync with the Sass variable for the panel header animation.
export const EXPANSION_PANEL_ANIMATION_TIMING = '225ms cubic-bezier(0.4,0.0,0.2,1)';

/**
 * Animations used by the Material expansion panel.
 *
 * A bug in angular animation's `state` when ViewContainers are moved using ViewContainerRef.move()
 * causes the animation state of moved components to become `void` upon exit, and not update again
 * upon reentry into the DOM. This can lead a to situation for the expansion panel where the state
 * of the panel is `expanded` or `collapsed` but the animation state is `void`.
 *
 * To correctly handle animating to the next state, we animate between `void` and `collapsed` which
 * are defined to have the same styles. Since angular animates from the current styles to the
 * destination state's style definition, in situations where we are moving from `void`'s styles to
 * `collapsed` this acts a noop since no style values change.
 *
 * In the case where angular's animation state is out of sync with the expansion panel's state, the
 * expansion panel being `expanded` and angular animations being `void`, the animation from the
 * `expanded`'s effective styles (though in a `void` animation state) to the collapsed state will
 * occur as expected.
 *
 * Angular Bug: https://github.com/angular/angular/issues/18847
 *
 * @docs-private
 */
export const matExpansionAnimations: {
  readonly indicatorRotate: AnimationTriggerMetadata;
  readonly bodyExpansion: AnimationTriggerMetadata;
} = {
  /** Animation that rotates the indicator arrow. */
  indicatorRotate: trigger('indicatorRotate', [
    state('collapsed, void', style({transform: 'rotate(0deg)'})),
    state('expanded', style({transform: 'rotate(180deg)'})),
    transition(
      'expanded <=> collapsed, void => collapsed',
      animate(EXPANSION_PANEL_ANIMATION_TIMING),
    ),
  ]),
  /** Animation that expands and collapses the panel content. */
  bodyExpansion: trigger('bodyExpansion', [
    state('collapsed, void', style({height: '0px', visibility: 'hidden'})),
    // Clear the `visibility` while open, otherwise the content will be visible when placed in
    // a parent that's `visibility: hidden`, because `visibility` doesn't apply to descendants
    // that have a `visibility` of their own (see #27436).
    state('expanded', style({height: '*', visibility: ''})),
    transition(
      'expanded <=> collapsed, void => collapsed',
      animate(EXPANSION_PANEL_ANIMATION_TIMING),
    ),
  ]),
};
