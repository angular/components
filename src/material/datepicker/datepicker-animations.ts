/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Animations used by the Material datepicker.
 * @nodoc
 * @deprecated No longer used, will be removed.
 * @breaking-change 21.0.0
 */
export const matDatepickerAnimations: {
  readonly transformPanel: any;
  readonly fadeInCalendar: any;
} = {
  // Represents:
  // trigger('transformPanel', [
  //   transition(
  //     'void => enter-dropdown',
  //     animate(
  //       '120ms cubic-bezier(0, 0, 0.2, 1)',
  //       keyframes([
  //         style({opacity: 0, transform: 'scale(1, 0.8)'}),
  //         style({opacity: 1, transform: 'scale(1, 1)'}),
  //       ]),
  //     ),
  //   ),
  //   transition(
  //     'void => enter-dialog',
  //     animate(
  //       '150ms cubic-bezier(0, 0, 0.2, 1)',
  //       keyframes([
  //         style({opacity: 0, transform: 'scale(0.7)'}),
  //         style({transform: 'none', opacity: 1}),
  //       ]),
  //     ),
  //   ),
  //   transition('* => void', animate('100ms linear', style({opacity: 0}))),
  // ])

  /** Transforms the height of the datepicker's calendar. */
  transformPanel: {
    type: 7,
    name: 'transformPanel',
    definitions: [
      {
        type: 1,
        expr: 'void => enter-dropdown',
        animation: {
          type: 4,
          styles: {
            type: 5,
            steps: [
              {type: 6, styles: {opacity: 0, transform: 'scale(1, 0.8)'}, offset: null},
              {type: 6, styles: {opacity: 1, transform: 'scale(1, 1)'}, offset: null},
            ],
          },
          timings: '120ms cubic-bezier(0, 0, 0.2, 1)',
        },
        options: null,
      },
      {
        type: 1,
        expr: 'void => enter-dialog',
        animation: {
          type: 4,
          styles: {
            type: 5,
            steps: [
              {type: 6, styles: {opacity: 0, transform: 'scale(0.7)'}, offset: null},
              {type: 6, styles: {transform: 'none', opacity: 1}, offset: null},
            ],
          },
          timings: '150ms cubic-bezier(0, 0, 0.2, 1)',
        },
        options: null,
      },
      {
        type: 1,
        expr: '* => void',
        animation: {
          type: 4,
          styles: {type: 6, styles: {opacity: 0}, offset: null},
          timings: '100ms linear',
        },
        options: null,
      },
    ],
    options: {},
  },

  // Represents:
  // trigger('fadeInCalendar', [
  //   state('void', style({opacity: 0})),
  //   state('enter', style({opacity: 1})),

  //   // TODO(crisbeto): this animation should be removed since it isn't quite on spec, but we
  //   // need to keep it until #12440 gets in, otherwise the exit animation will look glitchy.
  //   transition('void => *', animate('120ms 100ms cubic-bezier(0.55, 0, 0.55, 0.2)')),
  // ])

  /** Fades in the content of the calendar. */
  fadeInCalendar: {
    type: 7,
    name: 'fadeInCalendar',
    definitions: [
      {type: 0, name: 'void', styles: {type: 6, styles: {opacity: 0}, offset: null}},
      {type: 0, name: 'enter', styles: {type: 6, styles: {opacity: 1}, offset: null}},
      {
        type: 1,
        expr: 'void => *',
        animation: {
          type: 4,
          styles: null,
          timings: '120ms 100ms cubic-bezier(0.55, 0, 0.55, 0.2)',
        },
        options: null,
      },
    ],
    options: {},
  },
};
