/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';
import type {ToolbarWidgetGroup} from './toolbar-widget-group';

/** Token used to provide the `ToolbarWidgetGroup` directive. */
export const TOOLBAR_WIDGET_GROUP = new InjectionToken<ToolbarWidgetGroup<unknown>>(
  'TOOLBAR_WIDGET_GROUP',
);

interface HasElement {
  element: HTMLElement;
}

export function sortDirectives(a: HasElement, b: HasElement) {
  return (a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_PRECEDING) > 0
    ? 1
    : -1;
}
