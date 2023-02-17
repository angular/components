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

class FakeBaseTreeKeyManagerItem {
  _isExpanded = false;
  _parent: FakeBaseTreeKeyManagerItem | null = null;
  _children: FakeBaseTreeKeyManagerItem[] = [];

  isDisabled?: boolean = false;

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
  constructor: new (label: string) =>
    | FakeArrayTreeKeyManagerItem
    | FakeObservableTreeKeyManagerItem;
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

      beforeEach(() => {
        itemList = new QueryList<FakeArrayTreeKeyManagerItem | FakeObservableTreeKeyManagerItem>();
        const parent1 = new itemParam.constructor('parent1');
        const parent1Child1 = new itemParam.constructor('parent1Child1');
        const parent1Child1Child1 = new itemParam.constructor('parent1Child1Child1');
        const parent1Child2 = new itemParam.constructor('parent1Child2');
        const parent2 = new itemParam.constructor('parent2');
        const parent2Child1 = new itemParam.constructor('parent2Child1');

        parent1._children = [parent1Child1, parent1Child2];
        parent1Child1._parent = parent1;
        parent1Child1._children = [parent1Child1Child1];
        parent1Child1Child1._parent = parent1Child1;
        parent1Child2._parent = parent1;
        parent2._children = [parent2Child1];
        parent2Child1._parent = parent2;

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
          .toBe('parent1');
        itemList.reset([new FakeObservableTreeKeyManagerItem('parent0'), ...itemList.toArray()]);
        itemList.notifyOnChanges();

        expect(keyManager.getActiveItemIndex()).withContext('active item index').toBe(1);
        expect(keyManager.getActiveItem()?.getLabel())
          .withContext('active item label')
          .toBe('parent1');
      });

      describe('Key events', () => {
        it('should emit tabOut when the tab key is pressed', () => {
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

        it('should focus the last item when End is pressed', () => {
          keyManager.onClick(itemList.get(0)!);
          expect(keyManager.getActiveItemIndex()).toBe(0);

          keyManager.onKeydown(fakeKeyEvents.end);
          expect(keyManager.getActiveItemIndex()).toBe(itemList.length - 1);
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
    });
  }
});
