/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {MediaMatcher} from '@angular/cdk/layout';
import {ANIMATION_MODULE_TYPE, inject, InjectionToken} from '@angular/core';

/** Object used to configure the animation in Angular Material. */
export interface AnimationsConfig {
  /** Whether all animations should be disabled. */
  animationsDisabled?: boolean;
}

/** Injection token used to configure the animations in Angular Material. */
export const MATERIAL_ANIMATIONS = new InjectionToken<AnimationsConfig>('MATERIAL_ANIMATIONS');

/**
 * @deprecated No longer used, will be removed.
 * @breaking-change 21.0.0
 * @docs-private
 */
export class AnimationCurves {
  static STANDARD_CURVE = 'cubic-bezier(0.4,0.0,0.2,1)';
  static DECELERATION_CURVE = 'cubic-bezier(0.0,0.0,0.2,1)';
  static ACCELERATION_CURVE = 'cubic-bezier(0.4,0.0,1,1)';
  static SHARP_CURVE = 'cubic-bezier(0.4,0.0,0.6,1)';
}

/**
 * @deprecated No longer used, will be removed.
 * @breaking-change 21.0.0
 * @docs-private
 */
export class AnimationDurations {
  static COMPLEX = '375ms';
  static ENTERING = '225ms';
  static EXITING = '195ms';
}

/**
 * Returns whether animations have been disabled by DI. Must be called in a DI context.
 * @docs-private
 */
export function _animationsDisabled(): boolean {
  if (
    inject(MATERIAL_ANIMATIONS, {optional: true})?.animationsDisabled ||
    inject(ANIMATION_MODULE_TYPE, {optional: true}) === 'NoopAnimations'
  ) {
    return true;
  }

  const mediaMatcher = inject(MediaMatcher);
  return mediaMatcher.matchMedia('(prefers-reduced-motion)').matches;
}
