/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject} from '@angular/core';
import {RedirectCommand, ResolveFn, Router} from '@angular/router';
import {GuideItem, GuideItems} from '../../shared/guide-items/guide-items';

/**
 * Resolves the guide matching the `:id` route param. Redirects to the guide list if there is no
 * guide with that id.
 */
export const guideResolver: ResolveFn<GuideItem> = route => {
  const guide = inject(GuideItems).getItemById(route.params['id']);
  return guide ?? new RedirectCommand(inject(Router).parseUrl('/guides'));
};
