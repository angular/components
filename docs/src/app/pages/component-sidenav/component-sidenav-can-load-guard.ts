/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {SECTIONS} from '../../shared/documentation-items/documentation-items';

/**
 * Guard to determine if the sidenav can load, based on whether the section exists in documentation
 * items.
 */
export const canActivateComponentSidenav: CanActivateFn = route => {
  // Searches if the section defined in the base UrlSegment is a valid section from the
  // documentation items. If found, returns true to allow activation, otherwise redirects to '/'.
  if (Object.keys(SECTIONS).some(s => s.toLowerCase() === route.url[0].path.toLowerCase())) {
    return true;
  }

  return inject(Router).parseUrl('/');
};
