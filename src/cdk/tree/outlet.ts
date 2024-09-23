/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Directive, InjectionToken, ViewContainerRef, inject} from '@angular/core';

/**
 * Injection token used to provide a `CdkTreeNode` to its outlet.
 * Used primarily to avoid circular imports.
 * @docs-private
 */
export const CDK_TREE_NODE_OUTLET_NODE = new InjectionToken<{}>('CDK_TREE_NODE_OUTLET_NODE');

/**
 * Outlet for nested CdkNode. Put `[cdkTreeNodeOutlet]` on a tag to place children dataNodes
 * inside the outlet.
 */
@Directive({
  selector: '[cdkTreeNodeOutlet]',
  standalone: true,
})
export class CdkTreeNodeOutlet {
  viewContainer = inject(ViewContainerRef);
  _node? = inject(CDK_TREE_NODE_OUTLET_NODE, {optional: true});

  constructor(...args: unknown[]);
  constructor() {}
}
