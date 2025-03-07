/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {SignalLike} from '../behaviors/signal-like/signal-like';
import {TabPattern} from './tab';

/** The required inputs for the tabpanel. */
export interface TabpanelInputs {
  id: SignalLike<string>;
  tab: SignalLike<TabPattern>;
}

/** A tabpanel associated with a tab. */
export class TabpanelPattern {
  /** A unique identifier for the tabpanel. */
  id: SignalLike<string>;

  /** A reference to the corresponding tab. */
  tab: SignalLike<TabPattern>;

  /** Whether the tabpanel is hidden. */
  hidden = computed(() => !this.tab().selected());

  constructor(inputs: TabpanelInputs) {
    this.id = inputs.id;
    this.tab = inputs.tab;
  }
}
