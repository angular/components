/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Default parameters for the animation for backwards compatibility.
 * @docs-private
 * @deprecated Will stop being exported.
 * @breaking-change 21.0.0
 */
export const _defaultParams = {
  params: {enterAnimationDuration: '150ms', exitAnimationDuration: '75ms'},
};

/**
 * Animations used by MatDialog.
 * @docs-private
 * @deprecated No longer used, will be removed.
 * @breaking-change 21.0.0
 */
export const matDialogAnimations: {
  readonly dialogContainer: any;
} = {
  // Represents:
  // trigger('dialogContainer', [
  //   // Note: The `enter` animation transitions to `transform: none`, because for some reason
  //   // specifying the transform explicitly, causes IE both to blur the dialog content and
  //   // decimate the animation performance. Leaving it as `none` solves both issues.
  //   state('void, exit', style({opacity: 0, transform: 'scale(0.7)'})),
  //   state('enter', style({transform: 'none'})),
  //   transition(
  //     '* => enter',
  //     group([
  //       animate(
  //         '{{enterAnimationDuration}} cubic-bezier(0, 0, 0.2, 1)',
  //         style({transform: 'none', opacity: 1}),
  //       ),
  //       query('@*', animateChild(), {optional: true}),
  //     ]),
  //     _defaultParams,
  //   ),
  //   transition(
  //     '* => void, * => exit',
  //     group([
  //       animate('{{exitAnimationDuration}} cubic-bezier(0.4, 0.0, 0.2, 1)', style({opacity: 0})),
  //       query('@*', animateChild(), {optional: true}),
  //     ]),
  //     _defaultParams,
  //   ),
  // ])

  /** Animation that is applied on the dialog container by default. */
  dialogContainer: {
    type: 7,
    name: 'dialogContainer',
    definitions: [
      {
        type: 0,
        name: 'void, exit',
        styles: {type: 6, styles: {opacity: 0, transform: 'scale(0.7)'}, offset: null},
      },
      {
        type: 0,
        name: 'enter',
        styles: {type: 6, styles: {transform: 'none'}, offset: null},
      },
      {
        type: 1,
        expr: '* => enter',
        animation: {
          type: 3,
          steps: [
            {
              type: 4,
              styles: {type: 6, styles: {transform: 'none', opacity: 1}, offset: null},
              timings: '{{enterAnimationDuration}} cubic-bezier(0, 0, 0.2, 1)',
            },
            {
              type: 11,
              selector: '@*',
              animation: {type: 9, options: null},
              options: {optional: true},
            },
          ],
          options: null,
        },
        options: {params: {enterAnimationDuration: '150ms', exitAnimationDuration: '75ms'}},
      },
      {
        type: 1,
        expr: '* => void, * => exit',
        animation: {
          type: 3,
          steps: [
            {
              type: 4,
              styles: {type: 6, styles: {opacity: 0}, offset: null},
              timings: '{{exitAnimationDuration}} cubic-bezier(0.4, 0.0, 0.2, 1)',
            },
            {
              type: 11,
              selector: '@*',
              animation: {type: 9, options: null},
              options: {optional: true},
            },
          ],
          options: null,
        },
        options: {params: {enterAnimationDuration: '150ms', exitAnimationDuration: '75ms'}},
      },
    ],
    options: {},
  },
};
