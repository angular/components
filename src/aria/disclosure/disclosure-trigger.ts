/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  booleanAttribute,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  model,
} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';
import {DisclosurePattern} from '../private';
import {DISCLOSURE_TRIGGER} from './disclosure-tokens';

/**
 * A trigger that toggles the visibility of its associated disclosure content.
 *
 * The `ngDisclosureTrigger` directive implements the WAI-ARIA disclosure pattern. It provides
 * a button that controls the visibility of associated content. The directive handles keyboard
 * interactions (Enter, Space) and manages ARIA attributes for accessibility.
 *
 * ```html
 * <!-- Devil Fruit encyclopedia with two-way binding -->
 * <article class="devil-fruit-card">
 *   <h3>🍈 Gomu Gomu no Mi</h3>
 *   <p>A Paramecia-type Devil Fruit (until kaido) that grants the user's body rubber properties...</p>
 *   <button ngDisclosureTrigger #details="ngDisclosureTrigger" [(expanded)]="showPowers">
 *     {{ showPowers() ? 'Hide Powers' : 'Reveal Powers' }}
 *   </button>
 *   <div ngDisclosureContent [trigger]="details">
 *     <p>Gear 2nd, Gear 3rd, Gear 4th, Gear 5th - Nika Awakening!</p>
 *   </div>
 * </article>
 * ```
 *
 * @developerPreview 21.0
 *
 * @see [Disclosure](guide/aria/disclosure)
 */
@Directive({
  selector: '[ngDisclosureTrigger]',
  exportAs: 'ngDisclosureTrigger',
  host: {
    'role': 'button',
    '[id]': '_pattern.id()',
    '[attr.aria-expanded]': 'expanded()',
    '[attr.aria-controls]': 'controls()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.tabindex]': '_pattern.tabIndex()',
    '(keydown)': '_pattern.onKeydown($event)',
    '(pointerdown)': '_pattern.onPointerdown($event)',
  },
  providers: [{provide: DISCLOSURE_TRIGGER, useExisting: DisclosureTrigger}],
})
export class DisclosureTrigger {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** A unique identifier for the trigger. */
  readonly id = input(inject(_IdGenerator).getId('ng-disclosure-trigger-', true));

  /** Whether the disclosure content is expanded. */
  readonly expanded = model<boolean>(false);

  /** Whether the disclosure trigger is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Whether the disclosure is always expanded and cannot be closed. */
  readonly alwaysExpanded = input(false, {transform: booleanAttribute});

  /** The ID of the controlled content element. */
  readonly controls = input<string>();

  /** The UI pattern instance for this disclosure trigger. */
  readonly _pattern: DisclosurePattern = new DisclosurePattern({
    id: this.id,
    element: computed(() => this._elementRef.nativeElement),
    expanded: this.expanded,
    disabled: this.disabled,
    alwaysExpanded: this.alwaysExpanded,
    controls: this.controls,
  });

  /** Expands the disclosure content. */
  expand(): void {
    this._pattern.open();
  }

  /** Collapses the disclosure content. */
  collapse(): void {
    this._pattern.close();
  }

  /** Toggles the disclosure content visibility. */
  toggle(): void {
    this._pattern.toggle();
  }
}
