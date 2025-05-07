/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Animations used by the Material snack bar.
 * @nodoc
 * @deprecated No longer used, will be removed.
 * @breaking-change 21.0.0
 */
export const matSnackBarAnimations: {
  readonly snackBarState: any;
} = {
  // Represents
  // trigger('state', [
  //   state(
  //     'void, hidden',
  //     style({
  //       transform: 'scale(0.8)',
  //       opacity: 0,
  //     }),
  //   ),
  //   state(
  //     'visible',
  //     style({
  //       transform: 'scale(1)',
  //       opacity: 1,
  //     }),
  //   ),
  //   transition('* => visible', animate('150ms cubic-bezier(0, 0, 0.2, 1)')),
  //   transition(
  //     '* => void, * => hidden',
  //     animate(
  //       '75ms cubic-bezier(0.4, 0.0, 1, 1)',
  //       style({
  //         opacity: 0,
  //       }),
  //     ),
  //   ),
  // ])

  /** Animation that shows and hides a snack bar. */
  snackBarState: {
    type: 7,
    name: 'state',
    'definitions': [
      {
        type: 0,
        name: 'void, hidden',
        styles: {type: 6, styles: {transform: 'scale(0.8)', opacity: 0}, offset: null},
      },
      {
        type: 0,
        name: 'visible',
        styles: {type: 6, styles: {transform: 'scale(1)', opacity: 1}, offset: null},
      },
      {
        type: 1,
        expr: '* => visible',
        animation: {type: 4, styles: null, timings: '150ms cubic-bezier(0, 0, 0.2, 1)'},
        options: null,
      },
      {
        type: 1,
        expr: '* => void, * => hidden',
        animation: {
          type: 4,
          styles: {type: 6, styles: {opacity: 0}, offset: null},
          timings: '75ms cubic-bezier(0.4, 0.0, 1, 1)',
        },
        options: null,
      },
    ],
    options: {},
  },
};
