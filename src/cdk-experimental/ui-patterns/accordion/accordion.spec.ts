/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal} from '@angular/core';
import {
  AccordionGroupInputs,
  AccordionGroupPattern,
  AccordionPanelInputs,
  AccordionPanelPattern,
  AccordionTriggerInputs,
  AccordionTriggerPattern,
} from './accordion';
import {SignalLike, WritableSignalLike} from '../behaviors/signal-like/signal-like';
import {createKeyboardEvent} from '@angular/cdk/testing/private';
import {ModifierKeys} from '@angular/cdk/testing';

// Converts the SignalLike type to WritableSignalLike type for controlling test inputs.
type WritableSignalOverrides<O> = {
  [K in keyof O as O[K] extends SignalLike<any> ? K : never]: O[K] extends SignalLike<infer T>
    ? WritableSignalLike<T>
    : never;
};

type TestAccordionGroupInputs = AccordionGroupInputs &
  WritableSignalOverrides<AccordionGroupInputs>;
type TestAccordionTriggerInputs = AccordionTriggerInputs &
  WritableSignalOverrides<AccordionTriggerInputs>;
type TestAccordionPanelInputs = AccordionPanelInputs &
  WritableSignalOverrides<AccordionPanelInputs>;

const up = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 38, 'ArrowUp', mods);
const down = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 40, 'ArrowDown', mods);
const left = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 37, 'ArrowLeft', mods);
const right = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 39, 'ArrowRight', mods);
const home = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 36, 'Home', mods);
const end = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 35, 'End', mods);
const space = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 32, ' ', mods);
const enter = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 13, 'Enter', mods);

function createAccordionTriggerElement(): HTMLElement {
  const element = document.createElement('button');
  element.setAttribute('role', 'button');
  return element;
}

describe('Accordion Pattern', () => {
  let groupInputs: TestAccordionGroupInputs;
  let groupPattern: AccordionGroupPattern;
  let triggerInputs: TestAccordionTriggerInputs[];
  let triggerPatterns: AccordionTriggerPattern[];
  let panelInputs: TestAccordionPanelInputs[];
  let panelPatterns: AccordionPanelPattern[];

  beforeEach(() => {
    // Initiate AccordionGroupPattern.
    groupInputs = {
      orientation: signal('vertical'),
      textDirection: signal('ltr'),
      activeIndex: signal(0),
      disabled: signal(false),
      multiExpandable: signal(true),
      items: signal([]),
      expandedIds: signal<string[]>([]),
      skipDisabled: signal(true),
      wrap: signal(true),
    };
    groupPattern = new AccordionGroupPattern(groupInputs);

    // Initiate a list of AccordionTriggerPattern.
    triggerInputs = [
      {
        accordionGroup: signal(groupPattern),
        accordionPanel: signal(undefined),
        id: signal('trigger-1-id'),
        element: signal(createAccordionTriggerElement()),
        disabled: signal(false),
        value: signal('panel-1'), // Value should match the panel it controls
      },
      {
        accordionGroup: signal(groupPattern),
        accordionPanel: signal(undefined),
        id: signal('trigger-2-id'),
        element: signal(createAccordionTriggerElement()),
        disabled: signal(false),
        value: signal('panel-2'),
      },
      {
        accordionGroup: signal(groupPattern),
        accordionPanel: signal(undefined),
        id: signal('trigger-3-id'),
        element: signal(createAccordionTriggerElement()),
        disabled: signal(false),
        value: signal('panel-3'),
      },
    ];
    triggerPatterns = [
      new AccordionTriggerPattern(triggerInputs[0]),
      new AccordionTriggerPattern(triggerInputs[1]),
      new AccordionTriggerPattern(triggerInputs[2]),
    ];

    // Initiate a list of AccordionPanelPattern.
    panelInputs = [
      {
        id: signal('panel-1-id'),
        value: signal('panel-1'),
        accordionTrigger: signal(undefined),
      },
      {
        id: signal('panel-2-id'),
        value: signal('panel-2'),
        accordionTrigger: signal(undefined),
      },
      {
        id: signal('panel-3-id'),
        value: signal('panel-3'),
        accordionTrigger: signal(undefined),
      },
    ];
    panelPatterns = [
      new AccordionPanelPattern(panelInputs[0]),
      new AccordionPanelPattern(panelInputs[1]),
      new AccordionPanelPattern(panelInputs[2]),
    ];

    // Binding between triggers and panels.
    triggerInputs[0].accordionPanel.set(panelPatterns[0]);
    triggerInputs[1].accordionPanel.set(panelPatterns[1]);
    triggerInputs[2].accordionPanel.set(panelPatterns[2]);
    panelInputs[0].accordionTrigger.set(triggerPatterns[0]);
    panelInputs[1].accordionTrigger.set(triggerPatterns[1]);
    panelInputs[2].accordionTrigger.set(triggerPatterns[2]);
    groupInputs.items.set(triggerPatterns);
  });

  it('expands a panel by setting `value`.', () => {
    expect(triggerPatterns[0].expanded()).toBeFalse();
    groupInputs.expandedIds.set(['panel-1']);
    expect(triggerPatterns[0].expanded()).toBeTrue();
  });

  it('gets a controlled panel id from a trigger.', () => {
    expect(panelPatterns[0].id()).toBe('panel-1-id');
    expect(triggerPatterns[0].controls()).toBe('panel-1-id');
    expect(panelPatterns[1].id()).toBe('panel-2-id');
    expect(triggerPatterns[1].controls()).toBe('panel-2-id');
    expect(panelPatterns[2].id()).toBe('panel-3-id');
    expect(triggerPatterns[2].controls()).toBe('panel-3-id');
  });

  describe('Keyboard Navigation', () => {
    it('does not handle keyboard event if an accordion group is disabled.', () => {
      groupInputs.disabled.set(true);
      triggerPatterns[0].onKeydown(space());
      expect(panelPatterns[0].hidden()).toBeTrue();
    });

    it('does not handle keyboard event if an accordion trigger is disabled.', () => {
      triggerInputs[0].disabled.set(true);
      triggerPatterns[0].onKeydown(space());
      expect(panelPatterns[0].hidden()).toBeTrue();
    });

    it('navigates to first accordion trigger with home key.', () => {
      groupInputs.activeIndex.set(2);
      expect(triggerPatterns[2].active()).toBeTrue();
      triggerPatterns[2].onKeydown(home());
      expect(triggerPatterns[2].active()).toBeFalse();
      expect(triggerPatterns[0].active()).toBeTrue();
    });

    it('navigates to last accordion trigger with end key.', () => {
      groupInputs.activeIndex.set(0);
      expect(triggerPatterns[0].active()).toBeTrue();
      triggerPatterns[0].onKeydown(end());
      expect(triggerPatterns[0].active()).toBeFalse();
      expect(triggerPatterns[2].active()).toBeTrue();
    });

    describe('Vertical Orientation (orientation=vertical)', () => {
      it('navigates to the next trigger with down key.', () => {
        groupInputs.activeIndex.set(0);
        expect(triggerPatterns[0].active()).toBeTrue();
        expect(triggerPatterns[1].active()).toBeFalse();
        triggerPatterns[0].onKeydown(down());
        expect(triggerPatterns[0].active()).toBeFalse();
        expect(triggerPatterns[1].active()).toBeTrue();
      });

      it('navigates to the previous trigger with up key.', () => {
        groupInputs.activeIndex.set(1);
        expect(triggerPatterns[0].active()).toBeFalse();
        expect(triggerPatterns[1].active()).toBeTrue();
        triggerPatterns[1].onKeydown(up());
        expect(triggerPatterns[1].active()).toBeFalse();
        expect(triggerPatterns[0].active()).toBeTrue();
      });

      describe('wrap=true', () => {
        beforeEach(() => {
          groupInputs.wrap.set(true);
        });

        it('navigates to the last trigger with up key from first trigger.', () => {
          groupInputs.activeIndex.set(0);
          expect(triggerPatterns[0].active()).toBeTrue();
          expect(triggerPatterns[2].active()).toBeFalse();
          triggerPatterns[0].onKeydown(up());
          expect(triggerPatterns[0].active()).toBeFalse();
          expect(triggerPatterns[2].active()).toBeTrue();
        });

        it('navigates to the first trigger with down key from last trigger.', () => {
          groupInputs.activeIndex.set(2);
          expect(triggerPatterns[0].active()).toBeFalse();
          expect(triggerPatterns[2].active()).toBeTrue();
          triggerPatterns[2].onKeydown(down());
          expect(triggerPatterns[0].active()).toBeTrue();
          expect(triggerPatterns[2].active()).toBeFalse();
        });
      });

      describe('wrap=false', () => {
        beforeEach(() => {
          groupInputs.wrap.set(false);
        });

        it('stays on the first trigger with up key from first trigger.', () => {
          groupInputs.activeIndex.set(0);
          expect(triggerPatterns[0].active()).toBeTrue();
          triggerPatterns[0].onKeydown(up());
          expect(triggerPatterns[0].active()).toBeTrue();
        });

        it('stays on the last trigger with down key from last trigger.', () => {
          groupInputs.activeIndex.set(2);
          expect(triggerPatterns[2].active()).toBeTrue();
          triggerPatterns[2].onKeydown(down());
          expect(triggerPatterns[2].active()).toBeTrue();
        });
      });
    });

    describe('Horizontal Orientation (orientation=horizontal)', () => {
      beforeEach(() => {
        groupInputs.orientation.set('horizontal');
      });

      it('navigates to the next trigger with right key.', () => {
        groupInputs.activeIndex.set(0);
        expect(triggerPatterns[0].active()).toBeTrue();
        expect(triggerPatterns[1].active()).toBeFalse();
        triggerPatterns[0].onKeydown(right());
        expect(triggerPatterns[0].active()).toBeFalse();
        expect(triggerPatterns[1].active()).toBeTrue();
      });

      it('navigates to the previous trigger with left key.', () => {
        groupInputs.activeIndex.set(1);
        expect(triggerPatterns[0].active()).toBeFalse();
        expect(triggerPatterns[1].active()).toBeTrue();
        triggerPatterns[1].onKeydown(left());
        expect(triggerPatterns[1].active()).toBeFalse();
        expect(triggerPatterns[0].active()).toBeTrue();
      });

      describe('wrap=true', () => {
        beforeEach(() => {
          groupInputs.wrap.set(true);
        });

        it('navigates to the last trigger with left key from first trigger.', () => {
          groupInputs.activeIndex.set(0);
          expect(triggerPatterns[0].active()).toBeTrue();
          expect(triggerPatterns[2].active()).toBeFalse();
          triggerPatterns[0].onKeydown(left());
          expect(triggerPatterns[0].active()).toBeFalse();
          expect(triggerPatterns[2].active()).toBeTrue();
        });

        it('navigates to the first trigger with right key from last trigger.', () => {
          groupInputs.activeIndex.set(2);
          expect(triggerPatterns[2].active()).toBeTrue();
          expect(triggerPatterns[0].active()).toBeFalse();
          triggerPatterns[2].onKeydown(right());
          expect(triggerPatterns[2].active()).toBeFalse();
          expect(triggerPatterns[0].active()).toBeTrue();
        });
      });

      describe('wrap=false', () => {
        beforeEach(() => {
          groupInputs.wrap.set(false);
        });

        it('stays on the first trigger with left key from first trigger.', () => {
          groupInputs.activeIndex.set(0);
          expect(triggerPatterns[0].active()).toBeTrue();
          triggerPatterns[0].onKeydown(left());
          expect(triggerPatterns[0].active()).toBeTrue();
        });

        it('stays on the last trigger with right key from last trigger.', () => {
          groupInputs.activeIndex.set(2);
          expect(triggerPatterns[2].active()).toBeTrue();
          triggerPatterns[2].onKeydown(right());
          expect(triggerPatterns[2].active()).toBeTrue();
        });
      });
    });

    describe('Single Expansion (multi=false)', () => {
      beforeEach(() => {
        groupInputs.multiExpandable.set(false);
      });

      it('expands a panel and collapses others with space key.', () => {
        groupInputs.expandedIds.set(['panel-2']);
        expect(panelPatterns[0].hidden()).toBeTrue();
        expect(panelPatterns[1].hidden()).toBeFalse();

        triggerPatterns[0].onKeydown(space());
        expect(panelPatterns[0].hidden()).toBeFalse();
        expect(panelPatterns[1].hidden()).toBeTrue();
      });

      it('expands a panel and collapses others with enter key.', () => {
        groupInputs.expandedIds.set(['panel-2']);
        expect(panelPatterns[0].hidden()).toBeTrue();
        expect(panelPatterns[1].hidden()).toBeFalse();

        triggerPatterns[0].onKeydown(space());
        expect(panelPatterns[0].hidden()).toBeFalse();
        expect(panelPatterns[1].hidden()).toBeTrue();
      });
    });

    describe('Multiple Expansion (multi=true)', () => {
      beforeEach(() => {
        groupInputs.multiExpandable.set(true);
      });

      it('expands a panel without affecting other panels.', () => {
        groupInputs.expandedIds.set(['panel-2']);
        expect(panelPatterns[0].hidden()).toBeTrue();
        expect(panelPatterns[1].hidden()).toBeFalse();

        triggerPatterns[0].onKeydown(space());
        expect(panelPatterns[0].hidden()).toBeFalse();
        expect(panelPatterns[1].hidden()).toBeFalse();
      });

      it('collapses a panel without affecting other panels.', () => {
        groupInputs.expandedIds.set(['panel-1', 'panel-2']);
        expect(panelPatterns[0].hidden()).toBeFalse();
        expect(panelPatterns[1].hidden()).toBeFalse();

        triggerPatterns[0].onKeydown(enter());
        expect(panelPatterns[0].hidden()).toBeTrue();
        expect(panelPatterns[1].hidden()).toBeFalse();
      });
    });
  });
});
