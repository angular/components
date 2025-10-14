/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterRenderEffect,
  Directive,
  inject,
  TemplateRef,
  signal,
  ViewContainerRef,
  model,
} from '@angular/core';

/**
 * A container directive controls the visibility of its content.
 */
@Directive()
export class DeferredContentAware {
  readonly contentVisible = signal(false);
  readonly preserveContent = model(false);
}

/**
 * DeferredContent loads/unloads the content based on the visibility.
 * The visibilty signal is sent from a parent directive implements
 * DeferredContentAware.
 *
 * Use this directive as a host directive. For example:
 *
 * ```ts
 *   @Directive({
 *     selector: 'ng-template[AccordionContent]',
 *     hostDirectives: [DeferredContent],
 *   })
 *   class AccordionContent {}
 * ```
 */
@Directive()
export class DeferredContent {
  private readonly _deferredContentAware = inject(DeferredContentAware, {optional: true});
  private readonly _templateRef = inject(TemplateRef);
  private readonly _viewContainerRef = inject(ViewContainerRef);
  private _isRendered = false;

  readonly deferredContentAware = signal(this._deferredContentAware);

  constructor() {
    afterRenderEffect(() => {
      if (this.deferredContentAware()?.contentVisible()) {
        if (this._isRendered) return;
        this._viewContainerRef.clear();
        this._viewContainerRef.createEmbeddedView(this._templateRef);
        this._isRendered = true;
      } else if (!this.deferredContentAware()?.preserveContent()) {
        this._viewContainerRef.clear();
        this._isRendered = false;
      }
    });
  }
}
