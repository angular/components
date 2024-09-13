/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Directive,
  InjectionToken,
  Input,
  OnDestroy,
  TemplateRef,
  booleanAttribute,
  inject,
} from '@angular/core';
import {CDK_DRAG_PARENT} from '../drag-parent';

/**
 * Injection token that can be used to reference instances of `CdkDragPreview`. It serves as
 * alternative token to the actual `CdkDragPreview` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const CDK_DRAG_PREVIEW = new InjectionToken<CdkDragPreview>('CdkDragPreview');

/**
 * Element that will be used as a template for the preview
 * of a CdkDrag when it is being dragged.
 */
@Directive({
  selector: 'ng-template[cdkDragPreview]',
  standalone: true,
  providers: [{provide: CDK_DRAG_PREVIEW, useExisting: CdkDragPreview}],
})
export class CdkDragPreview<T = any> implements OnDestroy {
  templateRef = inject<TemplateRef<T>>(TemplateRef);

  private _drag = inject(CDK_DRAG_PARENT, {optional: true});

  /** Context data to be added to the preview template instance. */
  @Input() data: T;

  /** Whether the preview should preserve the same size as the item that is being dragged. */
  @Input({transform: booleanAttribute}) matchSize: boolean = false;

  constructor(...args: unknown[]);

  constructor() {
    this._drag?._setPreviewTemplate(this);
  }

  ngOnDestroy(): void {
    this._drag?._resetPreviewTemplate(this);
  }
}
