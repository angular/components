/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Animations used by the Material drawers.
 * @nodoc
 * @deprecated No longer used, will be removed.
 * @breaking-change 21.0.0
 */
export const matDrawerAnimations: {
  readonly transformDrawer: any;
} = {
  // Represents
  // trigger('transform', [
  //   // We remove the `transform` here completely, rather than setting it to zero, because:
  //   // 1. Having a transform can cause elements with ripples or an animated
  //   //    transform to shift around in Chrome with an RTL layout (see #10023).
  //   // 2. 3d transforms causes text to appear blurry on IE and Edge.
  //   state(
  //     'open, open-instant',
  //     style({
  //       'transform': 'none',
  //       'visibility': 'visible',
  //     }),
  //   ),
  //   state(
  //     'void',
  //     style({
  //       // Avoids the shadow showing up when closed in SSR.
  //       'box-shadow': 'none',
  //       'visibility': 'hidden',
  //     }),
  //   ),
  //   transition('void => open-instant', animate('0ms')),
  //   transition(
  //     'void <=> open, open-instant => void',
  //     animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)'),
  //   ),
  // ])

  /** Animation that slides a drawer in and out. */
  transformDrawer: {
    type: 7,
    name: 'transform',
    definitions: [
      {
        type: 0,
        name: 'open, open-instant',
        styles: {
          type: 6,
          styles: {transform: 'none', visibility: 'visible'},
          offset: null,
        },
      },
      {
        type: 0,
        name: 'void',
        styles: {
          type: 6,
          styles: {'box-shadow': 'none', visibility: 'hidden'},
          offset: null,
        },
      },
      {
        type: 1,
        expr: 'void => open-instant',
        animation: {type: 4, styles: null, timings: '0ms'},
        options: null,
      },
      {
        type: 1,
        expr: 'void <=> open, open-instant => void',
        animation: {
          type: 4,
          styles: null,
          timings: '400ms cubic-bezier(0.25, 0.8, 0.25, 1)',
        },
        options: null,
      },
    ],
    options: {},
  },
};
