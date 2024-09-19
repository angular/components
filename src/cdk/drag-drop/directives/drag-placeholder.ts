/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, TemplateRef, Input, InjectionToken, inject, OnDestroy} from '@angular/core';
import {CDK_DRAG_PARENT} from '../drag-parent';

/**
 * Injection token that can be used to reference instances of `CdkDragPlaceholder`. It serves as
 * alternative token to the actual `CdkDragPlaceholder` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const CDK_DRAG_PLACEHOLDER = new InjectionToken<CdkDragPlaceholder>('CdkDragPlaceholder');

/**
 * Element that will be used as a template for the placeholder of a CdkDrag when
 * it is being dragged. The placeholder is displayed in place of the element being dragged.
 */
@Directive({
  selector: 'ng-template[cdkDragPlaceholder]',
  standalone: true,
  providers: [{provide: CDK_DRAG_PLACEHOLDER, useExisting: CdkDragPlaceholder}],
})
export class CdkDragPlaceholder<T = any> implements OnDestroy {
  templateRef = inject<TemplateRef<T>>(TemplateRef);

  private _drag = inject(CDK_DRAG_PARENT, {optional: true});

  /** Context data to be added to the placeholder template instance. */
  @Input() data: T;

  constructor(...args: unknown[]);

  constructor() {
    this._drag?._setPlaceholderTemplate(this);
  }

  ngOnDestroy(): void {
    this._drag?._resetPlaceholderTemplate(this);
  }
}
