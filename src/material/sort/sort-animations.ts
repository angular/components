/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Animations used by MatSort.
 * @docs-private
 * @deprecated No longer being used, to be removed.
 * @breaking-change 21.0.0
 */
export const matSortAnimations: {
  readonly indicator: any;
  readonly leftPointer: any;
  readonly rightPointer: any;
  readonly arrowOpacity: any;
  readonly arrowPosition: any;
  readonly allowChildren: any;
} = {
  // Represents:
  // trigger('indicator', [
  //   state('active-asc, asc', style({transform: 'translateY(0px)'})),
  //   // 10px is the height of the sort indicator, minus the width of the pointers
  //   state('active-desc, desc', style({transform: 'translateY(10px)'})),
  //   transition('active-asc <=> active-desc', animate(SORT_ANIMATION_TRANSITION)),
  // ])

  /** Animation that moves the sort indicator. */
  indicator: {
    type: 7,
    name: 'indicator',
    definitions: [
      {
        type: 0,
        name: 'active-asc, asc',
        styles: {type: 6, styles: {transform: 'translateY(0px)'}, offset: null},
      },
      {
        type: 0,
        name: 'active-desc, desc',
        styles: {type: 6, styles: {transform: 'translateY(10px)'}, offset: null},
      },
      {
        type: 1,
        expr: 'active-asc <=> active-desc',
        animation: {type: 4, styles: null, timings: '225ms cubic-bezier(0.4,0.0,0.2,1)'},
        options: null,
      },
    ],
    options: {},
  },

  // Represents:
  // trigger('leftPointer', [
  //   state('active-asc, asc', style({transform: 'rotate(-45deg)'})),
  //   state('active-desc, desc', style({transform: 'rotate(45deg)'})),
  //   transition('active-asc <=> active-desc', animate(SORT_ANIMATION_TRANSITION)),
  // ])

  /** Animation that rotates the left pointer of the indicator based on the sorting direction. */
  leftPointer: {
    type: 7,
    name: 'leftPointer',
    definitions: [
      {
        type: 0,
        name: 'active-asc, asc',
        styles: {type: 6, styles: {transform: 'rotate(-45deg)'}, offset: null},
      },
      {
        type: 0,
        name: 'active-desc, desc',
        styles: {type: 6, styles: {transform: 'rotate(45deg)'}, offset: null},
      },
      {
        type: 1,
        expr: 'active-asc <=> active-desc',
        animation: {type: 4, styles: null, timings: '225ms cubic-bezier(0.4,0.0,0.2,1)'},
        options: null,
      },
    ],
    options: {},
  },

  // Represents:
  // trigger('rightPointer', [
  //   state('active-asc, asc', style({transform: 'rotate(45deg)'})),
  //   state('active-desc, desc', style({transform: 'rotate(-45deg)'})),
  //   transition('active-asc <=> active-desc', animate(SORT_ANIMATION_TRANSITION)),
  // ])

  /** Animation that rotates the right pointer of the indicator based on the sorting direction. */
  rightPointer: {
    type: 7,
    name: 'rightPointer',
    definitions: [
      {
        type: 0,
        name: 'active-asc, asc',
        styles: {type: 6, styles: {transform: 'rotate(45deg)'}, offset: null},
      },
      {
        type: 0,
        name: 'active-desc, desc',
        styles: {type: 6, styles: {transform: 'rotate(-45deg)'}, offset: null},
      },
      {
        type: 1,
        expr: 'active-asc <=> active-desc',
        animation: {type: 4, styles: null, timings: '225ms cubic-bezier(0.4,0.0,0.2,1)'},
        options: null,
      },
    ],
    options: {},
  },

  // Represents:
  // trigger('arrowOpacity', [
  //   state('desc-to-active, asc-to-active, active', style({opacity: 1})),
  //   state('desc-to-hint, asc-to-hint, hint', style({opacity: 0.54})),
  //   state(
  //     'hint-to-desc, active-to-desc, desc, hint-to-asc, active-to-asc, asc, void',
  //     style({opacity: 0}),
  //   ),
  //   // Transition between all states except for immediate transitions
  //   transition('* => asc, * => desc, * => active, * => hint, * => void', animate('0ms')),
  //   transition('* <=> *', animate(SORT_ANIMATION_TRANSITION)),
  // ])

  /** Animation that controls the arrow opacity. */
  arrowOpacity: {
    type: 7,
    name: 'arrowOpacity',
    definitions: [
      {
        type: 0,
        name: 'desc-to-active, asc-to-active, active',
        styles: {type: 6, styles: {'opacity': 1}, offset: null},
      },
      {
        type: 0,
        name: 'desc-to-hint, asc-to-hint, hint',
        styles: {type: 6, styles: {'opacity': 0.54}, offset: null},
      },
      {
        type: 0,
        name: 'hint-to-desc, active-to-desc, desc, hint-to-asc, active-to-asc, asc, void',
        styles: {type: 6, styles: {'opacity': 0}, offset: null},
      },
      {
        type: 1,
        expr: '* => asc, * => desc, * => active, * => hint, * => void',
        animation: {type: 4, styles: null, timings: '0ms'},
        options: null,
      },
      {
        type: 1,
        expr: '* <=> *',
        animation: {type: 4, styles: null, timings: '225ms cubic-bezier(0.4,0.0,0.2,1)'},
        options: null,
      },
    ],
    options: {},
  },

  // Represents:
  // trigger('arrowPosition', [
  //   // Hidden Above => Hint Center
  //   transition(
  //     '* => desc-to-hint, * => desc-to-active',
  //     animate(
  //       SORT_ANIMATION_TRANSITION,
  //       keyframes([style({transform: 'translateY(-25%)'}), style({transform: 'translateY(0)'})]),
  //     ),
  //   ),
  //   // Hint Center => Hidden Below
  //   transition(
  //     '* => hint-to-desc, * => active-to-desc',
  //     animate(
  //       SORT_ANIMATION_TRANSITION,
  //       keyframes([style({transform: 'translateY(0)'}), style({transform: 'translateY(25%)'})]),
  //     ),
  //   ),
  //   // Hidden Below => Hint Center
  //   transition(
  //     '* => asc-to-hint, * => asc-to-active',
  //     animate(
  //       SORT_ANIMATION_TRANSITION,
  //       keyframes([style({transform: 'translateY(25%)'}), style({transform: 'translateY(0)'})]),
  //     ),
  //   ),
  //   // Hint Center => Hidden Above
  //   transition(
  //     '* => hint-to-asc, * => active-to-asc',
  //     animate(
  //       SORT_ANIMATION_TRANSITION,
  //       keyframes([style({transform: 'translateY(0)'}), style({transform: 'translateY(-25%)'})]),
  //     ),
  //   ),
  //   state(
  //     'desc-to-hint, asc-to-hint, hint, desc-to-active, asc-to-active, active',
  //     style({transform: 'translateY(0)'}),
  //   ),
  //   state('hint-to-desc, active-to-desc, desc', style({transform: 'translateY(-25%)'})),
  //   state('hint-to-asc, active-to-asc, asc', style({transform: 'translateY(25%)'})),
  // ])

  /**
   * Animation for the translation of the arrow as a whole. States are separated into two
   * groups: ones with animations and others that are immediate. Immediate states are asc, desc,
   * peek, and active. The other states define a specific animation (source-to-destination)
   * and are determined as a function of their prev user-perceived state and what the next state
   * should be.
   */
  arrowPosition: {
    type: 7,
    name: 'arrowPosition',
    definitions: [
      {
        type: 1,
        expr: '* => desc-to-hint, * => desc-to-active',
        animation: {
          type: 4,
          styles: {
            type: 5,
            'steps': [
              {type: 6, styles: {transform: 'translateY(-25%)'}, offset: null},
              {type: 6, styles: {transform: 'translateY(0)'}, offset: null},
            ],
          },
          timings: '225ms cubic-bezier(0.4,0.0,0.2,1)',
        },
        options: null,
      },
      {
        type: 1,
        expr: '* => hint-to-desc, * => active-to-desc',
        animation: {
          type: 4,
          styles: {
            type: 5,
            'steps': [
              {type: 6, styles: {transform: 'translateY(0)'}, offset: null},
              {type: 6, styles: {transform: 'translateY(25%)'}, offset: null},
            ],
          },
          timings: '225ms cubic-bezier(0.4,0.0,0.2,1)',
        },
        options: null,
      },
      {
        type: 1,
        expr: '* => asc-to-hint, * => asc-to-active',
        animation: {
          type: 4,
          styles: {
            type: 5,
            'steps': [
              {type: 6, styles: {transform: 'translateY(25%)'}, offset: null},
              {type: 6, styles: {transform: 'translateY(0)'}, offset: null},
            ],
          },
          timings: '225ms cubic-bezier(0.4,0.0,0.2,1)',
        },
        options: null,
      },
      {
        type: 1,
        expr: '* => hint-to-asc, * => active-to-asc',
        animation: {
          type: 4,
          styles: {
            type: 5,
            'steps': [
              {type: 6, styles: {transform: 'translateY(0)'}, offset: null},
              {type: 6, styles: {transform: 'translateY(-25%)'}, offset: null},
            ],
          },
          timings: '225ms cubic-bezier(0.4,0.0,0.2,1)',
        },
        options: null,
      },
      {
        type: 0,
        name: 'desc-to-hint, asc-to-hint, hint, desc-to-active, asc-to-active, active',
        styles: {type: 6, styles: {transform: 'translateY(0)'}, offset: null},
      },
      {
        type: 0,
        name: 'hint-to-desc, active-to-desc, desc',
        styles: {type: 6, styles: {transform: 'translateY(-25%)'}, offset: null},
      },
      {
        type: 0,
        name: 'hint-to-asc, active-to-asc, asc',
        styles: {type: 6, styles: {transform: 'translateY(25%)'}, offset: null},
      },
    ],
    options: {},
  },

  // Represents:
  // trigger('allowChildren', [
  //   transition('* <=> *', [query('@*', animateChild(), {optional: true})]),
  // ])

  /** Necessary trigger that calls animate on children animations. */
  allowChildren: {
    type: 7,
    name: 'allowChildren',
    definitions: [
      {
        type: 1,
        expr: '* <=> *',
        animation: [
          {
            type: 11,
            selector: '@*',
            animation: {type: 9, options: null},
            options: {optional: true},
          },
        ],
        options: null,
      },
    ],
    options: {},
  },
};
