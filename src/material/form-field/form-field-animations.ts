/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Animations used by the MatFormField.
 * @docs-private
 * @deprecated No longer used, will be removed.
 * @breaking-change 21.0.0
 */
export const matFormFieldAnimations: {
  readonly transitionMessages: any;
} = {
  // Represents:
  // trigger('transitionMessages', [
  //   // TODO(mmalerba): Use angular animations for label animation as well.
  //   state('enter', style({opacity: 1, transform: 'translateY(0%)'})),
  //   transition('void => enter', [
  //     style({opacity: 0, transform: 'translateY(-5px)'}),
  //     animate('300ms cubic-bezier(0.55, 0, 0.55, 0.2)'),
  //   ]),
  // ])

  /** Animation that transitions the form field's error and hint messages. */
  transitionMessages: {
    type: 7,
    name: 'transitionMessages',
    definitions: [
      {
        type: 0,
        name: 'enter',
        styles: {
          type: 6,
          styles: {opacity: 1, transform: 'translateY(0%)'},
          offset: null,
        },
      },
      {
        type: 1,
        expr: 'void => enter',
        animation: [
          {type: 6, styles: {opacity: 0, transform: 'translateY(-5px)'}, offset: null},
          {type: 4, styles: null, timings: '300ms cubic-bezier(0.55, 0, 0.55, 0.2)'},
        ],
        options: null,
      },
    ],
    options: {},
  },
};
