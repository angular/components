/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject} from '@angular/core';
import {RedirectCommand, ResolveFn, Router} from '@angular/router';
import {DocItem, DocumentationItems} from '../../shared/documentation-items/documentation-items';

/**
 * Resolves the doc item matching the `:id` route param (e.g. button/checkbox) within the `:section`
 * route param (material/cdk). Redirects to the section if there is no matching doc item.
 */
export const docItemResolver: ResolveFn<DocItem> = async route => {
  // Inject before awaiting, since the injection context doesn't survive the `await`.
  const docItems = inject(DocumentationItems);
  const router = inject(Router);
  const section = route.params['section'];
  const doc = await docItems.getItemById(route.params['id'], section);

  return doc ?? new RedirectCommand(router.parseUrl('/' + section));
};
