/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal} from '@angular/core';
import {
  TabInputs,
  TabPattern,
  TabListInputs,
  TabListPattern,
  TabPanelInputs,
  TabPanelPattern,
} from './tabs';
import {SignalLike, WritableSignalLike} from '../behaviors/signal-like/signal-like';
import {createKeyboardEvent} from '@angular/cdk/testing/private';
import {ModifierKeys} from '@angular/cdk/testing';

// Converts the SignalLike type to WritableSignalLike type for controlling test inputs.
type WritableSignalOverrides<O> = {
  [K in keyof O as O[K] extends SignalLike<any> ? K : never]: O[K] extends SignalLike<infer T>
    ? WritableSignalLike<T>
    : never;
};

type TestTabListInputs = TabListInputs & WritableSignalOverrides<TabListInputs>;
type TestTabInputs = TabInputs & WritableSignalOverrides<TabInputs>;
type TestTabPanelInputs = TabPanelInputs & WritableSignalOverrides<TabPanelInputs>;

const up = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 38, 'ArrowUp', mods);
const down = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 40, 'ArrowDown', mods);
const left = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 37, 'ArrowLeft', mods);
const right = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 39, 'ArrowRight', mods);
const home = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 36, 'Home', mods);
const end = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 35, 'End', mods);
const space = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 32, ' ', mods);
const enter = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 13, 'Enter', mods);

function createTabElement(): HTMLElement {
  const element = document.createElement('div');
  element.role = 'tab';
  return element;
}

describe('Tabs Pattern', () => {
  let tabListInputs: TestTabListInputs;
  let tabListPattern: TabListPattern;
  let tabInputs: TestTabInputs[];
  let tabPatterns: TabPattern[];
  let tabPanelInputs: TestTabPanelInputs[];
  let tabPanelPatterns: TabPanelPattern[];

  beforeEach(() => {
    // Initiate TabListPattern.
    tabListInputs = {
      orientation: signal('horizontal'),
      wrap: signal(true),
      textDirection: signal('ltr'),
      selectionMode: signal('follow'),
      focusMode: signal('roving'),
      disabled: signal(false),
      activeIndex: signal(0),
      skipDisabled: signal(true),
      items: signal([]),
      value: signal(['tab-1']),
    };
    tabListPattern = new TabListPattern(tabListInputs);

    // Initiate a list of TabPatterns.
    tabInputs = [
      {
        tablist: signal(tabListPattern),
        tabpanel: signal(undefined),
        id: signal('tab-1-id'),
        element: signal(createTabElement()),
        disabled: signal(false),
        value: signal('tab-1'),
      },
      {
        tablist: signal(tabListPattern),
        tabpanel: signal(undefined),
        id: signal('tab-2-id'),
        element: signal(createTabElement()),
        disabled: signal(false),
        value: signal('tab-2'),
      },
      {
        tablist: signal(tabListPattern),
        tabpanel: signal(undefined),
        id: signal('tab-3-id'),
        element: signal(createTabElement()),
        disabled: signal(false),
        value: signal('tab-3'),
      },
    ];
    tabPatterns = [
      new TabPattern(tabInputs[0]),
      new TabPattern(tabInputs[1]),
      new TabPattern(tabInputs[2]),
    ];

    // Initiate a list of TabPanelPatterns.
    tabPanelInputs = [
      {
        id: signal('tabpanel-1-id'),
        tab: signal(undefined),
        value: signal('tab-1'),
      },
      {
        id: signal('tabpanel-2-id'),
        tab: signal(undefined),
        value: signal('tab-2'),
      },
      {
        id: signal('tabpanel-3-id'),
        tab: signal(undefined),
        value: signal('tab-3'),
      },
    ];
    tabPanelPatterns = [
      new TabPanelPattern(tabPanelInputs[0]),
      new TabPanelPattern(tabPanelInputs[1]),
      new TabPanelPattern(tabPanelInputs[2]),
    ];

    // Binding between tabs and tabpanels.
    tabInputs[0].tabpanel.set(tabPanelPatterns[0]);
    tabInputs[1].tabpanel.set(tabPanelPatterns[1]);
    tabInputs[2].tabpanel.set(tabPanelPatterns[2]);
    tabPanelInputs[0].tab.set(tabPatterns[0]);
    tabPanelInputs[1].tab.set(tabPatterns[1]);
    tabPanelInputs[2].tab.set(tabPatterns[2]);
    tabListInputs.items.set(tabPatterns);
  });

  it('sets the selected tab by setting `value`.', () => {
    expect(tabPatterns[0].selected()).toBeTrue();
    expect(tabPatterns[1].selected()).toBeFalse();
    tabListInputs.value.set(['tab-2']);
    expect(tabPatterns[0].selected()).toBeFalse();
    expect(tabPatterns[1].selected()).toBeTrue();
  });

  it('sets a tabpanel to be not hidden if a tab is selected.', () => {
    tabListInputs.value.set(['tab-1']);
    expect(tabPatterns[0].selected()).toBeTrue();
    expect(tabPanelPatterns[0].hidden()).toBeFalse();
  });

  it('sets a tabpanel to be hidden if a tab is not selected.', () => {
    tabListInputs.value.set(['tab-1']);
    expect(tabPatterns[1].selected()).toBeFalse();
    expect(tabPanelPatterns[1].hidden()).toBeTrue();
  });

  it('gets a controlled tabpanel id from a tab.', () => {
    expect(tabPanelPatterns[0].id()).toBe('tabpanel-1-id');
    expect(tabPatterns[0].controls()).toBe('tabpanel-1-id');
    expect(tabPanelPatterns[1].id()).toBe('tabpanel-2-id');
    expect(tabPatterns[1].controls()).toBe('tabpanel-2-id');
    expect(tabPanelPatterns[2].id()).toBe('tabpanel-3-id');
    expect(tabPatterns[2].controls()).toBe('tabpanel-3-id');
  });

  describe('Keyboard Navigation', () => {
    it('does not handle keyboard event if a tablist is disabled.', () => {
      expect(tabPatterns[1].active()).toBeFalse();
      tabListInputs.disabled.set(true);
      tabListPattern.onKeydown(right());
      expect(tabPatterns[1].active()).toBeFalse();
    });

    it('skips the disabled tab when `skipDisabled` is set to true.', () => {
      tabInputs[1].disabled.set(true);
      tabListPattern.onKeydown(right());
      expect(tabPatterns[0].active()).toBeFalse();
      expect(tabPatterns[1].active()).toBeFalse();
      expect(tabPatterns[2].active()).toBeTrue();
    });

    it('does not skip the disabled tab when `skipDisabled` is set to false.', () => {
      tabListInputs.skipDisabled.set(false);
      tabInputs[1].disabled.set(true);
      tabListPattern.onKeydown(right());
      expect(tabPatterns[0].active()).toBeFalse();
      expect(tabPatterns[1].active()).toBeTrue();
      expect(tabPatterns[2].active()).toBeFalse();
    });

    it('selects a tab by focus if `selectionMode` is "follow".', () => {
      expect(tabPatterns[0].selected()).toBeTrue();
      expect(tabPatterns[1].selected()).toBeFalse();
      tabListPattern.onKeydown(right());
      expect(tabPatterns[0].selected()).toBeFalse();
      expect(tabPatterns[1].selected()).toBeTrue();
    });

    it('selects a tab by enter key if `selectionMode` is "explicit".', () => {
      tabListInputs.selectionMode.set('explicit');
      expect(tabPatterns[0].selected()).toBeTrue();
      expect(tabPatterns[1].selected()).toBeFalse();
      tabListPattern.onKeydown(right());
      expect(tabPatterns[0].selected()).toBeTrue();
      expect(tabPatterns[1].selected()).toBeFalse();
      tabListPattern.onKeydown(enter());
      expect(tabPatterns[0].selected()).toBeFalse();
      expect(tabPatterns[1].selected()).toBeTrue();
    });

    it('selects a tab by space key if `selectionMode` is "explicit".', () => {
      tabListInputs.selectionMode.set('explicit');
      expect(tabPatterns[0].selected()).toBeTrue();
      expect(tabPatterns[1].selected()).toBeFalse();
      tabListPattern.onKeydown(right());
      expect(tabPatterns[0].selected()).toBeTrue();
      expect(tabPatterns[1].selected()).toBeFalse();
      tabListPattern.onKeydown(space());
      expect(tabPatterns[0].selected()).toBeFalse();
      expect(tabPatterns[1].selected()).toBeTrue();
    });

    it('uses left key to navigate to the previous tab when `orientation` is set to "horizontal".', () => {
      tabListInputs.activeIndex.set(1);
      expect(tabPatterns[1].active()).toBeTrue();
      tabListPattern.onKeydown(left());
      expect(tabPatterns[0].active()).toBeTrue();
    });

    it('uses right key to navigate to the next tab when `orientation` is set to "horizontal".', () => {
      tabListInputs.activeIndex.set(1);
      expect(tabPatterns[1].active()).toBeTrue();
      tabListPattern.onKeydown(right());
      expect(tabPatterns[2].active()).toBeTrue();
    });

    it('uses up key to navigate to the previous tab when `orientation` is set to "vertical".', () => {
      tabListInputs.orientation.set('vertical');
      tabListInputs.activeIndex.set(1);
      expect(tabPatterns[1].active()).toBeTrue();
      tabListPattern.onKeydown(up());
      expect(tabPatterns[0].active()).toBeTrue();
    });

    it('uses down key to navigate to the next tab when `orientation` is set to "vertical".', () => {
      tabListInputs.orientation.set('vertical');
      tabListInputs.activeIndex.set(1);
      expect(tabPatterns[1].active()).toBeTrue();
      tabListPattern.onKeydown(down());
      expect(tabPatterns[2].active()).toBeTrue();
    });

    it('uses home key to navigate to the first tab.', () => {
      tabListInputs.activeIndex.set(1);
      expect(tabPatterns[1].active()).toBeTrue();
      tabListPattern.onKeydown(home());
      expect(tabPatterns[0].active()).toBeTrue();
    });

    it('uses end key to navigate to the last tab.', () => {
      tabListInputs.activeIndex.set(1);
      expect(tabPatterns[1].active()).toBeTrue();
      tabListPattern.onKeydown(end());
      expect(tabPatterns[2].active()).toBeTrue();
    });

    it('moves to the last tab from first tab when navigating to the previous tab if `wrap` is set to true', () => {
      expect(tabPatterns[0].active()).toBeTrue();
      tabListPattern.onKeydown(left());
      expect(tabPatterns[2].active()).toBeTrue();
    });

    it('moves to the first tab from last tab when navigating to the next tab if `wrap` is set to true', () => {
      tabListPattern.onKeydown(end());
      expect(tabPatterns[2].active()).toBeTrue();
      tabListPattern.onKeydown(right());
      expect(tabPatterns[0].active()).toBeTrue();
    });

    it('stays on the first tab when navigating to the previous tab if `wrap` is set to false', () => {
      tabListInputs.wrap.set(false);
      expect(tabPatterns[0].active()).toBeTrue();
      tabListPattern.onKeydown(left());
      expect(tabPatterns[0].active()).toBeTrue();
    });

    it('stays on the last tab when navigating to the next tab if `wrap` is set to false', () => {
      tabListInputs.wrap.set(false);
      tabListPattern.onKeydown(end());
      expect(tabPatterns[2].active()).toBeTrue();
      tabListPattern.onKeydown(right());
      expect(tabPatterns[2].active()).toBeTrue();
    });

    it('changes the navigation direction with `rtl` mode.', () => {
      tabListInputs.textDirection.set('rtl');
      tabListInputs.activeIndex.set(1);
      tabListPattern.onKeydown(left());
      expect(tabPatterns[2].active()).toBeTrue();
    });
  });
});
