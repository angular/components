/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  Directive,
  ViewContainerRef,
} from '@angular/core';


/**
 * Placeholder for nested CdkNode. Put `[cdkNodePlaceholder]` on a tag to place children nodes
 * inside the placeholder.
 */
@Directive({
  selector: '[cdkNodePlaceholder]'
})
export class CdkNodePlaceholder {
  constructor(public viewContainer: ViewContainerRef) { }
}
