/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// PascalCase is being used as Breakpoints is used like an enum.
// tslint:disable-next-line:variable-name
export const Breakpoints = {
  XSmall: '(width <= 599.99px)',
  Small: '(600px <= width <= 959.99px)',
  Medium: '(960px <= width <= 1279.99px)',
  Large: '(1280px <= width <= 1919.99px)',
  XLarge: '(width => 1920px)',

  Handset: '(width <= 599.99px) and (orientation: portrait), ' +
           '(width <= 959.99px) and (orientation: landscape)',
  Tablet: '(600px <= width <= 839.99px) and (orientation: portrait), ' +
          '(960px <= width <= 1279.99px) and (orientation: landscape)',
  Web: '(width => 840px) and (orientation: portrait), ' +
       '(width => 1280px) and (orientation: landscape)',

  HandsetPortrait: '(width <= 599.99px) and (orientation: portrait)',
  TabletPortrait: '(600px <= width <= 839.00px) and (orientation: portrait)',
  WebPortrait: '(width => 840px) and (orientation: portrait)',

  HandsetLandscape: '(width <= 959.99px) and (orientation: landscape)',
  TabletLandscape: '(960px <= width <= 1279.99px) and (orientation: landscape)',
  WebLandscape: '(width => 1280px) and (orientation: landscape)',
};
