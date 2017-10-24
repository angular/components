/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  Directive,
  ViewContainerRef,
} from '@angular/core';

/**
 * Outlet for nested CdkNode. Put `[cdkNodeOutlet]` on a tag to place children nodes
 * inside the outlet.
 */
@Directive({
  selector: '[nodeOutlet]'
})
export class NodeOutlet {
  constructor(public viewContainer: ViewContainerRef) { }
}
