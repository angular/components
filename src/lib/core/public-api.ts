/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export * from './animation/animation';
export * from './common-behaviors/index';
export * from './datetime/index';
export * from './error/error-options';
export * from './gestures/gesture-annotations';
export * from './gestures/gesture-config';
export * from './line/line';
export * from './option/index';
export * from './label/label-options';
export * from './ripple/index';
export * from './selection/index';

/**
 * @deprecated Create own month constants for application.
 * @deletion-target 8.0.0
 */
export const JAN = 0, FEB = 1, MAR = 2, MAY = 4, JUN = 5, JUL = 6, AUG = 7, SEP = 8, OCT = 9,
  NOV = 10, DEC = 11;
