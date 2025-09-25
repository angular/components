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

let reducedMotion: boolean | null = null;

/**
 * Gets the the configured animations state.
 * @docs-private
 */
export function _getAnimationsState(): 'enabled' | 'di-disabled' | 'reduced-motion' {
  if (
    inject(MATERIAL_ANIMATIONS, {optional: true})?.animationsDisabled ||
    inject(ANIMATION_MODULE_TYPE, {optional: true}) === 'NoopAnimations'
  ) {
    return 'di-disabled';
  }

  reducedMotion ??= inject(MediaMatcher).matchMedia('(prefers-reduced-motion)').matches;
  return reducedMotion ? 'reduced-motion' : 'enabled';
}

/**
 * Returns whether animations have been disabled by DI. Must be called in a DI context.
 * @docs-private
 */
export function _animationsDisabled(): boolean {
  return _getAnimationsState() !== 'enabled';
}
