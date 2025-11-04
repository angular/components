/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, WritableSignal} from '@angular/core';
import {ToolbarInputs, ToolbarPattern} from './toolbar';
import {ToolbarWidgetInputs, ToolbarWidgetPattern} from './toolbar-widget';
import {
  ToolbarWidgetGroupControls,
  ToolbarWidgetGroupInputs,
  ToolbarWidgetGroupPattern,
} from './toolbar-widget-group';
import {createKeyboardEvent} from '@angular/cdk/testing/private';
import {ModifierKeys} from '@angular/cdk/testing';
import {SignalLike} from '../behaviors/signal-like/signal-like';

// Converts the SignalLike type to WritableSignal type for controlling test inputs.
type WritableSignalOverrides<O> = {
  [K in keyof O as O[K] extends SignalLike<any> ? K : never]: O[K] extends SignalLike<infer T>
    ? WritableSignal<T>
    : never;
};

type TestToolbarInputs<V> = Omit<
  ToolbarInputs<V> & WritableSignalOverrides<ToolbarInputs<V>>,
  'items' | 'element' | 'getItem'
>;
type TestToolbarWidgetInputs<V> = Omit<
  ToolbarWidgetInputs<V> & WritableSignalOverrides<ToolbarWidgetInputs<V>>,
  'element' | 'id' | 'toolbar'
>;
type TestToolbarWidgetGroupInputs<V> = Omit<
  ToolbarWidgetGroupInputs<V> & WritableSignalOverrides<ToolbarWidgetGroupInputs<V>>,
  'element' | 'id' | 'toolbar'
>;

const up = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 38, 'ArrowUp', mods);
const down = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 40, 'ArrowDown', mods);
const left = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 37, 'ArrowLeft', mods);
const right = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 39, 'ArrowRight', mods);
const home = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 36, 'Home', mods);
const end = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 35, 'End', mods);
const space = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 32, ' ', mods);
const enter = (mods?: ModifierKeys) => createKeyboardEvent('keydown', 13, 'Enter', mods);
const click = (target: Element) =>
  ({target, stopPropagation: () => {}, preventDefault: () => {}}) as unknown as PointerEvent;

describe('Toolbar Pattern', () => {
  function createToolbar<V>(
    widgets: (TestToolbarWidgetInputs<V> | TestToolbarWidgetGroupInputs<V>)[],
    toolbarInputs: TestToolbarInputs<V>,
  ) {
    const items = signal<(ToolbarWidgetPattern<V> | ToolbarWidgetGroupPattern<V>)[]>([]);
    const toolbar = new ToolbarPattern<V>({
      ...toolbarInputs,
      items,
      element: signal(document.createElement('div')),
      getItem: target => items().find(widget => widget.element() === target),
    });

    const widgetPatterns = widgets.map((widgetInputs, index) => {
      const id = `widget-${index}`;
      const element = document.createElement('div');
      element.id = id;

      if ('controls' in widgetInputs) {
        // It's a group
        element.classList.add('toolbar-widget-group');
        return new ToolbarWidgetGroupPattern<V>({
          ...widgetInputs,
          id: signal(id),
          element: signal(element),
          toolbar: signal(toolbar),
        });
      } else {
        // It's a widget
        element.classList.add('toolbar-widget');
        return new ToolbarWidgetPattern<V>({
          ...widgetInputs,
          id: signal(id),
          element: signal(element),
          toolbar: signal(toolbar),
        });
      }
    });
    items.set(widgetPatterns);
    return {toolbar, items: widgetPatterns};
  }

  describe('Keyboard Navigation', () => {
    let toolbar: ToolbarPattern<string>;
    let toolbarInputs: TestToolbarInputs<string>;
    let widgetInputs: (TestToolbarWidgetInputs<string> | TestToolbarWidgetGroupInputs<string>)[];
    let items: (ToolbarWidgetPattern<string> | ToolbarWidgetGroupPattern<string>)[];

    beforeEach(() => {
      toolbarInputs = {
        activeItem: signal(undefined),
        orientation: signal('horizontal'),
        textDirection: signal('ltr'),
        disabled: signal(false),
        softDisabled: signal(true),
        wrap: signal(false),
      };
      widgetInputs = [
        {disabled: signal(false)},
        {disabled: signal(false)},
        {
          disabled: signal(false),
          controls: signal(undefined),
        },
        {disabled: signal(false)},
      ];
      const {toolbar: newToolbar, items: newItems} = createToolbar<string>(
        widgetInputs,
        toolbarInputs,
      );
      toolbar = newToolbar;
      items = newItems;
      toolbarInputs.activeItem.set(items[0]);
    });

    it('should navigate next on ArrowRight (horizontal)', () => {
      toolbar.onKeydown(right());
      expect(toolbarInputs.activeItem()).toBe(items[1]);
    });

    it('should navigate prev on ArrowLeft (horizontal)', () => {
      toolbarInputs.activeItem.set(items[1]);
      toolbar.onKeydown(left());
      expect(toolbarInputs.activeItem()).toBe(items[0]);
    });

    it('should navigate next on ArrowDown (vertical)', () => {
      toolbarInputs.orientation.set('vertical');
      toolbar.onKeydown(down());
      expect(toolbarInputs.activeItem()).toBe(items[1]);
    });

    it('should navigate prev on ArrowUp (vertical)', () => {
      toolbarInputs.orientation.set('vertical');
      toolbarInputs.activeItem.set(items[1]);
      toolbar.onKeydown(up());
      expect(toolbarInputs.activeItem()).toBe(items[0]);
    });

    it('should navigate next on ArrowLeft (rtl)', () => {
      toolbarInputs.textDirection.set('rtl');
      toolbar.onKeydown(left());
      expect(toolbarInputs.activeItem()).toBe(items[1]);
    });

    it('should navigate prev on ArrowRight (rtl)', () => {
      toolbarInputs.textDirection.set('rtl');
      toolbarInputs.activeItem.set(items[1]);
      toolbar.onKeydown(right());
      expect(toolbarInputs.activeItem()).toBe(items[0]);
    });

    it('should navigate to the first item on Home', () => {
      toolbarInputs.activeItem.set(items[3]);
      toolbar.onKeydown(home());
      expect(toolbarInputs.activeItem()).toBe(items[0]);
    });

    it('should navigate to the last item on End', () => {
      toolbar.onKeydown(end());
      expect(toolbarInputs.activeItem()).toBe(items[3]);
    });

    it('should skip a disabled toolbar widget when softDisabled is false', () => {
      toolbarInputs.softDisabled.set(false);
      widgetInputs[1].disabled.set(true);
      toolbar.onKeydown(right());
      expect(toolbarInputs.activeItem()).toBe(items[2]);
    });

    it('should not skip disabled items when softDisabled is true', () => {
      widgetInputs[1].disabled.set(true);
      toolbar.onKeydown(right());
      expect(toolbarInputs.activeItem()).toBe(items[1]);
    });

    it('should wrap back to the first item when wrap is true', () => {
      toolbarInputs.wrap.set(true);
      toolbarInputs.activeItem.set(items[3]);
      toolbar.onKeydown(right());
      expect(toolbarInputs.activeItem()).toBe(items[0]);
    });

    it('should not wrap when wrap is false', () => {
      toolbarInputs.activeItem.set(items[3]);
      toolbar.onKeydown(right());
      expect(toolbarInputs.activeItem()).toBe(items[3]);
    });

    it('should not navigate when the toolbar is disabled', () => {
      toolbarInputs.disabled.set(true);
      toolbar.onKeydown(right());
      expect(toolbarInputs.activeItem()).toBe(items[0]);
    });
  });

  describe('Pointer Events', () => {
    let toolbar: ToolbarPattern<string>;
    let toolbarInputs: TestToolbarInputs<string>;
    let items: (ToolbarWidgetPattern<string> | ToolbarWidgetGroupPattern<string>)[];

    beforeEach(() => {
      toolbarInputs = {
        activeItem: signal(undefined),
        orientation: signal('horizontal'),
        textDirection: signal('ltr'),
        disabled: signal(false),
        softDisabled: signal(true),
        wrap: signal(false),
      };
      const widgetInputs = [
        {disabled: signal(false)},
        {disabled: signal(false)},
        {
          disabled: signal(false),
          controls: signal(undefined),
        },
        {disabled: signal(false)},
      ];
      const {toolbar: newToolbar, items: newItems} = createToolbar<string>(
        widgetInputs,
        toolbarInputs,
      );
      toolbar = newToolbar;
      items = newItems;
      toolbarInputs.activeItem.set(items[0]);
    });

    it('should set the active item on pointerdown', () => {
      toolbar.onPointerdown(click(items[1].element()));
      expect(toolbarInputs.activeItem()).toBe(items[1]);
    });

    it('should not set the active item on pointerdown if the toolbar is disabled', () => {
      toolbarInputs.disabled.set(true);
      toolbar.onPointerdown(click(items[1].element()));
      expect(toolbarInputs.activeItem()).toBe(items[0]);
    });
  });

  describe('#setDefaultState', () => {
    let toolbar: ToolbarPattern<string>;
    let toolbarInputs: TestToolbarInputs<string>;
    let widgetInputs: (TestToolbarWidgetInputs<string> | TestToolbarWidgetGroupInputs<string>)[];
    let items: (ToolbarWidgetPattern<string> | ToolbarWidgetGroupPattern<string>)[];

    beforeEach(() => {
      toolbarInputs = {
        activeItem: signal(undefined),
        orientation: signal('horizontal'),
        textDirection: signal('ltr'),
        disabled: signal(false),
        softDisabled: signal(true),
        wrap: signal(false),
      };
      widgetInputs = [
        {disabled: signal(false)},
        {disabled: signal(false)},
        {
          disabled: signal(false),
          controls: signal(undefined),
        },
      ];
      const {toolbar: newToolbar, items: newItems} = createToolbar<string>(
        widgetInputs,
        toolbarInputs,
      );
      toolbar = newToolbar;
      items = newItems;
    });

    it('should set the active item to the first focusable widget', () => {
      toolbar.setDefaultState();
      expect(toolbarInputs.activeItem()).toBe(items[0]);
    });

    it('should skip disabled widgets and set the next focusable widget as active', () => {
      toolbarInputs.softDisabled.set(false);
      widgetInputs[0].disabled.set(true);
      toolbar.setDefaultState();
      expect(toolbarInputs.activeItem()).toBe(items[1]);
    });

    it('should call "setDefaultState" on a widget group if it is the first focusable item', () => {
      toolbarInputs.softDisabled.set(false);
      const fakeControls = jasmine.createSpyObj<ToolbarWidgetGroupControls>('fakeControls', [
        'setDefaultState',
      ]);
      (widgetInputs[2] as TestToolbarWidgetGroupInputs<string>).controls.set(fakeControls);

      widgetInputs[0].disabled.set(true);
      widgetInputs[1].disabled.set(true);
      toolbar.setDefaultState();
      expect(toolbarInputs.activeItem()).toBe(items[2]);
      expect(fakeControls.setDefaultState).toHaveBeenCalled();
    });
  });

  describe('Widget Group', () => {
    let toolbar: ToolbarPattern<string>;
    let toolbarInputs: TestToolbarInputs<string>;
    let items: (ToolbarWidgetPattern<string> | ToolbarWidgetGroupPattern<string>)[];
    let fakeControls: jasmine.SpyObj<ToolbarWidgetGroupControls>;

    beforeEach(() => {
      fakeControls = jasmine.createSpyObj<ToolbarWidgetGroupControls>('fakeControls', [
        'next',
        'prev',
        'first',
        'last',
        'unfocus',
        'trigger',
        'goto',
        'setDefaultState',
        'isOnFirstItem',
        'isOnLastItem',
      ]);
      toolbarInputs = {
        activeItem: signal(undefined),
        orientation: signal('horizontal'),
        textDirection: signal('ltr'),
        disabled: signal(false),
        softDisabled: signal(true),
        wrap: signal(false),
      };
      const widgetInputs = [
        {disabled: signal(false)},
        {
          disabled: signal(false),
          controls: signal(fakeControls),
        },
        {disabled: signal(false)},
      ];
      const {toolbar: newToolbar, items: newItems} = createToolbar<string>(
        widgetInputs,
        toolbarInputs,
      );
      toolbar = newToolbar;
      items = newItems;

      // Set the widget group as the active item for tests.
      toolbarInputs.activeItem.set(items[1]);
    });

    it('should call "next" on the group handler when navigating next (horizontal)', () => {
      fakeControls.isOnLastItem.and.returnValue(false);
      toolbar.onKeydown(right());
      expect(fakeControls.next).toHaveBeenCalledWith(false);
    });

    it('should call "next" on the group handler when navigating next (vertical)', () => {
      fakeControls.isOnLastItem.and.returnValue(false);
      toolbarInputs.orientation.set('vertical');
      toolbar.onKeydown(down());
      expect(fakeControls.next).toHaveBeenCalledWith(false);
    });

    it('should navigate to the next widget if the group allows it', () => {
      fakeControls.isOnLastItem.and.returnValue(true);
      toolbar.onKeydown(right());
      expect(toolbarInputs.activeItem()).toBe(items[2]);
      expect(fakeControls.unfocus).toHaveBeenCalled();
    });

    it('should not navigate to the next widget if the group prevents it', () => {
      fakeControls.isOnLastItem.and.returnValue(false);
      toolbar.onKeydown(right());
      expect(toolbarInputs.activeItem()).toBe(items[1]);
      expect(fakeControls.next).toHaveBeenCalledWith(false);
    });

    it('should call "prev" on the group handler when navigating previous (horizontal)', () => {
      fakeControls.isOnFirstItem.and.returnValue(false);
      toolbar.onKeydown(left());
      expect(fakeControls.prev).toHaveBeenCalledWith(false);
    });

    it('should call "prev" on the group handler when navigating previous (vertical)', () => {
      fakeControls.isOnFirstItem.and.returnValue(false);
      toolbarInputs.orientation.set('vertical');
      toolbar.onKeydown(up());
      expect(fakeControls.prev).toHaveBeenCalledWith(false);
    });

    it('should navigate to the previous widget if the group allows it', () => {
      fakeControls.isOnFirstItem.and.returnValue(true);
      toolbar.onKeydown(left());
      expect(toolbarInputs.activeItem()).toBe(items[0]);
      expect(fakeControls.unfocus).toHaveBeenCalled();
    });

    it('should not navigate to the previous widget if the group prevents it', () => {
      fakeControls.isOnFirstItem.and.returnValue(false);
      toolbar.onKeydown(left());
      expect(toolbarInputs.activeItem()).toBe(items[1]);
      expect(fakeControls.prev).toHaveBeenCalledWith(false);
    });

    it('should call "unfocus" on the group handler on Home', () => {
      toolbar.onKeydown(home());
      expect(fakeControls.unfocus).toHaveBeenCalled();
      expect(toolbarInputs.activeItem()).toBe(items[0]); // Also moves focus
    });

    it('should call "unfocus" on the group handler on End', () => {
      toolbar.onKeydown(end());
      expect(fakeControls.unfocus).toHaveBeenCalled();
      expect(toolbarInputs.activeItem()).toBe(items[2]); // Also moves focus
    });

    it('should call "trigger" on the group handler on Enter', () => {
      toolbar.onKeydown(enter());
      expect(fakeControls.trigger).toHaveBeenCalled();
    });

    it('should call "trigger" on the group handler on Space', () => {
      toolbar.onKeydown(space());
      expect(fakeControls.trigger).toHaveBeenCalled();
    });

    it('should call "next" with wrap on the group handler (horizontal)', () => {
      toolbar.onKeydown(down());
      expect(fakeControls.next).toHaveBeenCalledWith(true);
    });

    it('should call "next" with wrap on the group handler (vertical)', () => {
      toolbarInputs.orientation.set('vertical');
      toolbar.onKeydown(right());
      expect(fakeControls.next).toHaveBeenCalledWith(true);
    });

    it('should call "prev" with wrap on the group handler (horizontal)', () => {
      toolbar.onKeydown(up());
      expect(fakeControls.prev).toHaveBeenCalledWith(true);
    });

    it('should call "prev" with wrap on the group handler (vertical)', () => {
      toolbarInputs.orientation.set('vertical');
      toolbar.onKeydown(left());
      expect(fakeControls.prev).toHaveBeenCalledWith(true);
    });

    it('should call "first" when navigating into a group from the previous item', () => {
      toolbarInputs.activeItem.set(items[0]);
      toolbar.onKeydown(right());
      expect(toolbarInputs.activeItem()).toBe(items[1]);
      expect(fakeControls.first).toHaveBeenCalled();
    });

    it('should call "last" when navigating into a group from the next item', () => {
      toolbarInputs.activeItem.set(items[2]);
      toolbar.onKeydown(left());
      expect(toolbarInputs.activeItem()).toBe(items[1]);
      expect(fakeControls.last).toHaveBeenCalled();
    });
  });
});
