/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Animations used by the Material tabs.
 * @nodoc
 * @deprecated No longer used, will be removed.
 * @breaking-change 21.0.0.
 */
export const matTabsAnimations: {
  readonly translateTab: any;
} = {
  // Represents:
  // trigger('translateTab', [
  //   // Transitions to `none` instead of 0, because some browsers might blur the content.
  //   state(
  //     'center, void, left-origin-center, right-origin-center',
  //     style({transform: 'none', visibility: 'visible'}),
  //   ),

  //   // If the tab is either on the left or right, we additionally add a `min-height` of 1px
  //   // in order to ensure that the element has a height before its state changes. This is
  //   // necessary because Chrome does seem to skip the transition in RTL mode if the element does
  //   // not have a static height and is not rendered. See related issue: #9465
  //   state(
  //     'left',
  //     style({
  //       transform: 'translate3d(-100%, 0, 0)',
  //       minHeight: '1px',

  //       // Normally this is redundant since we detach the content from the DOM, but if the user
  //       // opted into keeping the content in the DOM, we have to hide it so it isn't focusable.
  //       visibility: 'hidden',
  //     }),
  //   ),
  //   state(
  //     'right',
  //     style({
  //       transform: 'translate3d(100%, 0, 0)',
  //       minHeight: '1px',
  //       visibility: 'hidden',
  //     }),
  //   ),

  //   transition(
  //     '* => left, * => right, left => center, right => center',
  //     animate('{{animationDuration}} cubic-bezier(0.35, 0, 0.25, 1)'),
  //   ),
  //   transition('void => left-origin-center', [
  //     style({transform: 'translate3d(-100%, 0, 0)', visibility: 'hidden'}),
  //     animate('{{animationDuration}} cubic-bezier(0.35, 0, 0.25, 1)'),
  //   ]),
  //   transition('void => right-origin-center', [
  //     style({transform: 'translate3d(100%, 0, 0)', visibility: 'hidden'}),
  //     animate('{{animationDuration}} cubic-bezier(0.35, 0, 0.25, 1)'),
  //   ]),
  // ])

  /** Animation translates a tab along the X axis. */
  translateTab: {
    type: 7,
    name: 'translateTab',
    definitions: [
      {
        type: 0,
        name: 'center, void, left-origin-center, right-origin-center',
        styles: {
          type: 6,
          styles: {transform: 'none', visibility: 'visible'},
          offset: null,
        },
      },
      {
        type: 0,
        name: 'left',
        styles: {
          type: 6,
          styles: {
            transform: 'translate3d(-100%, 0, 0)',
            minHeight: '1px',
            visibility: 'hidden',
          },
          offset: null,
        },
      },
      {
        type: 0,
        name: 'right',
        styles: {
          type: 6,
          styles: {
            transform: 'translate3d(100%, 0, 0)',
            minHeight: '1px',
            visibility: 'hidden',
          },
          offset: null,
        },
      },
      {
        type: 1,
        expr: '* => left, * => right, left => center, right => center',
        animation: {
          type: 4,
          styles: null,
          timings: '{{animationDuration}} cubic-bezier(0.35, 0, 0.25, 1)',
        },
        options: null,
      },
      {
        type: 1,
        expr: 'void => left-origin-center',
        animation: [
          {
            type: 6,
            styles: {transform: 'translate3d(-100%, 0, 0)', visibility: 'hidden'},
            offset: null,
          },
          {
            type: 4,
            styles: null,
            timings: '{{animationDuration}} cubic-bezier(0.35, 0, 0.25, 1)',
          },
        ],
        options: null,
      },
      {
        type: 1,
        expr: 'void => right-origin-center',
        animation: [
          {
            type: 6,
            styles: {transform: 'translate3d(100%, 0, 0)', visibility: 'hidden'},
            offset: null,
          },
          {
            type: 4,
            styles: null,
            timings: '{{animationDuration}} cubic-bezier(0.35, 0, 0.25, 1)',
          },
        ],
        options: null,
      },
    ],
    options: {},
  },
};
