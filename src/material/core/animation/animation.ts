/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

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
