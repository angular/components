/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, ElementRef, afterRenderEffect, computed, inject, input} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';
import {AccordionTriggerPattern, DeferredContentAware, LabelControl} from '../private';

/**
 * The content panel of an accordion item that is conditionally visible.
 *
 * This directive is a container for the content that is shown or hidden. It should
 * expose a template reference that will be used by the corresponding `ngAccordionTrigger`.
 * The content within the panel should be provided using an `ng-template` with the
 * `ngAccordionContent` directive so that the content is not rendered on the page until the trigger
 * is expanded. It applies `role="region"` for accessibility and uses the `inert` attribute to hide
 * its content from assistive technologies when not visible.
 *
 * ```html
 * <div ngAccordionPanel #panel="ngAccordionPanel">
 *   <ng-template ngAccordionContent>
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
    '[attr.aria-label]': '_labelControl.label()',
    '[attr.aria-labelledby]': '_labelControl.labelledBy()',
    '[attr.inert]': '!visible() ? true : null',
  },
})
export class AccordionPanel {
  /** A reference to the trigger element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the trigger element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The DeferredContentAware host directive. */
  private readonly _deferredContentAware = inject(DeferredContentAware);

  /** Controls label for this tabpanel. */
  readonly _labelControl: LabelControl;

  /** A global unique identifier for the panel. */
  readonly id = input(inject(_IdGenerator).getId('ng-accordion-panel-', true));

  /** The (optional) label for the accordion panel. */
  readonly label = input<string | undefined>(undefined);

  /** The (optional) labelledBy ids for the accordion panel. */
  readonly labelledBy = input<string[]>([]);

  /** Whether the accordion panel is visible. True if the associated trigger is expanded. */
  readonly visible = computed(() => this._pattern?.expanded() === true);

  /**
   * The pattern for the accordion trigger that controls this panel.
   * This is set by the trigger when it initializes.
   * There is no need for a panel pattern, as the trigger has all the necessary logic.
   */
  _pattern?: AccordionTriggerPattern;

  constructor() {
    this._labelControl = new LabelControl({
      defaultLabelledBy: computed(() => this._pattern!.id()),
      label: this.label,
      labelledBy: this.labelledBy,
    });

    // Connect the panel's hidden state to the DeferredContentAware's visibility.
    afterRenderEffect({
      write: () => {
        this._deferredContentAware.contentVisible.set(this.visible());
      },
    });
  }

  /** Expands this item. */
  expand() {
    this._pattern?.open();
  }

  /** Collapses this item. */
  collapse() {
    this._pattern?.close();
  }

  /** Toggles the expansion state of this item. */
  toggle() {
    this._pattern?.toggle();
  }
}
