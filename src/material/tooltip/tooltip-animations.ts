/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Animations used by MatTooltip.
 * @nodoc
 * @deprecated No longer being used, to be removed.
 * @breaking-change 21.0.0
 */
export const matTooltipAnimations: {
  readonly tooltipState: any;
} = {
  // Represents:
  // trigger('state', [
  //   state('initial, void, hidden', style({opacity: 0, transform: 'scale(0.8)'})),
  //   state('visible', style({transform: 'scale(1)'})),
  //   transition('* => visible', animate('150ms cubic-bezier(0, 0, 0.2, 1)')),
  //   transition('* => hidden', animate('75ms cubic-bezier(0.4, 0, 1, 1)')),
  // ])

  /** Animation that transitions a tooltip in and out. */
  tooltipState: {
    type: 7,
    name: 'state',
    definitions: [
      {
        type: 0,
        name: 'initial, void, hidden',
        styles: {type: 6, styles: {opacity: 0, transform: 'scale(0.8)'}, offset: null},
      },
      {
        type: 0,
        name: 'visible',
        styles: {type: 6, styles: {transform: 'scale(1)'}, offset: null},
      },
      {
        type: 1,
        expr: '* => visible',
        animation: {type: 4, styles: null, timings: '150ms cubic-bezier(0, 0, 0.2, 1)'},
        options: null,
      },
      {
        type: 1,
        expr: '* => hidden',
        animation: {type: 4, styles: null, timings: '75ms cubic-bezier(0.4, 0, 1, 1)'},
        options: null,
      },
    ],
    options: {},
  },
};
