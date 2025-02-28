/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, Signal} from '@angular/core';
import {TabPattern} from './tab';

/** The required inputs for the tabpanel. */
export interface TabpanelInputs {
  id: Signal<string>;
  tab: Signal<TabPattern>;
}

/** A tabpanel associated with a tab. */
export class TabpanelPattern {
  /** A unique identifier for the tabpanel. */
  id: Signal<string>;

  /** A reference to the corresponding tab. */
  tab: Signal<TabPattern>;

  /** Whether the tabpanel is hidden. */
  hidden = computed(() => !this.tab().selected());

  constructor(args: TabpanelInputs) {
    this.id = args.id;
    this.tab = args.tab;
  }
}
