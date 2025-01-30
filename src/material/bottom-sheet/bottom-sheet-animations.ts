/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Animations used by the Material bottom sheet.
 * @deprecated No longer used. Will be removed.
 * @breaking-change 21.0.0
 */
export const matBottomSheetAnimations: {
  readonly bottomSheetState: any;
} = {
  // Represents the output of:
  // trigger('state', [
  //   state('void, hidden', style({transform: 'translateY(100%)'})),
  //   state('visible', style({transform: 'translateY(0%)'})),
  //   transition(
  //     'visible => void, visible => hidden',
  //     group([
  //       animate('375ms cubic-bezier(0.4, 0, 1, 1)'),
  //       query('@*', animateChild(), {optional: true}),
  //     ]),
  //   ),
  //   transition(
  //     'void => visible',
  //     group([
  //       animate('195ms cubic-bezier(0, 0, 0.2, 1)'),
  //       query('@*', animateChild(), {optional: true}),
  //     ]),
  //   ),
  // ])

  /** Animation that shows and hides a bottom sheet. */
  bottomSheetState: {
    type: 7,
    name: 'state',
    definitions: [
      {
        type: 0,
        name: 'void, hidden',
        styles: {type: 6, styles: {transform: 'translateY(100%)'}, offset: null},
      },
      {
        type: 0,
        name: 'visible',
        styles: {type: 6, styles: {transform: 'translateY(0%)'}, offset: null},
      },
      {
        type: 1,
        expr: 'visible => void, visible => hidden',
        animation: {
          type: 3,
          steps: [
            {type: 4, styles: null, timings: '375ms cubic-bezier(0.4, 0, 1, 1)'},
            {
              type: 11,
              selector: '@*',
              animation: {type: 9, options: null},
              options: {optional: true},
            },
          ],
          options: null,
        },
        options: null,
      },
      {
        type: 1,
        expr: 'void => visible',
        animation: {
          type: 3,
          steps: [
            {type: 4, styles: null, timings: '195ms cubic-bezier(0, 0, 0.2, 1)'},
            {
              type: 11,
              selector: '@*',
              animation: {type: 9, options: null},
              options: {optional: true},
            },
          ],
          options: null,
        },
        options: null,
      },
    ],
    options: {},
  },
};
