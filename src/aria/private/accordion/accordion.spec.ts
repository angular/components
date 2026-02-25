/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AccordionGroupInputs,
  AccordionGroupPattern,
  AccordionTriggerInputs,
  AccordionTriggerPattern,
} from './accordion';
import {signal, SignalLike, WritableSignalLike} from '../behaviors/signal-like/signal-like';
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

  beforeEach(() => {
    // Initiate AccordionGroupPattern.
    groupInputs = {
      orientation: signal('vertical'),
      textDirection: signal('ltr'),
      activeItem: signal(undefined),
      disabled: signal(false),
      multiExpandable: signal(true),
      items: signal([]),
      softDisabled: signal(true),
      wrap: signal(true),
      element: signal(document.createElement('div')),
      getItem: e => triggerPatterns.find(i => i.element() === e),
    };
    groupPattern = new AccordionGroupPattern(groupInputs);

    // Initiate a list of AccordionTriggerPattern.
    triggerInputs = [
      {
        accordionGroup: signal(groupPattern),
        accordionPanelId: signal('panel-1-id'),
        id: signal('trigger-1-id'),
        element: signal(createAccordionTriggerElement()),
        disabled: signal(false),
        expanded: signal(false),
      },
      {
        accordionGroup: signal(groupPattern),
        accordionPanelId: signal('panel-2-id'),
        id: signal('trigger-2-id'),
        element: signal(createAccordionTriggerElement()),
        disabled: signal(false),
        expanded: signal(false),
      },
      {
        accordionGroup: signal(groupPattern),
        accordionPanelId: signal('panel-3-id'),
        id: signal('trigger-3-id'),
        element: signal(createAccordionTriggerElement()),
        disabled: signal(false),
        expanded: signal(false),
      },
    ];
    triggerPatterns = [
      new AccordionTriggerPattern(triggerInputs[0]),
      new AccordionTriggerPattern(triggerInputs[1]),
      new AccordionTriggerPattern(triggerInputs[2]),
    ];

    groupInputs.items.set(triggerPatterns);
    groupPattern.inputs.activeItem.set(triggerPatterns[0]);
  });

  it('gets a controlled panel id from a trigger.', () => {
    expect(triggerPatterns[0].controls()).toBe('panel-1-id');
    expect(triggerPatterns[1].controls()).toBe('panel-2-id');
    expect(triggerPatterns[2].controls()).toBe('panel-3-id');
  });

  describe('Keyboard Navigation', () => {
    it('does not handle keyboard event if an accordion group is disabled.', () => {
      groupInputs.disabled.set(true);
      groupInputs.activeItem.set(triggerPatterns[0]);
      groupPattern.onKeydown(space());
      expect(triggerPatterns[0].expanded()).toBeFalse();
    });

    it('does not handle keyboard event if an accordion trigger is disabled.', () => {
      triggerInputs[0].disabled.set(true);
      groupInputs.activeItem.set(triggerPatterns[0]);
      groupPattern.onKeydown(space());
      expect(triggerPatterns[0].expanded()).toBeFalse();
    });

    it('navigates to first accordion trigger with home key.', () => {
      groupInputs.activeItem.set(triggerPatterns[2]);
      expect(triggerPatterns[2].active()).toBeTrue();
      groupPattern.onKeydown(home());
      expect(triggerPatterns[2].active()).toBeFalse();
      expect(triggerPatterns[0].active()).toBeTrue();
    });

    it('navigates to last accordion trigger with end key.', () => {
      groupInputs.activeItem.set(triggerPatterns[0]);
      expect(triggerPatterns[0].active()).toBeTrue();
      groupPattern.onKeydown(end());
      expect(triggerPatterns[0].active()).toBeFalse();
      expect(triggerPatterns[2].active()).toBeTrue();
    });

    describe('Vertical Orientation (orientation=vertical)', () => {
      it('navigates to the next trigger with down key.', () => {
        groupInputs.activeItem.set(triggerPatterns[0]);
        expect(triggerPatterns[0].active()).toBeTrue();
        expect(triggerPatterns[1].active()).toBeFalse();
        groupPattern.onKeydown(down());
        expect(triggerPatterns[0].active()).toBeFalse();
        expect(triggerPatterns[1].active()).toBeTrue();
      });

      it('navigates to the previous trigger with up key.', () => {
        groupInputs.activeItem.set(triggerPatterns[1]);
        expect(triggerPatterns[0].active()).toBeFalse();
        expect(triggerPatterns[1].active()).toBeTrue();
        groupPattern.onKeydown(up());
        expect(triggerPatterns[1].active()).toBeFalse();
        expect(triggerPatterns[0].active()).toBeTrue();
      });

      describe('wrap=true', () => {
        beforeEach(() => {
          groupInputs.wrap.set(true);
        });

        it('navigates to the last trigger with up key from first trigger.', () => {
          groupInputs.activeItem.set(triggerPatterns[0]);
          expect(triggerPatterns[0].active()).toBeTrue();
          expect(triggerPatterns[2].active()).toBeFalse();
          groupPattern.onKeydown(up());
          expect(triggerPatterns[0].active()).toBeFalse();
          expect(triggerPatterns[2].active()).toBeTrue();
        });

        it('navigates to the first trigger with down key from last trigger.', () => {
          groupInputs.activeItem.set(triggerPatterns[2]);
          expect(triggerPatterns[0].active()).toBeFalse();
          expect(triggerPatterns[2].active()).toBeTrue();
          groupPattern.onKeydown(down());
          expect(triggerPatterns[0].active()).toBeTrue();
          expect(triggerPatterns[2].active()).toBeFalse();
        });
      });

      describe('wrap=false', () => {
        beforeEach(() => {
          groupInputs.wrap.set(false);
        });

        it('stays on the first trigger with up key from first trigger.', () => {
          groupInputs.activeItem.set(triggerPatterns[0]);
          expect(triggerPatterns[0].active()).toBeTrue();
          groupPattern.onKeydown(up());
          expect(triggerPatterns[0].active()).toBeTrue();
        });

        it('stays on the last trigger with down key from last trigger.', () => {
          groupInputs.activeItem.set(triggerPatterns[2]);
          expect(triggerPatterns[2].active()).toBeTrue();
          groupPattern.onKeydown(down());
          expect(triggerPatterns[2].active()).toBeTrue();
        });
      });
    });

    describe('Horizontal Orientation (orientation=horizontal)', () => {
      beforeEach(() => {
        groupInputs.orientation.set('horizontal');
      });

      it('navigates to the next trigger with right key.', () => {
        groupInputs.activeItem.set(triggerPatterns[0]);
        expect(triggerPatterns[0].active()).toBeTrue();
        expect(triggerPatterns[1].active()).toBeFalse();
        groupPattern.onKeydown(right());
        expect(triggerPatterns[0].active()).toBeFalse();
        expect(triggerPatterns[1].active()).toBeTrue();
      });

      it('navigates to the previous trigger with left key.', () => {
        groupInputs.activeItem.set(triggerPatterns[1]);
        expect(triggerPatterns[0].active()).toBeFalse();
        expect(triggerPatterns[1].active()).toBeTrue();
        groupPattern.onKeydown(left());
        expect(triggerPatterns[1].active()).toBeFalse();
        expect(triggerPatterns[0].active()).toBeTrue();
      });

      describe('wrap=true', () => {
        beforeEach(() => {
          groupInputs.wrap.set(true);
        });

        it('navigates to the last trigger with left key from first trigger.', () => {
          groupInputs.activeItem.set(triggerPatterns[0]);
          expect(triggerPatterns[0].active()).toBeTrue();
          expect(triggerPatterns[2].active()).toBeFalse();
          groupPattern.onKeydown(left());
          expect(triggerPatterns[0].active()).toBeFalse();
          expect(triggerPatterns[2].active()).toBeTrue();
        });

        it('navigates to the first trigger with right key from last trigger.', () => {
          groupInputs.activeItem.set(triggerPatterns[2]);
          expect(triggerPatterns[2].active()).toBeTrue();
          expect(triggerPatterns[0].active()).toBeFalse();
          groupPattern.onKeydown(right());
          expect(triggerPatterns[2].active()).toBeFalse();
          expect(triggerPatterns[0].active()).toBeTrue();
        });
      });

      describe('wrap=false', () => {
        beforeEach(() => {
          groupInputs.wrap.set(false);
        });

        it('stays on the first trigger with left key from first trigger.', () => {
          groupInputs.activeItem.set(triggerPatterns[0]);
          expect(triggerPatterns[0].active()).toBeTrue();
          groupPattern.onKeydown(left());
          expect(triggerPatterns[0].active()).toBeTrue();
        });

        it('stays on the last trigger with right key from last trigger.', () => {
          groupInputs.activeItem.set(triggerPatterns[2]);
          expect(triggerPatterns[2].active()).toBeTrue();
          groupPattern.onKeydown(right());
          expect(triggerPatterns[2].active()).toBeTrue();
        });
      });
    });

    describe('Single Expansion (multi=false)', () => {
      beforeEach(() => {
        groupInputs.multiExpandable.set(false);
      });

      it('expands a panel and collapses others with space key.', () => {
        triggerPatterns[1].expanded.set(true);
        expect(triggerPatterns[0].expanded()).toBeFalse();
        expect(triggerPatterns[1].expanded()).toBeTrue();

        groupPattern.onKeydown(space());
        expect(triggerPatterns[0].expanded()).toBeTrue();
        expect(triggerPatterns[1].expanded()).toBeFalse();
      });

      it('expands a panel and collapses others with enter key.', () => {
        triggerPatterns[1].expanded.set(true);
        expect(triggerPatterns[0].expanded()).toBeFalse();
        expect(triggerPatterns[1].expanded()).toBeTrue();

        groupPattern.onKeydown(enter());
        expect(triggerPatterns[0].expanded()).toBeTrue();
        expect(triggerPatterns[1].expanded()).toBeFalse();
      });
    });

    describe('Multiple Expansion (multi=true)', () => {
      beforeEach(() => {
        groupInputs.multiExpandable.set(true);
      });

      it('expands a panel without affecting other panels.', () => {
        triggerPatterns[1].expanded.set(true);
        expect(triggerPatterns[0].expanded()).toBeFalse();
        expect(triggerPatterns[1].expanded()).toBeTrue();

        groupPattern.onKeydown(enter());
        expect(triggerPatterns[0].expanded()).toBeTrue();
        expect(triggerPatterns[1].expanded()).toBeTrue();
      });

      it('collapses a panel without affecting other panels.', () => {
        triggerPatterns[0].expanded.set(true);
        triggerPatterns[1].expanded.set(true);
        expect(triggerPatterns[0].expanded()).toBeTrue();
        expect(triggerPatterns[1].expanded()).toBeTrue();

        groupPattern.onKeydown(enter());
        expect(triggerPatterns[0].expanded()).toBeFalse();
        expect(triggerPatterns[1].expanded()).toBeTrue();
      });
    });
  });
});
