import {
  DOWN_ARROW,
  EIGHT,
  END,
  ENTER,
  HOME,
  LEFT_ARROW,
  RIGHT_ARROW,
  SPACE,
  TAB,
  UP_ARROW,
} from '@angular/cdk/keycodes';
import {createKeyboardEvent} from '../../testing/private';
import {QueryList} from '@angular/core';
import {take} from 'rxjs/operators';
import {TreeKeyManager, TreeKeyManagerItem} from './tree-key-manager';
import {Observable, of as observableOf, Subscription} from 'rxjs';
import {fakeAsync, tick} from '@angular/core/testing';

class FakeBaseTreeKeyManagerItem {
  _isExpanded = false;
  _parent: FakeBaseTreeKeyManagerItem | null = null;
  _children: FakeBaseTreeKeyManagerItem[] = [];

  isDisabled?: boolean = false;
  skipItem?: boolean = false;

  constructor(private _label: string) {}

  getLabel(): string {
    return this._label;
  }
  activate(): void {}
  getParent(): this | null {
    return this._parent as this | null;
  }
  isExpanded(): boolean {
    return this._isExpanded;
  }
  collapse(): void {
    this._isExpanded = false;
  }
  expand(): void {
    this._isExpanded = true;
  }
  focus(): void {}
}

class FakeArrayTreeKeyManagerItem extends FakeBaseTreeKeyManagerItem implements TreeKeyManagerItem {
  getChildren(): FakeArrayTreeKeyManagerItem[] {
    return this._children as FakeArrayTreeKeyManagerItem[];
  }
}

class FakeObservableTreeKeyManagerItem
  extends FakeBaseTreeKeyManagerItem
  implements TreeKeyManagerItem
{
  getChildren(): Observable<FakeObservableTreeKeyManagerItem[]> {
    return observableOf(this._children as FakeObservableTreeKeyManagerItem[]);
  }
}

interface ItemConstructorTestContext {
  description: string;
  constructor: new (
    label: string,
  ) => FakeArrayTreeKeyManagerItem | FakeObservableTreeKeyManagerItem;
}

interface ExpandCollapseKeyEventTestContext {
  direction: 'ltr' | 'rtl';
  expandKeyEvent: () => KeyboardEvent;
  collapseKeyEvent: () => KeyboardEvent;
}

describe('TreeKeyManager', () => {
  let fakeKeyEvents: {
    downArrow: KeyboardEvent;
    upArrow: KeyboardEvent;
    leftArrow: KeyboardEvent;
    rightArrow: KeyboardEvent;
    tab: KeyboardEvent;
    home: KeyboardEvent;
    end: KeyboardEvent;
    enter: KeyboardEvent;
    space: KeyboardEvent;
    star: KeyboardEvent;
    unsupported: KeyboardEvent;
  };

  beforeEach(() => {
    fakeKeyEvents = {
      downArrow: createKeyboardEvent('keydown', DOWN_ARROW),
      upArrow: createKeyboardEvent('keydown', UP_ARROW),
      leftArrow: createKeyboardEvent('keydown', LEFT_ARROW),
      rightArrow: createKeyboardEvent('keydown', RIGHT_ARROW),
      tab: createKeyboardEvent('keydown', TAB),
      home: createKeyboardEvent('keydown', HOME),
      end: createKeyboardEvent('keydown', END),
      enter: createKeyboardEvent('keydown', ENTER),
      space: createKeyboardEvent('keydown', SPACE),
      star: createKeyboardEvent('keydown', EIGHT, '*'),
      unsupported: createKeyboardEvent('keydown', 192), // corresponds to the tilde character (~)
    };
  });

  const itemParameters: ItemConstructorTestContext[] = [
    {description: 'Observable children', constructor: FakeObservableTreeKeyManagerItem},
    {description: 'array children', constructor: FakeArrayTreeKeyManagerItem},
  ];

  for (const itemParam of itemParameters) {
    describe(itemParam.description, () => {
      let itemList: QueryList<FakeArrayTreeKeyManagerItem | FakeObservableTreeKeyManagerItem>;
      let keyManager: TreeKeyManager<
        FakeArrayTreeKeyManagerItem | FakeObservableTreeKeyManagerItem
      >;

      let parentItem: FakeArrayTreeKeyManagerItem | FakeObservableTreeKeyManagerItem; // index 0
      let childItem: FakeArrayTreeKeyManagerItem | FakeObservableTreeKeyManagerItem; // index 1
      let childItemWithNoChildren: FakeArrayTreeKeyManagerItem | FakeObservableTreeKeyManagerItem; // index 3
      let lastItem: FakeArrayTreeKeyManagerItem | FakeObservableTreeKeyManagerItem; // index 5

      beforeEach(() => {
        itemList = new QueryList<FakeArrayTreeKeyManagerItem | FakeObservableTreeKeyManagerItem>();
        const parent1 = new itemParam.constructor('one');
        const parent1Child1 = new itemParam.constructor('two');
        const parent1Child1Child1 = new itemParam.constructor('three');
        const parent1Child2 = new itemParam.constructor('four');
        const parent2 = new itemParam.constructor('five');
        const parent2Child1 = new itemParam.constructor('six');

        parent1._children = [parent1Child1, parent1Child2];
        parent1Child1._parent = parent1;
        parent1Child1._children = [parent1Child1Child1];
        parent1Child1Child1._parent = parent1Child1;
        parent1Child2._parent = parent1;
        parent2._children = [parent2Child1];
        parent2Child1._parent = parent2;

        parentItem = parent1;
        childItem = parent1Child1;
        childItemWithNoChildren = parent1Child2;
        lastItem = parent2Child1;

        itemList.reset([
          parent1,
          parent1Child1,
          parent1Child1Child1,
          parent1Child2,
          parent2,
          parent2Child1,
        ]);
        keyManager = new TreeKeyManager<
          FakeObservableTreeKeyManagerItem | FakeArrayTreeKeyManagerItem
        >({
          items: itemList,
        });
      });

      it('should start off the activeItem as null', () => {
        expect(keyManager.getActiveItem()).withContext('active item').toBeNull();
      });

      it('should maintain the active item if the amount of items changes', () => {
        keyManager.onClick(itemList.get(0)!);

        expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(0);
        expect(keyManager.getActiveItem()?.getLabel())
          .withContext('active item label')
          .toBe('one');
        itemList.reset([new FakeObservableTreeKeyManagerItem('parent0'), ...itemList.toArray()]);
        itemList.notifyOnChanges();

        expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(1);
        expect(keyManager.getActiveItem()?.getLabel())
          .withContext('active item label')
          .toBe('one');
      });

      describe('Key events', () => {
        it('should emit tabOut when tab key is pressed', () => {
          const spy = jasmine.createSpy('tabOut spy');
          keyManager.tabOut.pipe(take(1)).subscribe(spy);
          keyManager.onKeydown(fakeKeyEvents.tab);

          expect(spy).toHaveBeenCalled();
        });

        it('should emit tabOut when the tab key is pressed with a modifier', () => {
          const spy = jasmine.createSpy('tabOut spy');
          keyManager.tabOut.pipe(take(1)).subscribe(spy);

          Object.defineProperty(fakeKeyEvents.tab, 'shiftKey', {get: () => true});
          keyManager.onKeydown(fakeKeyEvents.tab);

          expect(spy).toHaveBeenCalled();
        });

        it('should emit an event whenever the active item changes', () => {
          keyManager.onClick(itemList.get(0)!);

          const spy = jasmine.createSpy('change spy');
          const subscription = keyManager.change.subscribe(spy);

          keyManager.onKeydown(fakeKeyEvents.downArrow);
          expect(spy).toHaveBeenCalledTimes(1);

          keyManager.onKeydown(fakeKeyEvents.upArrow);
          expect(spy).toHaveBeenCalledTimes(2);

          subscription.unsubscribe();
        });

        it('should emit if the active item changed, but not the active index', () => {
          keyManager.onClick(itemList.get(0)!);

          const spy = jasmine.createSpy('change spy');
          const subscription = keyManager.change.subscribe(spy);

          itemList.reset([new itemParam.constructor('zero'), ...itemList.toArray()]);
          itemList.notifyOnChanges();
          keyManager.onClick(itemList.get(0)!);

          expect(spy).toHaveBeenCalledTimes(1);
          subscription.unsubscribe();
        });

        it('should activate the first item when pressing down on a clean key manager', () => {
          expect(keyManager.getActiveItemIndex())
            .withContext('default focused item index')
            .toBe(-1);

          keyManager.onKeydown(fakeKeyEvents.downArrow);

          expect(keyManager.getActiveItemIndex())
            .withContext('focused item index, after down arrow')
            .toBe(0);
        });

        it('should not prevent the default keyboard action when pressing tab', () => {
          expect(fakeKeyEvents.tab.defaultPrevented).toBe(false);

          keyManager.onKeydown(fakeKeyEvents.tab);

          expect(fakeKeyEvents.tab.defaultPrevented).toBe(false);
        });

        it('should not do anything for unsupported key presses', () => {
          keyManager.onClick(itemList.get(1)!);

          expect(keyManager.getActiveItemIndex()).toBe(1);
          expect(fakeKeyEvents.unsupported.defaultPrevented).toBe(false);

          keyManager.onKeydown(fakeKeyEvents.unsupported);

          expect(keyManager.getActiveItemIndex()).toBe(1);
          expect(fakeKeyEvents.unsupported.defaultPrevented).toBe(false);
        });

        it('should focus the first item when Home is pressed', () => {
          keyManager.onClick(itemList.get(1)!);
          expect(keyManager.getActiveItemIndex()).toBe(1);

          keyManager.onKeydown(fakeKeyEvents.home);

          expect(keyManager.getActiveItemIndex()).toBe(0);
        });

        it('should focus the first non-disabled item when Home is pressed', () => {
          itemList.get(0)!.isDisabled = true;
          keyManager.onClick(itemList.get(2)!);
          expect(keyManager.getActiveItemIndex()).toBe(2);

          keyManager.onKeydown(fakeKeyEvents.home);

          expect(keyManager.getActiveItemIndex()).toBe(1);
        });

        it('should focus the last item when End is pressed', () => {
          keyManager.onClick(itemList.get(0)!);
          expect(keyManager.getActiveItemIndex()).toBe(0);

          keyManager.onKeydown(fakeKeyEvents.end);
          expect(keyManager.getActiveItemIndex()).toBe(itemList.length - 1);
        });

        it('should focus the last non-disabled item when End is pressed', () => {
          itemList.get(itemList.length - 1)!.isDisabled = true;
          keyManager.onClick(itemList.get(0)!);
          expect(keyManager.getActiveItemIndex()).toBe(0);

          keyManager.onKeydown(fakeKeyEvents.end);

          expect(keyManager.getActiveItemIndex()).toBe(itemList.length - 2);
        });
      });

      describe('up/down key events', () => {
        it('should set subsequent items as active when the down key is pressed', () => {
          keyManager.onClick(itemList.get(0)!);

          const spy = jasmine.createSpy('change spy');
          const subscription = keyManager.change.subscribe(spy);
          keyManager.onKeydown(fakeKeyEvents.downArrow);

          expect(keyManager.getActiveItemIndex())
            .withContext('active item index, after one down key event.')
            .toBe(1);
          expect(spy).not.toHaveBeenCalledWith(itemList.get(0));
          expect(spy).toHaveBeenCalledWith(itemList.get(1));
          expect(spy).not.toHaveBeenCalledWith(itemList.get(2));

          keyManager.onKeydown(fakeKeyEvents.downArrow);
          expect(keyManager.getActiveItemIndex())
            .withContext('active item index, after two down key events.')
            .toBe(2);
          expect(spy).not.toHaveBeenCalledWith(itemList.get(0));
          expect(spy).toHaveBeenCalledWith(itemList.get(2));
          subscription.unsubscribe();
        });

        it('should set first item active when the down key is pressed if no active item', () => {
          keyManager.onKeydown(fakeKeyEvents.downArrow);

          expect(keyManager.getActiveItemIndex())
            .withContext('active item index, after down key if active item was null')
            .toBe(0);
        });

        it('should set previous item as active when the up key is pressed', () => {
          keyManager.onClick(itemList.get(0)!);

          const spy = jasmine.createSpy('change spy');
          const subscription = keyManager.change.subscribe(spy);
          keyManager.onKeydown(fakeKeyEvents.downArrow);

          expect(keyManager.getActiveItemIndex())
            .withContext('active item index, after one down key event.')
            .toBe(1);
          expect(spy).not.toHaveBeenCalledWith(itemList.get(0));
          expect(spy).toHaveBeenCalledWith(itemList.get(1));

          keyManager.onKeydown(fakeKeyEvents.upArrow);
          expect(keyManager.getActiveItemIndex())
            .withContext('active item index, after one down and one up key event.')
            .toBe(0);
          expect(spy).toHaveBeenCalledWith(itemList.get(0));

          subscription.unsubscribe();
        });

        it('should do nothing when the up key is pressed if no active item', () => {
          const spy = jasmine.createSpy('change spy');
          const subscription = keyManager.change.subscribe(spy);
          keyManager.onKeydown(fakeKeyEvents.upArrow);

          expect(keyManager.getActiveItemIndex())
            .withContext('active item index, if up event occurs and no active item.')
            .toBe(-1);
          expect(spy).not.toHaveBeenCalled();
          subscription.unsubscribe();
        });

        it('should skip disabled items', () => {
          itemList.get(1)!.isDisabled = true;
          keyManager.onClick(itemList.get(0)!);

          const spy = jasmine.createSpy('change spy');
          const subscription = keyManager.change.subscribe(spy);
          // down event should skip past disabled item from 0 to 2
          keyManager.onKeydown(fakeKeyEvents.downArrow);
          expect(keyManager.getActiveItemIndex())
            .withContext('active item index, skipping past disabled item on down event.')
            .toBe(2);
          expect(spy).not.toHaveBeenCalledWith(itemList.get(0));
          expect(spy).not.toHaveBeenCalledWith(itemList.get(1));
          expect(spy).toHaveBeenCalledWith(itemList.get(2));

          // up event should skip past disabled item from 2 to 0
          keyManager.onKeydown(fakeKeyEvents.upArrow);
          expect(keyManager.getActiveItemIndex())
            .withContext('active item index, skipping past disabled item on up event.')
            .toBe(0);
          expect(spy).toHaveBeenCalledWith(itemList.get(0));
          expect(spy).not.toHaveBeenCalledWith(itemList.get(1));
          expect(spy).toHaveBeenCalledWith(itemList.get(2));
          subscription.unsubscribe();
        });

        it('should work normally when disabled property does not exist', () => {
          itemList.get(0)!.isDisabled = undefined;
          itemList.get(1)!.isDisabled = undefined;
          itemList.get(2)!.isDisabled = undefined;
          keyManager.onClick(itemList.get(0)!);

          const spy = jasmine.createSpy('change spy');
          const subscription = keyManager.change.subscribe(spy);
          keyManager.onKeydown(fakeKeyEvents.downArrow);
          expect(keyManager.getActiveItemIndex())
            .withContext('active item index, after one down event when disabled is not set.')
            .toBe(1);
          expect(spy).not.toHaveBeenCalledWith(itemList.get(0));
          expect(spy).toHaveBeenCalledWith(itemList.get(1));
          expect(spy).not.toHaveBeenCalledWith(itemList.get(2));

          keyManager.onKeydown(fakeKeyEvents.downArrow);
          expect(keyManager.getActiveItemIndex())
            .withContext('active item index, after two down events when disabled is not set.')
            .toBe(2);
          expect(spy).not.toHaveBeenCalledWith(itemList.get(0));
          expect(spy).toHaveBeenCalledWith(itemList.get(1));
          expect(spy).toHaveBeenCalledWith(itemList.get(2));
          subscription.unsubscribe();
        });

        it('should not move active item past either end of the list', () => {
          keyManager.onClick(itemList.get(itemList.length - 1)!);

          expect(keyManager.getActiveItemIndex())
            .withContext('active item index, selecting the last item')
            .toBe(itemList.length - 1);

          // This down event would move active item past the end of the list
          keyManager.onKeydown(fakeKeyEvents.downArrow);
          expect(keyManager.getActiveItemIndex())
            .withContext('active item index, last item still selected after a down event')
            .toBe(itemList.length - 1);

          keyManager.onClick(itemList.get(0)!);
          keyManager.onKeydown(fakeKeyEvents.upArrow);
          expect(keyManager.getActiveItemIndex())
            .withContext('active item index, selecting the first item')
            .toBe(0);

          // This up event would move active item past the beginning of the list
          keyManager.onKeydown(fakeKeyEvents.upArrow);
          expect(keyManager.getActiveItemIndex())
            .withContext('active item index, first item still selected after a up event')
            .toBe(0);
        });

        it('should not move active item to end when the last item is disabled', () => {
          itemList.get(itemList.length - 1)!.isDisabled = true;

          keyManager.onClick(itemList.get(itemList.length - 2)!);
          expect(keyManager.getActiveItemIndex())
            .withContext('active item index, last non-disabled item selected')
            .toBe(itemList.length - 2);

          // This down key event would set active item to the last item, which is disabled
          keyManager.onKeydown(fakeKeyEvents.downArrow);
          expect(keyManager.getActiveItemIndex())
            .withContext(
              'active item index, last non-disabled item still selected, after down event',
            )
            .toBe(itemList.length - 2);
        });

        it('should prevent the default keyboard action of handled events', () => {
          expect(fakeKeyEvents.downArrow.defaultPrevented).toBe(false);
          keyManager.onKeydown(fakeKeyEvents.downArrow);
          expect(fakeKeyEvents.downArrow.defaultPrevented).toBe(true);

          expect(fakeKeyEvents.upArrow.defaultPrevented).toBe(false);
          keyManager.onKeydown(fakeKeyEvents.upArrow);
          expect(fakeKeyEvents.upArrow.defaultPrevented).toBe(true);
        });
      });

      describe('expand/collapse key events', () => {
        const parameters: ExpandCollapseKeyEventTestContext[] = [
          {
            direction: 'ltr',
            expandKeyEvent: () => fakeKeyEvents.rightArrow,
            collapseKeyEvent: () => fakeKeyEvents.leftArrow,
          },
          {
            direction: 'rtl',
            expandKeyEvent: () => fakeKeyEvents.leftArrow,
            collapseKeyEvent: () => fakeKeyEvents.rightArrow,
          },
        ];

        for (const param of parameters) {
          describe(`in ${param.direction} mode`, () => {
            beforeEach(() => {
              keyManager = new TreeKeyManager({
                items: itemList,
                horizontalOrientation: param.direction,
              });
              for (const item of itemList) {
                item._isExpanded = false;
              }
            });

            it('with nothing active, expand key does not expand any items', () => {
              expect(itemList.toArray().map(item => item.isExpanded()))
                .withContext('item expansion state, for all items')
                .toEqual(itemList.toArray().map(_ => false));

              keyManager.onKeydown(param.expandKeyEvent());

              expect(itemList.toArray().map(item => item.isExpanded()))
                .withContext('item expansion state, for all items, after expand event')
                .toEqual(itemList.toArray().map(_ => false));
            });

            it('with nothing active, collapse key does not collapse any items', () => {
              for (const item of itemList) {
                item._isExpanded = true;
              }
              expect(itemList.toArray().map(item => item.isExpanded()))
                .withContext('item expansion state, for all items')
                .toEqual(itemList.toArray().map(_ => true));

              keyManager.onKeydown(param.collapseKeyEvent());

              expect(itemList.toArray().map(item => item.isExpanded()))
                .withContext('item expansion state, for all items')
                .toEqual(itemList.toArray().map(_ => true));
            });

            it('with nothing active, expand key does not change the active item index', () => {
              expect(keyManager.getActiveItemIndex())
                .withContext('active item index, initial')
                .toEqual(-1);

              keyManager.onKeydown(param.expandKeyEvent());

              expect(keyManager.getActiveItemIndex())
                .withContext('active item index, after expand event')
                .toEqual(-1);
            });

            it('with nothing active, collapse key does not change the active item index', () => {
              for (const item of itemList) {
                item._isExpanded = true;
              }

              expect(keyManager.getActiveItemIndex())
                .withContext('active item index, initial')
                .toEqual(-1);

              keyManager.onKeydown(param.collapseKeyEvent());

              expect(keyManager.getActiveItemIndex())
                .withContext('active item index, after collapse event')
                .toEqual(-1);
            });

            describe('if the current item is expanded', () => {
              let spy: jasmine.Spy;
              let subscription: Subscription;

              beforeEach(() => {
                keyManager.onClick(parentItem);
                parentItem._isExpanded = true;

                spy = jasmine.createSpy('change spy');
                subscription = keyManager.change.subscribe(spy);
              });

              afterEach(() => {
                subscription.unsubscribe();
              });

              it('when the expand key is pressed, moves to the first child', () => {
                keyManager.onKeydown(param.expandKeyEvent());

                expect(keyManager.getActiveItemIndex())
                  .withContext('active item index, after one expand key event.')
                  .toBe(1);
                expect(spy).not.toHaveBeenCalledWith(parentItem);
                expect(spy).toHaveBeenCalledWith(childItem);
              });

              it(
                'when the expand key is pressed, and the first child is disabled, ' +
                  'moves to the first non-disabled child',
                () => {
                  childItem.isDisabled = true;

                  keyManager.onKeydown(param.expandKeyEvent());

                  expect(keyManager.getActiveItemIndex())
                    .withContext('active item index, after one expand key event.')
                    .toBe(3);
                  expect(spy).not.toHaveBeenCalledWith(parentItem);
                  expect(spy).not.toHaveBeenCalledWith(childItem);
                  expect(spy).toHaveBeenCalledWith(childItemWithNoChildren);
                },
              );

              it(
                'when the expand key is pressed, and all children are disabled, ' +
                  'does not change the active item',
                () => {
                  childItem.isDisabled = true;
                  childItemWithNoChildren.isDisabled = true;

                  keyManager.onKeydown(param.expandKeyEvent());

                  expect(keyManager.getActiveItemIndex())
                    .withContext('active item index, after one expand key event.')
                    .toBe(0);
                  expect(spy).not.toHaveBeenCalled();
                },
              );

              it('when the collapse key is pressed, collapses the item', () => {
                expect(parentItem.isExpanded())
                  .withContext('active item initial expansion state')
                  .toBe(true);

                keyManager.onKeydown(param.collapseKeyEvent());

                expect(parentItem.isExpanded())
                  .withContext('active item expansion state, after collapse key')
                  .toBe(false);
              });

              it('when the collapse key is pressed, does not change the active item', () => {
                expect(keyManager.getActiveItemIndex())
                  .withContext('active item index, initial')
                  .toBe(0);

                keyManager.onKeydown(param.collapseKeyEvent());

                expect(keyManager.getActiveItemIndex())
                  .withContext('active item index, after one collapse key event.')
                  .toBe(0);
                expect(spy).not.toHaveBeenCalled();
              });
            });

            describe('if the current item is expanded, and there are no children', () => {
              let spy: jasmine.Spy;
              let subscription: Subscription;

              beforeEach(() => {
                keyManager.onClick(childItemWithNoChildren);
                childItemWithNoChildren._isExpanded = true;

                spy = jasmine.createSpy('change spy');
                subscription = keyManager.change.subscribe(spy);
              });

              afterEach(() => {
                subscription.unsubscribe();
              });

              it('when the expand key is pressed, does not change the active item', () => {
                keyManager.onKeydown(param.expandKeyEvent());

                expect(keyManager.getActiveItemIndex())
                  .withContext('active item index, after one expand key event.')
                  .toBe(3);
                expect(spy).not.toHaveBeenCalled();
              });
            });

            describe('if the current item is collapsed, and has a parent item', () => {
              let spy: jasmine.Spy;
              let subscription: Subscription;

              beforeEach(() => {
                keyManager.onClick(childItem);
                childItem._isExpanded = false;

                spy = jasmine.createSpy('change spy');
                subscription = keyManager.change.subscribe(spy);
              });

              afterEach(() => {
                subscription.unsubscribe();
              });

              it('when the expand key is pressed, expands the current item', () => {
                expect(childItem.isExpanded())
                  .withContext('active item initial expansion state')
                  .toBe(false);

                keyManager.onKeydown(param.expandKeyEvent());

                expect(childItem.isExpanded())
                  .withContext('active item expansion state, after expand key')
                  .toBe(true);
              });

              it('when the expand key is pressed, does not change active item', () => {
                expect(keyManager.getActiveItemIndex())
                  .withContext('active item index, initial')
                  .toBe(1);

                keyManager.onKeydown(param.expandKeyEvent());

                expect(keyManager.getActiveItemIndex())
                  .withContext('active item index, after one collapse key event.')
                  .toBe(1);
                expect(spy).not.toHaveBeenCalled();
              });

              it('when the collapse key is pressed, moves the active item to the parent', () => {
                expect(keyManager.getActiveItemIndex())
                  .withContext('active item index, initial')
                  .toBe(1);

                keyManager.onKeydown(param.collapseKeyEvent());

                expect(keyManager.getActiveItemIndex())
                  .withContext('active item index, after one collapse key event.')
                  .toBe(0);
              });

              it('when the collapse key is pressed, and the parent is disabled, does nothing', () => {
                expect(keyManager.getActiveItemIndex())
                  .withContext('active item index, initial')
                  .toBe(1);

                parentItem.isDisabled = true;
                keyManager.onKeydown(param.collapseKeyEvent());

                expect(keyManager.getActiveItemIndex())
                  .withContext('active item index, after one collapse key event.')
                  .toBe(1);
              });
            });

            describe('if the current item is collapsed, and has no parent items', () => {
              let spy: jasmine.Spy;
              let subscription: Subscription;

              beforeEach(() => {
                keyManager.onClick(parentItem);
                parentItem._isExpanded = false;

                spy = jasmine.createSpy('change spy');
                subscription = keyManager.change.subscribe(spy);
              });

              afterEach(() => {
                subscription.unsubscribe();
              });

              it('when the collapse key is pressed, does nothing', () => {
                expect(keyManager.getActiveItemIndex())
                  .withContext('active item index, initial')
                  .toBe(0);

                keyManager.onKeydown(param.collapseKeyEvent());

                expect(keyManager.getActiveItemIndex())
                  .withContext('active item index, after one collapse key event.')
                  .toBe(0);
                expect(spy).not.toHaveBeenCalledWith(parentItem);
              });
            });
          });
        }
      });

      describe('typeahead mode', () => {
        const debounceInterval = 300;

        beforeEach(() => {
          keyManager = new TreeKeyManager({
            items: itemList,
            typeAheadDebounceInterval: debounceInterval,
          });
        });

        it('should throw if the items do not implement the getLabel method', () => {
          const invalidQueryList = new QueryList<any>();
          invalidQueryList.reset([{disabled: false}]);

          expect(
            () =>
              new TreeKeyManager({
                items: invalidQueryList,
                typeAheadDebounceInterval: true,
              }),
          ).toThrowError(/must implement/);
        });

        it('should debounce the input key presses', fakeAsync(() => {
          keyManager.onKeydown(createKeyboardEvent('keydown', 79, 'o')); // types "o"
          tick(1);
          keyManager.onKeydown(createKeyboardEvent('keydown', 78, 'n')); // types "n"
          tick(1);
          keyManager.onKeydown(createKeyboardEvent('keydown', 69, 'e')); // types "e"

          expect(keyManager.getActiveItemIndex())
            .withContext('active item index, before debounce interval')
            .not.toBe(0);

          tick(debounceInterval - 1);

          expect(keyManager.getActiveItemIndex())
            .withContext('active item index, after partial debounce interval')
            .not.toBe(0);

          tick(1);

          expect(keyManager.getActiveItemIndex())
            .withContext('active item index, after full debounce interval')
            .toBe(0);
        }));

        it('uses a default debounce interval', fakeAsync(() => {
          const defaultInterval = 200;
          keyManager = new TreeKeyManager({
            items: itemList,
            typeAheadDebounceInterval: true,
          });

          keyManager.onKeydown(createKeyboardEvent('keydown', 79, 'o')); // types "o"
          tick(1);
          keyManager.onKeydown(createKeyboardEvent('keydown', 78, 'n')); // types "n"
          tick(1);
          keyManager.onKeydown(createKeyboardEvent('keydown', 69, 'e')); // types "e"

          expect(keyManager.getActiveItemIndex())
            .withContext('active item index, before debounce interval')
            .not.toBe(0);

          tick(defaultInterval - 1);

          expect(keyManager.getActiveItemIndex())
            .withContext('active item index, after partial debounce interval')
            .not.toBe(0);

          tick(1);

          expect(keyManager.getActiveItemIndex())
            .withContext('active item index, after full debounce interval')
            .toBe(0);
        }));

        it('should focus the first item that starts with a letter', fakeAsync(() => {
          keyManager.onKeydown(createKeyboardEvent('keydown', 84, 't')); // types "t"

          tick(debounceInterval);

          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(1);
        }));

        it('should focus the first item that starts with sequence of letters', fakeAsync(() => {
          keyManager.onKeydown(createKeyboardEvent('keydown', 84, 't')); // types "t"
          keyManager.onKeydown(createKeyboardEvent('keydown', 72, 'h')); // types "h"

          tick(debounceInterval);

          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(2);
        }));

        it('should cancel any pending timers if a navigation key is pressed', fakeAsync(() => {
          keyManager.onKeydown(createKeyboardEvent('keydown', 84, 't')); // types "t"
          keyManager.onKeydown(createKeyboardEvent('keydown', 72, 'h')); // types "h"
          keyManager.onKeydown(fakeKeyEvents.downArrow);

          tick(debounceInterval);

          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(0);
        }));

        it('should handle non-English input', fakeAsync(() => {
          itemList.reset([
            new itemParam.constructor('едно'),
            new itemParam.constructor('две'),
            new itemParam.constructor('три'),
          ]);
          itemList.notifyOnChanges();

          const keyboardEvent = createKeyboardEvent('keydown', 68, 'д');

          keyManager.onKeydown(keyboardEvent); // types "д"
          tick(debounceInterval);

          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(1);
        }));

        it('should handle non-letter characters', fakeAsync(() => {
          itemList.reset([
            new itemParam.constructor('[]'),
            new itemParam.constructor('321'),
            new itemParam.constructor('`!?'),
          ]);
          itemList.notifyOnChanges();

          keyManager.onKeydown(createKeyboardEvent('keydown', 192, '`')); // types "`"
          tick(debounceInterval);
          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(2);

          keyManager.onKeydown(createKeyboardEvent('keydown', 51, '3')); // types "3"
          tick(debounceInterval);
          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(1);

          keyManager.onKeydown(createKeyboardEvent('keydown', 219, '[')); // types "["
          tick(debounceInterval);
          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(0);
        }));

        it('should not focus disabled items', fakeAsync(() => {
          expect(keyManager.getActiveItemIndex()).withContext('initial active item index').toBe(-1);

          parentItem.isDisabled = true;

          keyManager.onKeydown(createKeyboardEvent('keydown', 79, 'o')); // types "o"
          tick(debounceInterval);

          expect(keyManager.getActiveItemIndex()).withContext('initial active item index').toBe(-1);
        }));

        it('should start looking for matches after the active item', fakeAsync(() => {
          const frodo = new itemParam.constructor('Frodo');
          itemList.reset([
            new itemParam.constructor('Bilbo'),
            frodo,
            new itemParam.constructor('Pippin'),
            new itemParam.constructor('Boromir'),
            new itemParam.constructor('Aragorn'),
          ]);
          itemList.notifyOnChanges();

          keyManager.onClick(frodo);
          keyManager.onKeydown(createKeyboardEvent('keydown', 66, 'b'));
          tick(debounceInterval);

          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(3);
        }));

        it('should wrap back around if there were no matches after the active item', fakeAsync(() => {
          const boromir = new itemParam.constructor('Boromir');
          itemList.reset([
            new itemParam.constructor('Bilbo'),
            new itemParam.constructor('Frodo'),
            new itemParam.constructor('Pippin'),
            boromir,
            new itemParam.constructor('Aragorn'),
          ]);
          itemList.notifyOnChanges();

          keyManager.onClick(boromir);
          keyManager.onKeydown(createKeyboardEvent('keydown', 66, 'b'));
          tick(debounceInterval);

          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(0);
        }));

        it('should wrap back around if the last item is active', fakeAsync(() => {
          keyManager.onClick(lastItem);
          keyManager.onKeydown(createKeyboardEvent('keydown', 79, 'o'));
          tick(debounceInterval);

          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(0);
        }));

        it('should be able to select the first item', fakeAsync(() => {
          keyManager.onKeydown(createKeyboardEvent('keydown', 79, 'o'));
          tick(debounceInterval);

          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(0);
        }));

        it('should not do anything if there is no match', fakeAsync(() => {
          keyManager.onKeydown(createKeyboardEvent('keydown', 87, 'w'));
          tick(debounceInterval);

          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(-1);
        }));
      });

      describe('focusItem', () => {
        beforeEach(() => {
          keyManager.onInitialFocus();
        });

        it('should focus the provided index', () => {
          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(0);

          keyManager.focusItem(1);
          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(1);
        });

        it('should be able to set the active item by reference', () => {
          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(0);

          keyManager.focusItem(itemList.get(2)!);
          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(2);
        });

        it('should be able to set the active item without emitting an event', () => {
          const spy = jasmine.createSpy('change spy');
          const subscription = keyManager.change.subscribe(spy);

          expect(keyManager.getActiveItemIndex()).toBe(0);

          keyManager.focusItem(2, {emitChangeEvent: false});

          expect(keyManager.getActiveItemIndex()).toBe(2);
          expect(spy).not.toHaveBeenCalled();

          subscription.unsubscribe();
        });

        it('should not emit an event if the item did not change', () => {
          const spy = jasmine.createSpy('change spy');
          const subscription = keyManager.change.subscribe(spy);

          keyManager.focusItem(2);
          keyManager.focusItem(2);

          expect(spy).toHaveBeenCalledTimes(1);

          subscription.unsubscribe();
        });
      });

      describe('focusFirstItem', () => {
        beforeEach(() => {
          keyManager.onInitialFocus();
        });

        it('should focus the first item', () => {
          keyManager.onKeydown(fakeKeyEvents.downArrow);
          keyManager.onKeydown(fakeKeyEvents.downArrow);
          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(2);

          keyManager.focusFirstItem();
          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(0);
        });

        it('should set the active item to the second item if the first one is disabled', () => {
          itemList.get(0)!.isDisabled = true;

          keyManager.focusFirstItem();
          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(1);
        });
      });

      describe('focusLastItem', () => {
        beforeEach(() => {
          keyManager.onInitialFocus();
        });

        it('should focus the last item', () => {
          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(0);

          keyManager.focusLastItem();
          expect(keyManager.getActiveItemIndex())
            .withContext('active item index')
            .toBe(itemList.length - 1);
        });

        it('should set the active item to the second-to-last item if the last is disabled', () => {
          itemList.get(itemList.length - 1)!.isDisabled = true;

          keyManager.focusLastItem();
          expect(keyManager.getActiveItemIndex())
            .withContext('active item index')
            .toBe(itemList.length - 2);
        });
      });

      describe('focusNextItem', () => {
        beforeEach(() => {
          keyManager.onInitialFocus();
        });

        it('should focus the next item', () => {
          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(0);

          keyManager.focusNextItem();
          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(1);
        });

        it('should skip disabled items', () => {
          itemList.get(1)!.isDisabled = true;

          keyManager.focusNextItem();
          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(2);
        });
      });

      describe('focusPreviousItem', () => {
        beforeEach(() => {
          keyManager.onInitialFocus();
        });

        it('should focus the previous item', () => {
          keyManager.onKeydown(fakeKeyEvents.downArrow);
          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(1);

          keyManager.focusPreviousItem();
          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(0);
        });

        it('should skip disabled items', () => {
          itemList.get(1)!.isDisabled = true;
          keyManager.onKeydown(fakeKeyEvents.downArrow);
          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(2);

          keyManager.focusPreviousItem();
          expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(0);
        });
      });

      describe('skip predicate', () => {
        beforeEach(() => {
          keyManager = new TreeKeyManager({
            items: itemList,
            skipPredicate: item => item.skipItem ?? false,
          });
          keyManager.onInitialFocus();
        });

        it('should be able to skip items with a custom predicate', () => {
          itemList.get(1)!.skipItem = true;
          expect(keyManager.getActiveItemIndex()).toBe(0);

          keyManager.onKeydown(fakeKeyEvents.downArrow);

          expect(keyManager.getActiveItemIndex()).toBe(2);
        });
      });

      describe('focus', () => {
        beforeEach(() => {
          keyManager.onInitialFocus();

          for (const item of itemList) {
            spyOn(item, 'focus');
          }
        });

        it('calls .focus() on focused items', () => {
          keyManager.onKeydown(fakeKeyEvents.downArrow);

          expect(itemList.get(0)!.focus).not.toHaveBeenCalled();
          expect(itemList.get(1)!.focus).toHaveBeenCalledTimes(1);
          expect(itemList.get(2)!.focus).not.toHaveBeenCalled();

          keyManager.onKeydown(fakeKeyEvents.downArrow);
          expect(itemList.get(0)!.focus).not.toHaveBeenCalled();
          expect(itemList.get(1)!.focus).toHaveBeenCalledTimes(1);
          expect(itemList.get(2)!.focus).toHaveBeenCalledTimes(1);
        });

        it('calls .focus() on focused items, when pressing up key', () => {
          keyManager.onKeydown(fakeKeyEvents.downArrow);

          expect(itemList.get(0)!.focus).not.toHaveBeenCalled();
          expect(itemList.get(1)!.focus).toHaveBeenCalledTimes(1);

          keyManager.onKeydown(fakeKeyEvents.upArrow);

          expect(itemList.get(0)!.focus).toHaveBeenCalledTimes(1);
          expect(itemList.get(1)!.focus).toHaveBeenCalledTimes(1);
        });
      });
    });
  }
});
