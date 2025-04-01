/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * The following are all the animations for the mat-select component, with each
 * const containing the metadata for one animation.
 *
 * The values below match the implementation of the AngularJS Material mat-select animation.
 * @docs-private
 * @deprecated No longer used, will be removed.
 * @breaking-change 21.0.0
 */
export const matSelectAnimations: {
  /**
   * @deprecated No longer being used. To be removed.
   * @breaking-change 12.0.0
   */
  readonly transformPanelWrap: any;
  readonly transformPanel: any;
} = {
  // Represents
  // trigger('transformPanelWrap', [
  //   transition('* => void', query('@transformPanel', [animateChild()], {optional: true})),
  // ])

  /**
   * This animation ensures the select's overlay panel animation (transformPanel) is called when
   * closing the select.
   * This is needed due to https://github.com/angular/angular/issues/23302
   */
  transformPanelWrap: {
    type: 7,
    name: 'transformPanelWrap',
    definitions: [
      {
        type: 1,
        expr: '* => void',
        animation: {
          type: 11,
          selector: '@transformPanel',
          animation: [{type: 9, options: null}],
          options: {optional: true},
        },
        options: null,
      },
    ],
    options: {},
  },

  // Represents
  // trigger('transformPanel', [
  //   state(
  //     'void',
  //     style({
  //       opacity: 0,
  //       transform: 'scale(1, 0.8)',
  //     }),
  //   ),
  //   transition(
  //     'void => showing',
  //     animate(
  //       '120ms cubic-bezier(0, 0, 0.2, 1)',
  //       style({
  //         opacity: 1,
  //         transform: 'scale(1, 1)',
  //       }),
  //     ),
  //   ),
  //   transition('* => void', animate('100ms linear', style({opacity: 0}))),
  // ])

  /** This animation transforms the select's overlay panel on and off the page. */
  transformPanel: {
    type: 7,
    name: 'transformPanel',
    definitions: [
      {
        type: 0,
        name: 'void',
        styles: {
          type: 6,
          styles: {opacity: 0, transform: 'scale(1, 0.8)'},
          offset: null,
        },
      },
      {
        type: 1,
        expr: 'void => showing',
        animation: {
          type: 4,
          styles: {
            type: 6,
            styles: {opacity: 1, transform: 'scale(1, 1)'},
            offset: null,
          },
          timings: '120ms cubic-bezier(0, 0, 0.2, 1)',
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
};
