/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Animations used by the Material steppers.
 * @docs-private
 * @deprecated No longer used, will be removed.
 * @breaking-change 21.0.0
 */
export const matStepperAnimations: {
  readonly horizontalStepTransition: any;
  readonly verticalStepTransition: any;
} = {
  // Represents:
  // trigger('horizontalStepTransition', [
  //   state('previous', style({transform: 'translate3d(-100%, 0, 0)', visibility: 'hidden'})),
  //   // Transition to `inherit`, rather than `visible`,
  //   // because visibility on a child element the one from the parent,
  //   // making this element focusable inside of a `hidden` element.
  //   state('current', style({transform: 'none', visibility: 'inherit'})),
  //   state('next', style({transform: 'translate3d(100%, 0, 0)', visibility: 'hidden'})),
  //   transition(
  //     '* => *',
  //     group([
  //       animate('{{animationDuration}} cubic-bezier(0.35, 0, 0.25, 1)'),
  //       query('@*', animateChild(), {optional: true}),
  //     ]),
  //     {
  //       params: {animationDuration: '500ms'},
  //     },
  //   ),
  // ])

  /** Animation that transitions the step along the X axis in a horizontal stepper. */
  horizontalStepTransition: {
    type: 7,
    name: 'horizontalStepTransition',
    definitions: [
      {
        type: 0,
        name: 'previous',
        styles: {
          type: 6,
          styles: {transform: 'translate3d(-100%, 0, 0)', visibility: 'hidden'},
          offset: null,
        },
      },
      {
        type: 0,
        name: 'current',
        styles: {
          type: 6,
          styles: {transform: 'none', visibility: 'inherit'},
          offset: null,
        },
      },
      {
        type: 0,
        name: 'next',
        styles: {
          type: 6,
          styles: {transform: 'translate3d(100%, 0, 0)', visibility: 'hidden'},
          offset: null,
        },
      },
      {
        type: 1,
        expr: '* => *',
        animation: {
          type: 3,
          steps: [
            {
              type: 4,
              styles: null,
              timings: '{{animationDuration}} cubic-bezier(0.35, 0, 0.25, 1)',
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
        options: {params: {animationDuration: '500ms'}},
      },
    ],
    options: {},
  },

  // Represents:
  // trigger('verticalStepTransition', [
  //   state('previous', style({height: '0px', visibility: 'hidden'})),
  //   state('next', style({height: '0px', visibility: 'hidden'})),
  //   // Transition to `inherit`, rather than `visible`,
  //   // because visibility on a child element the one from the parent,
  //   // making this element focusable inside of a `hidden` element.
  //   state('current', style({height: '*', visibility: 'inherit'})),
  //   transition(
  //     '* <=> current',
  //     group([
  //       animate('{{animationDuration}} cubic-bezier(0.4, 0.0, 0.2, 1)'),
  //       query('@*', animateChild(), {optional: true}),
  //     ]),
  //     {
  //       params: {animationDuration: '225ms'},
  //     },
  //   ),
  // ])

  /** Animation that transitions the step along the Y axis in a vertical stepper. */
  verticalStepTransition: {
    type: 7,
    name: 'verticalStepTransition',
    definitions: [
      {
        type: 0,
        name: 'previous',
        styles: {type: 6, styles: {'height': '0px', visibility: 'hidden'}, offset: null},
      },
      {
        type: 0,
        name: 'next',
        styles: {type: 6, styles: {'height': '0px', visibility: 'hidden'}, offset: null},
      },
      {
        type: 0,
        name: 'current',
        styles: {type: 6, styles: {'height': '*', visibility: 'inherit'}, offset: null},
      },
      {
        type: 1,
        expr: '* <=> current',
        animation: {
          type: 3,
          steps: [
            {
              type: 4,
              styles: null,
              timings: '{{animationDuration}} cubic-bezier(0.4, 0.0, 0.2, 1)',
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
        options: {params: {animationDuration: '225ms'}},
      },
    ],
    options: {},
  },
};
