/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, WritableSignal} from '@angular/core';
import {ExpansionControl, ExpansionPanel} from './expansion';

describe('Expansion', () => {
  let testExpansionControl: ExpansionControl;
  let panelVisibility: WritableSignal<boolean>;
  let testExpansionPanel: ExpansionPanel;

  beforeEach(() => {
    let expansionControlRef = signal<ExpansionControl | undefined>(undefined);
    let expansionPanelRef = signal<ExpansionPanel | undefined>(undefined);
    panelVisibility = signal(false);
    testExpansionControl = new ExpansionControl({
      visible: panelVisibility,
      expansionPanel: expansionPanelRef,
    });
    testExpansionPanel = new ExpansionPanel({
      id: () => 'test-panel',
      expansionControl: expansionControlRef,
    });
    expansionControlRef.set(testExpansionControl);
    expansionPanelRef.set(testExpansionPanel);
  });

  it('sets a panel hidden to true by setting a control to invisible.', () => {
    panelVisibility.set(false);
    expect(testExpansionPanel.hidden()).toBeTrue();
  });

  it('sets a panel hidden to false by setting a control to visible.', () => {
    panelVisibility.set(true);
    expect(testExpansionPanel.hidden()).toBeFalse();
  });

  it('gets a controlled panel id from ExpansionControl.', () => {
    expect(testExpansionControl.controls()).toBe('test-panel');
  });
});
