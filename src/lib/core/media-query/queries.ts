/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export const MEDIA_QUERIES = {
  Handset: '(max-width: 600px) and (orientation: portrait), ' +
           '(max-width: 960px) and (orientation: landscape)',
  Tablet: '(min-width: 600px) and (max-width: 840px) and (orientation: portrait), ' +
          '(min-width: 960px) and (max-width: 1280px) and (orientation: landscape)',
  Web: '(min-width: 840px) and (orientation: portrait), ' +
       '(min-width: 1280px) and (orientation: landscape)',

  HandsetPortrait: '(max-width: 600px) and (orientation: portrait)',
  TabletPortrait: '(min-width: 600px) and (max-width: 840px) and (orientation: portrait)',
  WebPortrait: '(min-width: 840px) and (orientation: portrait)',

  HandsetLandscape: '(max-width: 960px) and (orientation: landscape)',
  TabletLandscape: '(min-width: 960px) and (max-width: 1280px) and (orientation: landscape)',
  WebLandscape: '(min-width: 1280px) and (orientation: landscape)',
};
