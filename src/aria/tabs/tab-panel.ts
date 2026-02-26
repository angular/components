/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {_IdGenerator} from '@angular/cdk/a11y';
import {computed, Directive, ElementRef, inject, input, afterRenderEffect} from '@angular/core';
import {TabPattern, TabPanelPattern, DeferredContentAware} from '../private';

/**
 * A TabPanel container for the resources of layered content associated with a tab.
 *
 * The `ngTabPanel` directive holds the content for a specific tab. It is linked to an
 * `ngTab` by a matching `value`. If a tab panel is hidden, the `inert` attribute will be
 * applied to remove it from the accessibility tree. Proper styling is required for visual hiding.
 *
 * ```html
 * <div ngTabPanel value="myTabId">
 *   <ng-template ngTabContent>
 *     <!-- Content for the tab panel -->
 *   </ng-template>
 * </div>
 * ```
 *
 * @developerPreview 21.0
 *
 * @see [Tabs](guide/aria/tabs)
 */
@Directive({
  selector: '[ngTabPanel]',
  exportAs: 'ngTabPanel',
  host: {
    'role': 'tabpanel',
    '[attr.id]': '_pattern.id()',
    '[attr.tabindex]': '_pattern.tabIndex()',
    '[attr.inert]': '!visible() ? true : null',
    '[attr.aria-labelledby]': '_pattern.labelledBy()',
  },
  hostDirectives: [
    {
      directive: DeferredContentAware,
      inputs: ['preserveContent'],
    },
  ],
})
export class TabPanel {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The DeferredContentAware host directive. */
  private readonly _deferredContentAware = inject(DeferredContentAware);

  /** A global unique identifier for the tab. */
  readonly id = input(inject(_IdGenerator).getId('ng-tabpanel-', true));

  /** The Tab UIPattern associated with the tabpanel */
  _tabPattern?: TabPattern;

  /** Whether the tab panel is visible. */
  readonly visible = computed(() => !this._pattern.hidden());

  /** The TabPanel UIPattern. */
  readonly _pattern: TabPanelPattern = new TabPanelPattern({
    ...this,
    tab: () => this._tabPattern,
  });

  constructor() {
    afterRenderEffect(() => this._deferredContentAware.contentVisible.set(this.visible()));
  }
}
