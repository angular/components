/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {afterRenderEffect, computed, Directive, inject, input} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';
import {DeferredContentAware} from '../private';
import {DISCLOSURE_TRIGGER} from './disclosure-tokens';
import type {DisclosureTrigger} from './disclosure-trigger';

/**
 * The content panel of a disclosure that is conditionally visible.
 *
 * This directive is a container for the content that is shown or hidden based on the
 * trigger's expanded state. The content can be provided using an `ng-template` with the
 * `ngDeferredContent` directive so that the content is not rendered until the trigger
 * is first expanded.
 *
 * ```html
 * <!-- Straw Hat Pirates crew FAQ with deferred content -->
 * <div class="crew-faq">
 *   <button ngDisclosureTrigger #faq="ngDisclosureTrigger" [controls]="'bounty-info'">
 *     🏴‍☠️ What is Luffy's current bounty?
 *   </button>
 *   <div id="bounty-info" ngDisclosureContent [trigger]="faq">
 *     <ng-template ngDeferredContent>
 *       <p>3,000,000,000 Berries - One of the Four Emperors of the Sea!</p>
 *     </ng-template>
 *   </div>
 * </div>
 * ```
 *
 * @developerPreview 21.0
 *
 * @see [Disclosure](guide/aria/disclosure)
 */
@Directive({
  selector: '[ngDisclosureContent]',
  exportAs: 'ngDisclosureContent',
  hostDirectives: [
    {
      directive: DeferredContentAware,
      inputs: ['preserveContent'],
    },
  ],
  host: {
    '[attr.id]': 'id()',
    '[attr.hidden]': 'hidden() ? true : null',
  },
})
export class DisclosureContent {
  /** The DeferredContentAware host directive. */
  private readonly _deferredContentAware = inject(DeferredContentAware);

  /** The disclosure trigger injected from parent context (optional). */
  private readonly _injectedTrigger = inject<DisclosureTrigger>(DISCLOSURE_TRIGGER, {
    optional: true,
  });

  /** A unique identifier for the content element. */
  readonly id = input(inject(_IdGenerator).getId('ng-disclosure-content-', true));

  /** Reference to the controlling trigger. Falls back to injected trigger. */
  readonly trigger = input<DisclosureTrigger | undefined>(undefined);

  /** The resolved trigger (explicit input or injected). */
  private readonly _resolvedTrigger = computed(() => this.trigger() ?? this._injectedTrigger);

  /** Whether the content is hidden. */
  readonly hidden = computed(() => !this._resolvedTrigger()?.expanded());

  /** Whether the content is visible. */
  readonly visible = computed(() => this._resolvedTrigger()?.expanded() ?? false);

  constructor() {
    // Connect the content's hidden state to the DeferredContentAware's visibility.
    afterRenderEffect(() => {
      this._deferredContentAware.contentVisible.set(this.visible());
    });
  }
}
