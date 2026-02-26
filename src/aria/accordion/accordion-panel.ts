/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Directive,
  input,
  inject,
  afterRenderEffect,
  signal,
  computed,
  WritableSignal,
} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';
import {DeferredContentAware, AccordionTriggerPattern} from '../private';

/**
 * The content panel of an accordion item that is conditionally visible.
 *
 * This directive is a container for the content that is shown or hidden. It should
 * exlse a template reference that will be used by the corresponding `ngAccordionTrigger`.
 * The content within the panel should be provided using an `ng-template` with the
 * `ngAccordionContent` directive so that the content is not rendered on the page until the trigger
 * is expanded. It applies `role="region"` for accessibility and uses the `inert` attribute to hide
 * its content from assistive technologies when not visible.
 *
 * ```html
 * <div ngAccordionPanel #panel="ngAccordionTrigger">
 *     <p>This content is lazily rendered and will be shown when the panel is expanded.</p>
 *   </ng-template>
 * </div>
 * ```
 *
 * @developerPreview 21.0
 * @see [Accordion](guide/aria/accordion)
 */
@Directive({
  selector: '[ngAccordionPanel]',
  exportAs: 'ngAccordionPanel',
  hostDirectives: [
    {
      directive: DeferredContentAware,
      inputs: ['preserveContent'],
    },
  ],
  host: {
    'role': 'region',
    '[attr.id]': 'id()',
    '[attr.aria-labelledby]': '_accordionTriggerPattern()?.id()',
    '[attr.inert]': '!visible() ? true : null',
  },
})
export class AccordionPanel {
  /** The DeferredContentAware host directive. */
  private readonly _deferredContentAware = inject(DeferredContentAware);

  /** A global unique identifier for the panel. */
  readonly id = input(inject(_IdGenerator).getId('ng-accordion-panel-', true));

  /** Whether the accordion panel is visible. True if the associated trigger is expanded. */
  readonly visible = computed(() => this._accordionTriggerPattern()?.expanded() === true);

  /** The parent accordion trigger pattern that controls this panel. This is set by AccordionGroup. */
  readonly _accordionTriggerPattern: WritableSignal<AccordionTriggerPattern | undefined> =
    signal(undefined);

  constructor() {
    // Connect the panel's hidden state to the DeferredContentAware's visibility.
    afterRenderEffect(() => {
      this._deferredContentAware.contentVisible.set(this.visible());
    });
  }

  /** Expands this item. */
  expand() {
    this._accordionTriggerPattern()?.open();
  }

  /** Collapses this item. */
  collapse() {
    this._accordionTriggerPattern()?.close();
  }

  /** Toggles the expansion state of this item. */
  toggle() {
    this._accordionTriggerPattern()?.toggle();
  }
}
