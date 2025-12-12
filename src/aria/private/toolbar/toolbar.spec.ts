/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ToolbarInputs, ToolbarPattern} from './toolbar';
import {ToolbarWidgetPattern} from './toolbar-widget';
import {ToolbarWidgetGroupPattern} from './toolbar-widget-group';
import {createKeyboardEvent} from '@angular/cdk/testing/private';
import {
  SignalLike,
  computed,
  signal,
  WritableSignalLike,
} from '../behaviors/signal-like/signal-like';
import {ModifierKeys} from '@angular/cdk/testing';

// Test types
type TestWidget = ToolbarWidgetPattern<string> & {
  inputs: {disabled: WritableSignalLike<boolean>};
};

type TestWidgetGroup = ToolbarWidgetGroupPattern<ToolbarWidgetPattern<string>, string> & {
  disabled: WritableSignalLike<boolean>;
  items: WritableSignalLike<TestWidget[]>;
};

type TestItem = TestWidget;

type TestInputs = {
  readonly [K in keyof ToolbarInputs<string>]: WritableSignalLike<
    ToolbarInputs<string>[K] extends SignalLike<infer T> ? T : never
  >;
};

// Keyboard event helpers
const up = () => createKeyboardEvent('keydown', 38, 'ArrowUp');
const down = () => createKeyboardEvent('keydown', 40, 'ArrowDown');
const home = () => createKeyboardEvent('keydown', 36, 'Home');
const end = () => createKeyboardEvent('keydown', 35, 'End');
const enter = () => createKeyboardEvent('keydown', 13, 'Enter');
const right = () => createKeyboardEvent('keydown', 39, 'ArrowRight');
const left = () => createKeyboardEvent('keydown', 37, 'ArrowLeft');
const space = () => createKeyboardEvent('keydown', 32, ' ');

function clickItem(item: ToolbarWidgetPattern<string>, mods?: ModifierKeys) {
  return {
    target: item.element(),
    shiftKey: mods?.shift,
    ctrlKey: mods?.control,
  } as unknown as PointerEvent;
}

function getToolbarPattern(
  inputs: Partial<{
    [K in keyof TestInputs]: TestInputs[K] extends WritableSignalLike<infer T> ? T : never;
  }>,
  items: WritableSignalLike<TestItem[]>,
) {
  const element = signal(document.createElement('div'));
  const activeItem = signal<TestItem | undefined>(undefined);

  const allItems = computed(() => {
    const flatItems: ToolbarWidgetPattern<string>[] = [];
    for (const item of items()) {
      if (item instanceof ToolbarWidgetGroupPattern) {
        flatItems.push(...item.inputs.items());
      } else {
        flatItems.push(item);
      }
    }
    return flatItems;
  });

  const toolbar = new ToolbarPattern<string>({
    element,
    items,
    activeItem,
    values: signal([]),
    wrap: signal(inputs.wrap ?? true),
    disabled: signal(inputs.disabled ?? false),
    softDisabled: signal(inputs.softDisabled ?? true),
    textDirection: signal(inputs.textDirection ?? 'ltr'),
    orientation: signal(inputs.orientation ?? 'horizontal'),
    getItem: (e: Element) => allItems().find(i => i.element() === e),
  });

  return {toolbar, element, activeItem};
}

function getWidgetPattern(
  value: string,
  toolbar: ToolbarPattern<string>,
  group?: ToolbarWidgetGroupPattern<ToolbarWidgetPattern<string>, string>,
): TestWidget {
  const element = signal(document.createElement('button'));
  const widget = new ToolbarWidgetPattern<string>({
    id: signal(`widget-${value}`),
    element,
    disabled: signal(false),
    value: signal(value),
    group: signal(group),
    toolbar: signal(toolbar),
  });
  return widget as TestWidget;
}

function getWidgetGroupPattern(id: string, toolbar: ToolbarPattern<string>): TestWidgetGroup {
  const disabled = signal(false);
  const items = signal<TestWidget[]>([]);

  const group = new ToolbarWidgetGroupPattern<ToolbarWidgetPattern<string>, string>({
    disabled,
    toolbar: signal(toolbar),
    items,
    multi: signal(false),
  });

  (group as TestWidgetGroup).disabled = disabled;
  (group as TestWidgetGroup).items = items;
  return group as TestWidgetGroup;
}

function getPatterns(
  inputs: Partial<{
    [K in keyof TestInputs]: TestInputs[K] extends WritableSignalLike<infer T> ? T : never;
  }> = {},
) {
  const items = signal<TestItem[]>([]);
  const {toolbar} = getToolbarPattern(inputs, items);

  const group0 = getWidgetGroupPattern('group 0', toolbar);
  const group1 = getWidgetGroupPattern('group 1', toolbar);

  items.set([
    getWidgetPattern('item 0', toolbar),
    getWidgetPattern('item 1', toolbar),
    getWidgetPattern('item 2', toolbar, group0),
    getWidgetPattern('item 3', toolbar, group0),
    getWidgetPattern('item 4', toolbar, group0),
    getWidgetPattern('item 5', toolbar),
    getWidgetPattern('item 6', toolbar, group1),
    getWidgetPattern('item 7', toolbar, group1),
    getWidgetPattern('item 8', toolbar, group1),
  ]);

  // [                [        group 0       ]          [       group 1        ]]
  // [item 0, item 1, [item 2, item 3, item 4], item 5, [item 6, item 7, item 8]]

  (group0.inputs.items as WritableSignalLike<any>).set(items().slice(2, 5) as TestWidget[]);
  (group1.inputs.items as WritableSignalLike<any>).set(items().slice(6, 9) as TestWidget[]);

  toolbar.setDefaultState();
  return {toolbar, items: items(), group0, group1};
}

describe('Toolbar Pattern', () => {
  function getItem(toolbar: ToolbarPattern<string>, value: string) {
    return toolbar.inputs.items().find(item => item.value() === value)!;
  }

  describe('Navigation', () => {
    describe('with horizontal orientation', () => {
      it('should navigate on click', () => {
        const {toolbar} = getPatterns();
        const item5 = getItem(toolbar, 'item 5');
        toolbar.onClick(clickItem(item5));
        expect(toolbar.activeItem()?.value()).toBe('item 5');
      });

      describe('with ltr text direction', () => {
        it('should navigate next on ArrowRight', () => {
          const {toolbar} = getPatterns();
          toolbar.onKeydown(right()); // Item 0 -> Item 1
          expect(toolbar.activeItem()?.value()).toBe('item 1');
        });

        it('should navigate prev on ArrowLeft', () => {
          const {toolbar} = getPatterns();
          toolbar.onKeydown(right()); // Item 0 -> Item 1
          toolbar.onKeydown(left()); // Item 1 -> Item 0
          expect(toolbar.activeItem()?.value()).toBe('item 0');
        });

        it('should not navigate next on ArrowDown when not in a widget group', () => {
          const {toolbar} = getPatterns();
          toolbar.onKeydown(down()); // Item 0 -> Item 0
          expect(toolbar.activeItem()?.value()).toBe('item 0');
        });

        it('should not navigate prev on ArrowUp when not in a widget group', () => {
          const {toolbar} = getPatterns();
          toolbar.onKeydown(right()); // Item 0 -> Item 1
          toolbar.onKeydown(up()); // Item 1 -> Item 1
          expect(toolbar.activeItem()?.value()).toBe('item 1');
        });

        it('should navigate next in a widget group on ArrowDown', () => {
          const {toolbar} = getPatterns();

          toolbar.onKeydown(right()); // Item 0 -> Item 1
          toolbar.onKeydown(right()); // Item 1 -> Item 2 (Group 0)
          toolbar.onKeydown(down()); // Item 2 -> Item 3 (Group 0)

          expect(toolbar.activeItem()?.value()).toBe('item 3');
        });

        it('should navigate prev in a widget group on ArrowUp', () => {
          const {toolbar} = getPatterns();

          toolbar.onKeydown(right()); // Item 0 -> Item 1
          toolbar.onKeydown(right()); // Item 1 -> Item 2 (Group 0)
          toolbar.onKeydown(down()); // Item 2 -> Item 3 (Group 0)
          toolbar.onKeydown(up()); // Item 3 -> Item 2 (Group 0)

          expect(toolbar.activeItem()?.value()).toBe('item 2');
        });

        it('should navigate last to first in a widget group on ArrowDown', () => {
          const {toolbar} = getPatterns();

          toolbar.onKeydown(right()); // Item 0 -> Item 1
          toolbar.onKeydown(right()); // Item 1 -> Item 2 (Group 0)
          toolbar.onKeydown(down()); // Item 2 -> Item 3 (Group 0)
          toolbar.onKeydown(down()); // Item 3 -> Item 4 (Group 0)
          toolbar.onKeydown(down()); // Item 4 -> Item 2 (Group 0)

          expect(toolbar.activeItem()?.value()).toBe('item 2');
        });

        it('should navigate first to last in a widget group on ArrowUp', () => {
          const {toolbar} = getPatterns();

          toolbar.onKeydown(right()); // Item 0 -> Item 1
          toolbar.onKeydown(right()); // Item 1 -> Item 2 (Group 0)
          toolbar.onKeydown(up()); // Item 2 -> Item 4 (Group 0)

          expect(toolbar.activeItem()?.value()).toBe('item 4');
        });

        describe('with wrap false', () => {
          it('should not wrap from last to first', () => {
            const {toolbar} = getPatterns({wrap: false});
            toolbar.onKeydown(end());
            toolbar.onKeydown(right());
            expect(toolbar.activeItem()?.value()).toBe('item 8');
          });

          it('should not wrap from first to last', () => {
            const {toolbar} = getPatterns({wrap: false});
            toolbar.onKeydown(left());
            expect(toolbar.activeItem()?.value()).toBe('item 0');
          });
        });

        describe('with softDisabled true', () => {
          it('should not skip disabled items when navigating next', () => {
            const {toolbar, items} = getPatterns({softDisabled: true});
            items[1].inputs.disabled.set(true);

            toolbar.onKeydown(right()); // Item 0 -> Item 1 (disabled)
            expect(toolbar.activeItem()?.value()).toBe('item 1');
          });

          it('should not skip disabled items when navigating prev', () => {
            const {toolbar, items} = getPatterns({softDisabled: true});
            items[1].inputs.disabled.set(true);

            toolbar.onKeydown(right()); // Item 0 -> Item 1 (disabled)
            toolbar.onKeydown(right()); // Item 1 -> Item 2
            toolbar.onKeydown(left()); // Item 2 -> Item 1 (disabled)

            expect(toolbar.activeItem()?.value()).toBe('item 1');
          });

          it('should not skip disabled groups when navigating next', () => {
            const {toolbar, group0} = getPatterns({softDisabled: true});
            group0.disabled.set(true);

            toolbar.onKeydown(right()); // Item 0 -> Item 1
            toolbar.onKeydown(right()); // Item 1 -> Item 2
            expect(toolbar.activeItem()?.value()).toBe('item 2');
          });

          it('should not skip disabled groups when navigating prev', () => {
            const {toolbar, group0} = getPatterns({softDisabled: true});
            group0.disabled.set(true);
            toolbar.onKeydown(left()); // Item 0 -> Item 8
            expect(toolbar.activeItem()?.value()).toBe('item 8');
          });

          it('should navigate to the last item on End', () => {
            const {toolbar, items} = getPatterns({softDisabled: true});
            items[items.length - 1].inputs.disabled.set(true);

            toolbar.onKeydown(end());
            expect(toolbar.activeItem()?.value()).toBe('item 8');
          });

          it('should navigate to the first item on Home', () => {
            const {toolbar, items} = getPatterns({softDisabled: true});
            items[0].inputs.disabled.set(true);

            toolbar.onKeydown(end()); // Item 0 -> Item 8
            toolbar.onKeydown(home()); // Item 8 -> Item 0

            expect(toolbar.activeItem()?.value()).toBe('item 0');
          });

          describe('with wrap true', () => {
            it('should wrap from last to first', () => {
              const {toolbar, items} = getPatterns({softDisabled: true, wrap: true});
              items[0].inputs.disabled.set(true);

              toolbar.onKeydown(end());
              toolbar.onKeydown(right());

              expect(toolbar.activeItem()?.value()).toBe('item 0');
            });

            it('should wrap from first to last', () => {
              const {toolbar, items} = getPatterns({softDisabled: true, wrap: true});
              items[items.length - 1].inputs.disabled.set(true);

              toolbar.onKeydown(left());
              expect(toolbar.activeItem()?.value()).toBe('item 8');
            });
          });
        });

        describe('with softDisabled false', () => {
          it('should not navigate to disabled items on click', () => {
            const {toolbar, items} = getPatterns({softDisabled: false});
            items[1].inputs.disabled.set(true);

            toolbar.onClick(clickItem(items[1]));
            expect(toolbar.activeItem()?.value()).toBe('item 0');
          });

          it('should skip disabled items when navigating next', () => {
            const {toolbar, items} = getPatterns({softDisabled: false});
            items[1].inputs.disabled.set(true);

            toolbar.onKeydown(right()); // Item 0 -> Item 2 (skips Item 1)
            expect(toolbar.activeItem()?.value()).toBe('item 2');
          });

          it('should skip disabled items when navigating prev', () => {
            const {toolbar, items} = getPatterns({softDisabled: false});
            items[1].inputs.disabled.set(true);

            toolbar.onKeydown(right()); // Item 0 -> Item 2
            toolbar.onKeydown(left()); // Item 2 -> Item 0 (skips Item 1)

            expect(toolbar.activeItem()?.value()).toBe('item 0');
          });

          it('should not navigate to items in disabled groups on click', () => {
            const {toolbar, group0} = getPatterns({softDisabled: false});
            group0.disabled.set(true);
            const item2 = getItem(toolbar, 'item 2');
            toolbar.onClick(clickItem(item2));
            expect(toolbar.activeItem()?.value()).toBe('item 0');
          });

          it('should skip disabled groups when navigating next', () => {
            const {toolbar, group0} = getPatterns({softDisabled: false});
            group0.disabled.set(true);

            toolbar.onKeydown(right()); // Item 0 -> Item 1
            toolbar.onKeydown(right()); // Item 1 -> Item 5 (skips Group 0)

            expect(toolbar.activeItem()?.value()).toBe('item 5');
          });

          it('should skip disabled groups when navigating prev', () => {
            const {toolbar, group0, group1} = getPatterns({softDisabled: false});
            group0.disabled.set(true);
            group1.disabled.set(true);

            toolbar.onKeydown(left()); // Item 0 -> Item 5 (skips Group 1)
            toolbar.onKeydown(left()); // Item 5 -> Item 1 (skips Group 0)

            expect(toolbar.activeItem()?.value()).toBe('item 1');
          });

          it('should navigate to the last focusable item on End', () => {
            const {toolbar, items} = getPatterns({softDisabled: false});
            items[items.length - 1].inputs.disabled.set(true);

            toolbar.onKeydown(end());
            expect(toolbar.activeItem()?.value()).toBe('item 7');
          });

          it('should navigate to the first focusable item on Home', () => {
            const {toolbar, items} = getPatterns({softDisabled: false});
            items[0].inputs.disabled.set(true);

            toolbar.onKeydown(end());
            toolbar.onKeydown(home());

            expect(toolbar.activeItem()?.value()).toBe('item 1');
          });

          describe('with wrap true', () => {
            it('should wrap from last to first focusable item', () => {
              const {toolbar, items} = getPatterns({softDisabled: false, wrap: true});
              items[0].inputs.disabled.set(true);

              toolbar.onKeydown(end());
              toolbar.onKeydown(right());

              expect(toolbar.activeItem()?.value()).toBe('item 1');
            });

            it('should wrap from first to last focusable item', () => {
              const {toolbar, items} = getPatterns({softDisabled: false, wrap: true});
              items[items.length - 1].inputs.disabled.set(true);

              toolbar.onKeydown(home());
              toolbar.onKeydown(left());

              expect(toolbar.activeItem()?.value()).toBe('item 7');
            });
          });

          describe('with wrap false', () => {
            it('should not wrap from last to first focusable item', () => {
              const {toolbar, items} = getPatterns({softDisabled: false, wrap: false});
              items[items.length - 1].inputs.disabled.set(true);
              toolbar.onKeydown(end());
              toolbar.onKeydown(right());

              expect(toolbar.activeItem()?.value()).toBe('item 7');
            });

            it('should not wrap from first to last focusable item', () => {
              const {toolbar, items} = getPatterns({softDisabled: false, wrap: false});
              items[0].inputs.disabled.set(true);

              toolbar.onKeydown(end());
              toolbar.onKeydown(home());
              toolbar.onKeydown(left());

              expect(toolbar.activeItem()?.value()).toBe('item 1');
            });
          });
        });
      });

      describe('with rtl text direction', () => {
        it('should navigate on click', () => {
          const {toolbar} = getPatterns({textDirection: 'rtl'});
          const item5 = getItem(toolbar, 'item 5');
          toolbar.onClick(clickItem(item5));
          expect(toolbar.activeItem()?.value()).toBe('item 5');
        });

        it('should navigate next on ArrowLeft', () => {
          const {toolbar} = getPatterns({textDirection: 'rtl'});
          toolbar.onKeydown(left()); // Item 0 -> Item 1
          expect(toolbar.activeItem()?.value()).toBe('item 1');
        });

        it('should navigate prev on ArrowRight', () => {
          const {toolbar} = getPatterns({textDirection: 'rtl'});
          toolbar.onKeydown(left()); // Item 0 -> Item 1
          toolbar.onKeydown(right()); // Item 1 -> Item 0
          expect(toolbar.activeItem()?.value()).toBe('item 0');
        });

        it('should not navigate next on ArrowDown when not in a widget group', () => {
          const {toolbar} = getPatterns({textDirection: 'rtl'});
          toolbar.onKeydown(up()); // Item 0 -> Item 0
          expect(toolbar.activeItem()?.value()).toBe('item 0');
        });

        it('should not navigate prev on ArrowUp when not in a widget group', () => {
          const {toolbar} = getPatterns({textDirection: 'rtl'});
          toolbar.onKeydown(left()); // Item 0 -> Item 1
          toolbar.onKeydown(down()); // Item 1 -> Item 1
          expect(toolbar.activeItem()?.value()).toBe('item 1');
        });

        it('should navigate next in a widget group on ArrowDown', () => {
          const {toolbar} = getPatterns({textDirection: 'rtl'});

          toolbar.onKeydown(left()); // Item 0 -> Item 1
          toolbar.onKeydown(left()); // Item 1 -> Item 2 (Group 0)
          toolbar.onKeydown(down()); // Item 2 -> Item 3 (Group 0)

          expect(toolbar.activeItem()?.value()).toBe('item 3');
        });

        it('should navigate prev in a widget group on ArrowUp', () => {
          const {toolbar} = getPatterns({textDirection: 'rtl'});

          toolbar.onKeydown(left()); // Item 0 -> Item 1
          toolbar.onKeydown(left()); // Item 1 -> Item 2 (Group 0)
          toolbar.onKeydown(down()); // Item 2 -> Item 3 (Group 0)
          toolbar.onKeydown(up()); // Item 3 -> Item 2 (Group 0)

          expect(toolbar.activeItem()?.value()).toBe('item 2');
        });

        it('should navigate first to last in a widget group on ArrowUp', () => {
          const {toolbar} = getPatterns({textDirection: 'rtl'});

          toolbar.onKeydown(left()); // Item 0 -> Item 1
          toolbar.onKeydown(left()); // Item 1 -> Item 2 (Group 0)
          toolbar.onKeydown(up()); // Item 2 -> Item 4 (Group 0)

          expect(toolbar.activeItem()?.value()).toBe('item 4');
        });

        it('should navigate last to first in a widget group on ArrowDown', () => {
          const {toolbar} = getPatterns({textDirection: 'rtl'});

          toolbar.onKeydown(left()); // Item 0 -> Item 1
          toolbar.onKeydown(left()); // Item 1 -> Item 2 (Group 0)
          toolbar.onKeydown(down()); // Item 2 -> Item 3 (Group 0)
          toolbar.onKeydown(down()); // Item 3 -> Item 4 (Group 0)
          toolbar.onKeydown(down()); // Item 4 -> Item 2 (Group 0)

          expect(toolbar.activeItem()?.value()).toBe('item 2');
        });

        describe('with softDisabled true', () => {
          it('should not skip disabled items when navigating next', () => {
            const {toolbar, items} = getPatterns({softDisabled: true, textDirection: 'rtl'});
            items[1].inputs.disabled.set(true);

            toolbar.onKeydown(left()); // Item 0 -> Item 1 (disabled)
            expect(toolbar.activeItem()?.value()).toBe('item 1');
          });

          it('should not skip disabled items when navigating prev', () => {
            const {toolbar, items} = getPatterns({softDisabled: true, textDirection: 'rtl'});
            items[1].inputs.disabled.set(true);

            toolbar.onKeydown(left()); // Item 0 -> Item 1 (disabled)
            toolbar.onKeydown(left()); // Item 1 -> Item 2
            toolbar.onKeydown(right()); // Item 2 -> Item 1 (disabled)

            expect(toolbar.activeItem()?.value()).toBe('item 1');
          });

          it('should navigate to the last item on End', () => {
            const {toolbar, items} = getPatterns({softDisabled: true, textDirection: 'rtl'});
            items[items.length - 1].inputs.disabled.set(true);

            toolbar.onKeydown(end());
            expect(toolbar.activeItem()?.value()).toBe('item 8');
          });

          it('should navigate to the first item on Home', () => {
            const {toolbar, items} = getPatterns({softDisabled: true, textDirection: 'rtl'});
            items[0].inputs.disabled.set(true);

            toolbar.onKeydown(left()); // Item 0 -> Item 1
            toolbar.onKeydown(home()); // Item 1 -> Item 0

            expect(toolbar.activeItem()?.value()).toBe('item 0');
          });

          describe('with wrap true', () => {
            it('should wrap from last to first', () => {
              const {toolbar, items} = getPatterns({
                wrap: true,
                softDisabled: true,
                textDirection: 'rtl',
              });
              items[0].inputs.disabled.set(true);

              toolbar.onKeydown(end());
              toolbar.onKeydown(left());

              expect(toolbar.activeItem()?.value()).toBe('item 0');
            });

            it('should wrap from first to last', () => {
              const {toolbar, items} = getPatterns({
                wrap: true,
                softDisabled: true,
                textDirection: 'rtl',
              });
              items[items.length - 1].inputs.disabled.set(true);

              toolbar.onKeydown(right());
              expect(toolbar.activeItem()?.value()).toBe('item 8');
            });
          });

          describe('with wrap false', () => {
            it('should not wrap from last to first', () => {
              const {toolbar} = getPatterns({
                wrap: false,
                softDisabled: true,
                textDirection: 'rtl',
              });
              toolbar.onKeydown(end());
              toolbar.onKeydown(left());

              expect(toolbar.activeItem()?.value()).toBe('item 8');
            });

            it('should not wrap from first to last', () => {
              const {toolbar} = getPatterns({
                wrap: false,
                softDisabled: true,
                textDirection: 'rtl',
              });
              toolbar.onKeydown(home());
              toolbar.onKeydown(right());

              expect(toolbar.activeItem()?.value()).toBe('item 0');
            });
          });
        });

        describe('with softDisabled false', () => {
          it('should skip disabled items when navigating next', () => {
            const {toolbar, items} = getPatterns({softDisabled: false, textDirection: 'rtl'});
            items[1].inputs.disabled.set(true);

            toolbar.onKeydown(left()); // Item 0 -> Item 2 (skips Item 1)
            expect(toolbar.activeItem()?.value()).toBe('item 2');
          });

          it('should skip disabled items when navigating prev', () => {
            const {toolbar, items} = getPatterns({softDisabled: false, textDirection: 'rtl'});
            items[1].inputs.disabled.set(true);

            toolbar.onKeydown(left()); // Item 0 -> Item 2
            toolbar.onKeydown(right()); // Item 2 -> Item 0 (skips Item 1)

            expect(toolbar.activeItem()?.value()).toBe('item 0');
          });

          it('should navigate to the last focusable item on End', () => {
            const {toolbar, items} = getPatterns({softDisabled: false, textDirection: 'rtl'});
            items[items.length - 1].inputs.disabled.set(true);

            toolbar.onKeydown(end());
            expect(toolbar.activeItem()?.value()).toBe('item 7');
          });

          it('should navigate to the first focusable item on Home', () => {
            const {toolbar, items} = getPatterns({softDisabled: false, textDirection: 'rtl'});
            items[0].inputs.disabled.set(true);

            toolbar.onKeydown(end());
            toolbar.onKeydown(home());

            expect(toolbar.activeItem()?.value()).toBe('item 1');
          });

          describe('with wrap true', () => {
            it('should wrap from last to first focusable item', () => {
              const {toolbar, items} = getPatterns({
                softDisabled: false,
                wrap: true,
                textDirection: 'rtl',
              });
              items[0].inputs.disabled.set(true);

              toolbar.onKeydown(end());
              toolbar.onKeydown(left());

              expect(toolbar.activeItem()?.value()).toBe('item 1');
            });

            it('should wrap from first to last focusable item', () => {
              const {toolbar, items} = getPatterns({
                softDisabled: false,
                wrap: true,
                textDirection: 'rtl',
              });
              items[items.length - 1].inputs.disabled.set(true);

              toolbar.onKeydown(home());
              toolbar.onKeydown(right());

              expect(toolbar.activeItem()?.value()).toBe('item 7');
            });
          });

          describe('with wrap false', () => {
            it('should not wrap from last to first focusable item', () => {
              const {toolbar} = getPatterns({
                softDisabled: false,
                wrap: false,
                textDirection: 'rtl',
              });
              toolbar.onKeydown(end());
              toolbar.onKeydown(left());
              expect(toolbar.activeItem()?.value()).toBe('item 8');
            });

            it('should not wrap from first to last focusable item', () => {
              const {toolbar, items} = getPatterns({
                softDisabled: false,
                wrap: false,
                textDirection: 'rtl',
              });
              items[1].inputs.disabled.set(true);

              toolbar.onKeydown(home());
              toolbar.onKeydown(right());

              expect(toolbar.activeItem()?.value()).toBe('item 0');
            });
          });
        });
      });
    });

    describe('with vertical orientation', () => {
      describe('with ltr text direction', () => {
        it('should navigate next on ArrowDown', () => {
          const {toolbar} = getPatterns({orientation: 'vertical'});
          toolbar.onKeydown(down()); // Item 0 -> Item 1
          expect(toolbar.activeItem()?.value()).toBe('item 1');
        });

        it('should navigate prev on ArrowUp', () => {
          const {toolbar} = getPatterns({orientation: 'vertical'});
          toolbar.onKeydown(down()); // Item 0 -> Item 1
          toolbar.onKeydown(up()); // Item 1 -> Item 0
          expect(toolbar.activeItem()?.value()).toBe('item 0');
        });

        it('should not navigate next on ArrowRight when not in a widget group', () => {
          const {toolbar} = getPatterns({orientation: 'vertical'});
          toolbar.onKeydown(right()); // Item 0 -> Item 0
          expect(toolbar.activeItem()?.value()).toBe('item 0');
        });

        it('should not navigate prev on ArrowLeft when not in a widget group', () => {
          const {toolbar} = getPatterns({orientation: 'vertical'});
          toolbar.onKeydown(down()); // Item 0 -> Item 1
          toolbar.onKeydown(left()); // Item 1 -> Item 1
          expect(toolbar.activeItem()?.value()).toBe('item 1');
        });

        it('should navigate next in a widget group on ArrowRight', () => {
          const {toolbar} = getPatterns({orientation: 'vertical'});

          toolbar.onKeydown(down());
          toolbar.onKeydown(down()); // Item 1 -> Item 2 (Group 0)
          toolbar.onKeydown(right()); // Item 2 -> Item 3 (Group 0)

          expect(toolbar.activeItem()?.value()).toBe('item 3');
        });

        it('should navigate prev in a widget group on ArrowLeft', () => {
          const {toolbar} = getPatterns({orientation: 'vertical'});

          toolbar.onKeydown(down()); // Item 0 -> Item 1
          toolbar.onKeydown(down()); // Item 1 -> Item 2 (Group 0)
          toolbar.onKeydown(right()); // Item 2 -> Item 3 (Group 0)
          toolbar.onKeydown(left()); // Item 3 -> Item 2 (Group 0)

          expect(toolbar.activeItem()?.value()).toBe('item 2');
        });

        it('should navigate last to first in a widget group on ArrowRight', () => {
          const {toolbar} = getPatterns({orientation: 'vertical'});

          toolbar.onKeydown(down()); // Item 0 -> Item 1
          toolbar.onKeydown(down()); // Item 1 -> Item 2 (Group 0)
          toolbar.onKeydown(right()); // Item 2 -> Item 3 (Group 0)
          toolbar.onKeydown(right()); // Item 3 -> Item 4 (Group 0)
          toolbar.onKeydown(right()); // Item 4 -> Item 2 (Group 0)

          expect(toolbar.activeItem()?.value()).toBe('item 2');
        });

        it('should navigate first to last in a widget group on ArrowLeft', () => {
          const {toolbar} = getPatterns({orientation: 'vertical'});

          toolbar.onKeydown(down()); // Item 0 -> Item 1
          toolbar.onKeydown(down()); // Item 1 -> Item 2 (Group 0)
          toolbar.onKeydown(left()); // Item 2 -> Item 4 (Group 0)

          expect(toolbar.activeItem()?.value()).toBe('item 4');
        });

        describe('with softDisabled true', () => {
          it('should not skip disabled items when navigating next', () => {
            const {toolbar, items} = getPatterns({softDisabled: true, orientation: 'vertical'});
            items[1].inputs.disabled.set(true);

            toolbar.onKeydown(down()); // Item 0 -> Item 1 (disabled)

            expect(toolbar.activeItem()?.value()).toBe('item 1');
          });

          it('should not skip disabled items when navigating prev', () => {
            const {toolbar, items} = getPatterns({softDisabled: true, orientation: 'vertical'});
            items[1].inputs.disabled.set(true);

            toolbar.onKeydown(down()); // Item 0 -> Item 1 (disabled)
            toolbar.onKeydown(down()); // Item 1 -> Item 2
            toolbar.onKeydown(up()); // Item 2 -> Item 1 (disabled)

            expect(toolbar.activeItem()?.value()).toBe('item 1');
          });

          it('should navigate to the last item on End', () => {
            const {toolbar, items} = getPatterns({softDisabled: true, orientation: 'vertical'});
            items[items.length - 1].inputs.disabled.set(true);

            toolbar.onKeydown(end());
            expect(toolbar.activeItem()?.value()).toBe('item 8');
          });

          it('should navigate to the first item on Home', () => {
            const {toolbar, items} = getPatterns({softDisabled: true, orientation: 'vertical'});
            items[0].inputs.disabled.set(true);

            toolbar.onKeydown(down()); // Item 0 -> Item 1
            toolbar.onKeydown(home()); // Item 1 -> Item 0

            expect(toolbar.activeItem()?.value()).toBe('item 0');
          });

          describe('with wrap true', () => {
            it('should wrap from last to first', () => {
              const {toolbar, items} = getPatterns({
                softDisabled: true,
                wrap: true,
                orientation: 'vertical',
              });
              items[0].inputs.disabled.set(true);

              toolbar.onKeydown(end());
              toolbar.onKeydown(down());

              expect(toolbar.activeItem()?.value()).toBe('item 0');
            });

            it('should wrap from first to last', () => {
              const {toolbar, items} = getPatterns({
                softDisabled: true,
                wrap: true,
                orientation: 'vertical',
              });
              items[items.length - 1].inputs.disabled.set(true);

              toolbar.onKeydown(home());
              toolbar.onKeydown(up());

              expect(toolbar.activeItem()?.value()).toBe('item 8');
            });
          });

          describe('with wrap false', () => {
            it('should not wrap from last to first', () => {
              const {toolbar} = getPatterns({
                softDisabled: true,
                wrap: false,
                orientation: 'vertical',
              });
              toolbar.onKeydown(end());
              toolbar.onKeydown(down());

              expect(toolbar.activeItem()?.value()).toBe('item 8');
            });

            it('should not wrap from first to last', () => {
              const {toolbar} = getPatterns({
                softDisabled: true,
                wrap: false,
                orientation: 'vertical',
              });
              toolbar.onKeydown(home());
              toolbar.onKeydown(up());

              expect(toolbar.activeItem()?.value()).toBe('item 0');
            });
          });
        });

        describe('with softDisabled false', () => {
          it('should skip disabled items when navigating next', () => {
            const {toolbar, items} = getPatterns({softDisabled: false, orientation: 'vertical'});
            items[1].inputs.disabled.set(true);

            toolbar.onKeydown(down()); // Item 0 -> Item 2 (skips Item 1)

            expect(toolbar.activeItem()).toBe(items[2]);
          });

          it('should skip disabled items when navigating prev', () => {
            const {toolbar, items} = getPatterns({softDisabled: false, orientation: 'vertical'});
            items[1].inputs.disabled.set(true);

            toolbar.onKeydown(down()); // Item 0 -> Item 2
            toolbar.onKeydown(up()); // Item 2 -> Item 0 (skips Item 1)

            expect(toolbar.activeItem()?.value()).toBe('item 0');
          });

          it('should navigate to the last focusable item on End', () => {
            const {toolbar, items} = getPatterns({softDisabled: false, orientation: 'vertical'});
            items[items.length - 1].inputs.disabled.set(true);

            toolbar.onKeydown(end());
            expect(toolbar.activeItem()?.value()).toBe('item 7');
          });

          it('should navigate to the first focusable item on Home', () => {
            const {toolbar, items} = getPatterns({softDisabled: false, orientation: 'vertical'});
            items[0].inputs.disabled.set(true);

            toolbar.onKeydown(end());
            toolbar.onKeydown(home());

            expect(toolbar.activeItem()?.value()).toBe('item 1');
          });

          describe('with wrap true', () => {
            it('should wrap from last to first focusable item', () => {
              const {toolbar, items} = getPatterns({
                softDisabled: false,
                wrap: true,
                orientation: 'vertical',
              });
              items[0].inputs.disabled.set(true);

              toolbar.onKeydown(end());
              toolbar.onKeydown(down());

              expect(toolbar.activeItem()?.value()).toBe('item 1');
            });

            it('should wrap from first to last focusable item', () => {
              const {toolbar, items} = getPatterns({
                softDisabled: false,
                wrap: true,
                orientation: 'vertical',
              });
              items[items.length - 1].inputs.disabled.set(true);

              toolbar.onKeydown(home());
              toolbar.onKeydown(up());

              expect(toolbar.activeItem()?.value()).toBe('item 7');
            });
          });

          describe('with wrap false', () => {
            it('should not wrap from last to first focusable item', () => {
              const {toolbar} = getPatterns({
                softDisabled: false,
                wrap: false,
                orientation: 'vertical',
              });
              toolbar.onKeydown(end());
              toolbar.onKeydown(down());

              expect(toolbar.activeItem()?.value()).toBe('item 8');
            });

            it('should not wrap from first to last focusable item', () => {
              const {toolbar, items} = getPatterns({
                softDisabled: false,
                wrap: false,
                orientation: 'vertical',
              });
              items[1].inputs.disabled.set(true);

              toolbar.onKeydown(home());
              toolbar.onKeydown(up());

              expect(toolbar.activeItem()?.value()).toBe('item 0');
            });
          });
        });
      });

      describe('with rtl text direction', () => {
        it('should navigate next on ArrowDown', () => {
          const {toolbar} = getPatterns({orientation: 'vertical', textDirection: 'rtl'});
          toolbar.onKeydown(down()); // Item 0 -> Item 1
          expect(toolbar.activeItem()?.value()).toBe('item 1');
        });

        it('should navigate prev on ArrowUp', () => {
          const {toolbar} = getPatterns({orientation: 'vertical', textDirection: 'rtl'});
          toolbar.onKeydown(down()); // Item 0 -> Item 1
          toolbar.onKeydown(up()); // Item 1 -> Item 0
          expect(toolbar.activeItem()?.value()).toBe('item 0');
        });

        it('should navigate last to first in a widget group on ArrowLeft', () => {
          const {toolbar} = getPatterns({orientation: 'vertical', textDirection: 'rtl'});

          toolbar.onKeydown(down()); // Item 0 -> Item 1
          toolbar.onKeydown(down()); // Item 1 -> Item 2 (Group 0)
          toolbar.onKeydown(left()); // Item 2 -> Item 3 (Group 0)
          toolbar.onKeydown(left()); // Item 3 -> Item 4 (Group 0)
          toolbar.onKeydown(left()); // Item 4 -> Item 2 (Group 0)

          expect(toolbar.activeItem()?.value()).toBe('item 2');
        });

        it('should navigate first to last in a widget group on ArrowRight', () => {
          const {toolbar} = getPatterns({orientation: 'vertical', textDirection: 'rtl'});

          toolbar.onKeydown(down()); // Item 0 -> Item 1
          toolbar.onKeydown(down()); // Item 1 -> Item 2 (Group 0)
          toolbar.onKeydown(right()); // Item 2 -> Item 4 (Group 0)

          expect(toolbar.activeItem()?.value()).toBe('item 4');
        });

        describe('with softDisabled true', () => {
          it('should not skip disabled items when navigating next', () => {
            const {toolbar, items} = getPatterns({
              softDisabled: true,
              orientation: 'vertical',
              textDirection: 'rtl',
            });
            items[1].inputs.disabled.set(true);

            toolbar.onKeydown(down()); // Item 0 -> Item 1 (disabled)
            expect(toolbar.activeItem()?.value()).toBe('item 1');
          });

          it('should not skip disabled items when navigating prev', () => {
            const {toolbar, items} = getPatterns({
              softDisabled: true,
              orientation: 'vertical',
              textDirection: 'rtl',
            });
            items[1].inputs.disabled.set(true);

            toolbar.onKeydown(down()); // Item 0 -> Item 1 (disabled)
            toolbar.onKeydown(down()); // Item 1 -> Item 2
            toolbar.onKeydown(up()); // Item 2 -> Item 1 (disabled)

            expect(toolbar.activeItem()?.value()).toBe('item 1');
          });

          it('should navigate to the last item on End', () => {
            const {toolbar, items} = getPatterns({
              softDisabled: true,
              orientation: 'vertical',
              textDirection: 'rtl',
            });
            items[items.length - 1].inputs.disabled.set(true);

            toolbar.onKeydown(end());

            expect(toolbar.activeItem()?.value()).toBe('item 8');
          });

          it('should navigate to the first item on Home', () => {
            const {toolbar, items} = getPatterns({
              softDisabled: true,
              orientation: 'vertical',
              textDirection: 'rtl',
            });
            items[0].inputs.disabled.set(true);

            toolbar.onKeydown(down()); // Item 0 -> Item 1
            toolbar.onKeydown(home());

            expect(toolbar.activeItem()?.value()).toBe('item 0');
          });

          describe('with wrap true', () => {
            it('should wrap from last to first', () => {
              const {toolbar, items} = getPatterns({
                softDisabled: true,
                wrap: true,
                orientation: 'vertical',
                textDirection: 'rtl',
              });
              items[0].inputs.disabled.set(true);

              toolbar.onKeydown(end());
              toolbar.onKeydown(down());

              expect(toolbar.activeItem()?.value()).toBe('item 0');
            });

            it('should wrap from first to last', () => {
              const {toolbar, items} = getPatterns({
                softDisabled: true,
                wrap: true,
                orientation: 'vertical',
                textDirection: 'rtl',
              });
              items[items.length - 1].inputs.disabled.set(true);

              toolbar.onKeydown(home());
              toolbar.onKeydown(up());

              expect(toolbar.activeItem()?.value()).toBe('item 8');
            });
          });

          describe('with wrap false', () => {
            it('should not wrap from last to first', () => {
              const {toolbar} = getPatterns({
                softDisabled: true,
                wrap: false,
                orientation: 'vertical',
                textDirection: 'rtl',
              });
              toolbar.onKeydown(end());
              toolbar.onKeydown(down());

              expect(toolbar.activeItem()?.value()).toBe('item 8');
            });

            it('should not wrap from first to last', () => {
              const {toolbar} = getPatterns({
                softDisabled: true,
                wrap: false,
                orientation: 'vertical',
                textDirection: 'rtl',
              });
              toolbar.onKeydown(home());
              toolbar.onKeydown(up());

              expect(toolbar.activeItem()?.value()).toBe('item 0');
            });
          });
        });

        describe('with softDisabled false', () => {
          it('should skip disabled items when navigating next', () => {
            const {toolbar, items} = getPatterns({
              softDisabled: false,
              orientation: 'vertical',
              textDirection: 'rtl',
            });
            items[1].inputs.disabled.set(true);

            toolbar.onKeydown(down()); // Item 0 -> Item 2 (skips Item 1)

            expect(toolbar.activeItem()).toBe(items[2]);
          });

          it('should skip disabled items when navigating prev', () => {
            const {toolbar, items} = getPatterns({
              softDisabled: false,
              orientation: 'vertical',
              textDirection: 'rtl',
            });
            items[1].inputs.disabled.set(true);

            toolbar.onKeydown(down()); // Item 0 -> Item 2
            toolbar.onKeydown(up()); // Item 2 -> Item 0 (skips Item 1)

            expect(toolbar.activeItem()?.value()).toBe('item 0');
          });

          it('should navigate to the last focusable item on End', () => {
            const {toolbar, items} = getPatterns({
              softDisabled: false,
              orientation: 'vertical',
              textDirection: 'rtl',
            });
            items[items.length - 1].inputs.disabled.set(true);

            toolbar.onKeydown(end());
            expect(toolbar.activeItem()).toBe(items[items.length - 2]);
          });

          it('should navigate to the first focusable item on Home', () => {
            const {toolbar, items} = getPatterns({
              softDisabled: false,
              textDirection: 'rtl',
              orientation: 'vertical',
            });
            items[0].inputs.disabled.set(true);

            toolbar.onKeydown(end());
            toolbar.onKeydown(home());

            expect(toolbar.activeItem()?.value()).toBe('item 1');
          });

          describe('with wrap true', () => {
            it('should wrap from last to first focusable item', () => {
              const {toolbar, items} = getPatterns({
                wrap: true,
                softDisabled: false,
                textDirection: 'rtl',
                orientation: 'vertical',
              });
              items[0].inputs.disabled.set(true);

              toolbar.onKeydown(end());
              toolbar.onKeydown(down());

              expect(toolbar.activeItem()?.value()).toBe('item 1');
            });

            it('should wrap from first to last focusable item', () => {
              const {toolbar, items} = getPatterns({
                wrap: true,
                softDisabled: false,
                textDirection: 'rtl',
                orientation: 'vertical',
              });
              items[items.length - 1].inputs.disabled.set(true);

              toolbar.onKeydown(home());
              toolbar.onKeydown(up());

              expect(toolbar.activeItem()).toBe(items[items.length - 2]);
            });
          });

          describe('with wrap false', () => {
            it('should not wrap from last to first focusable item', () => {
              const {toolbar} = getPatterns({
                wrap: false,
                softDisabled: false,
                textDirection: 'rtl',
                orientation: 'vertical',
              });
              toolbar.onKeydown(end());
              toolbar.onKeydown(down());

              expect(toolbar.activeItem()?.value()).toBe('item 8');
            });

            it('should not wrap from first to last focusable item', () => {
              const {toolbar, items} = getPatterns({
                wrap: false,
                softDisabled: false,
                textDirection: 'rtl',
                orientation: 'vertical',
              });
              items[1].inputs.disabled.set(true);

              toolbar.onKeydown(home());
              toolbar.onKeydown(up());

              expect(toolbar.activeItem()?.value()).toBe('item 0');
            });
          });
        });
      });
    });

    describe('with disabled toolbar', () => {
      it('should not navigate on any key press', () => {
        const {toolbar} = getPatterns({disabled: true});
        const initialActiveItem = toolbar.activeItem();

        toolbar.onKeydown(right());
        expect(toolbar.activeItem()).toBe(initialActiveItem);

        toolbar.onKeydown(left());
        expect(toolbar.activeItem()).toBe(initialActiveItem);

        toolbar.onKeydown(up());
        expect(toolbar.activeItem()).toBe(initialActiveItem);

        toolbar.onKeydown(down());
        expect(toolbar.activeItem()).toBe(initialActiveItem);

        toolbar.onKeydown(home());
        expect(toolbar.activeItem()).toBe(initialActiveItem);

        toolbar.onKeydown(end());
        expect(toolbar.activeItem()).toBe(initialActiveItem);
      });
    });
  });

  describe('Selection', () => {
    it('should toggle the active item on Enter', () => {
      const {toolbar} = getPatterns();
      expect(getItem(toolbar, 'item 0').selected()).toBeFalse();
      toolbar.onKeydown(enter());
      expect(getItem(toolbar, 'item 0').selected()).toBeTrue();
      toolbar.onKeydown(enter());
      expect(getItem(toolbar, 'item 0').selected()).toBeFalse();
    });

    it('should toggle the active item on Space', () => {
      const {toolbar} = getPatterns();
      expect(getItem(toolbar, 'item 0').selected()).toBeFalse();
      toolbar.onKeydown(space());
      expect(getItem(toolbar, 'item 0').selected()).toBeTrue();
      toolbar.onKeydown(space());
      expect(getItem(toolbar, 'item 0').selected()).toBeFalse();
    });

    it('should toggle the active item on click', () => {
      const {toolbar, items} = getPatterns();
      expect(getItem(toolbar, 'item 0').selected()).toBeFalse();
      toolbar.onClick(clickItem(items[0]));
      expect(getItem(toolbar, 'item 0').selected()).toBeTrue();
      toolbar.onClick(clickItem(items[0]));
      expect(getItem(toolbar, 'item 0').selected()).toBeFalse();
    });

    it('should be able to select multiple items in the toolbar', () => {
      const {toolbar} = getPatterns();
      expect(getItem(toolbar, 'item 0').selected()).toBeFalse();
      expect(getItem(toolbar, 'item 1').selected()).toBeFalse();

      // Select first item
      toolbar.onKeydown(enter());
      expect(getItem(toolbar, 'item 0').selected()).toBeTrue();
      expect(getItem(toolbar, 'item 1').selected()).toBeFalse();

      // Navigate to and select second item
      toolbar.onKeydown(right());
      toolbar.onKeydown(space());
      expect(getItem(toolbar, 'item 0').selected()).toBeTrue();
      expect(getItem(toolbar, 'item 1').selected()).toBeTrue();
    });

    it('should not be able to select multiple items in a group', () => {
      const {toolbar} = getPatterns();
      expect(getItem(toolbar, 'item 2').selected()).toBeFalse();
      expect(getItem(toolbar, 'item 3').selected()).toBeFalse();

      // Navigate to and select first item in group
      toolbar.onKeydown(right());
      toolbar.onKeydown(right());
      toolbar.onKeydown(enter());
      expect(getItem(toolbar, 'item 2').selected()).toBeTrue();
      expect(getItem(toolbar, 'item 3').selected()).toBeFalse();

      // Navigate to and select second item in group
      toolbar.onKeydown(right());
      toolbar.onKeydown(enter());
      expect(getItem(toolbar, 'item 2').selected()).toBeFalse();
      expect(getItem(toolbar, 'item 3').selected()).toBeTrue();
    });

    it('should not select disabled items', () => {
      const {toolbar, items} = getPatterns();
      items[1].inputs.disabled.set(true);

      // Navigate to disabled item
      toolbar.onKeydown(right());
      expect(toolbar.activeItem()?.value()).toBe('item 1');

      // Try to select disabled item
      toolbar.onKeydown(enter());
      expect(getItem(toolbar, 'item 1').selected()).toBeFalse();
    });

    it('should not select items in a disabled group', () => {
      const {toolbar, items, group0} = getPatterns();
      group0.disabled.set(true);

      toolbar.onClick(clickItem(items[2]));
      expect(toolbar.activeItem()?.value()).toBe('item 2');
      expect(getItem(toolbar, 'item 2').selected()).toBeFalse();

      toolbar.onKeydown(right());
      toolbar.onKeydown(enter());
      expect(toolbar.activeItem()?.value()).toBe('item 3');
      expect(getItem(toolbar, 'item 3').selected()).toBeFalse();
    });
  });
});
