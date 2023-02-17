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
import {fakeAsync, tick} from '@angular/core/testing';
import {take} from 'rxjs/operators';
import {FocusOrigin} from '../focus-monitor/focus-monitor';
import {TreeKeyManager, TreeKeyManagerItem} from './tree-key-manager';
import {Observable, of as observableOf} from 'rxjs';

class FakeBaseTreeKeyManagerItem {
  public _isExpanded = false;
  public _parent: FakeBaseTreeKeyManagerItem | null = null;
  public _children: FakeBaseTreeKeyManagerItem[] = [];

  public isDisabled?: boolean = false;

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
  expandKeyEvent: KeyboardEvent;
  collapseKeyEvent: KeyboardEvent;
}

fdescribe('TreeKeyManager', () => {
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

        parentItem = parent1;
        childItem = parent1Child1;
        childItemWithNoChildren = parent1Child2;

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
    });
  }

  //   describe('programmatic focus', () => {
  //     it('should setActiveItem()', () => {
  //       expect(keyManager.activeItemIndex)
  //         .withContext(`Expected first item of the list to be active.`)
  //         .toBe(0);
  //
  //       keyManager.setActiveItem(1);
  //       expect(keyManager.activeItemIndex)
  //         .withContext(`Expected activeItemIndex to be updated when setActiveItem() was called.`)
  //         .toBe(1);
  //     });
  //
  //     it('should be able to set the active item by reference', () => {
  //       expect(keyManager.activeItemIndex)
  //         .withContext(`Expected first item of the list to be active.`)
  //         .toBe(0);
  //
  //       keyManager.setActiveItem(itemList.toArray()[2]);
  //       expect(keyManager.activeItemIndex)
  //         .withContext(`Expected activeItemIndex to be updated.`)
  //         .toBe(2);
  //     });
  //
  //     it('should be able to set the active item without emitting an event', () => {
  //       const spy = jasmine.createSpy('change spy');
  //       const subscription = keyManager.change.subscribe(spy);
  //
  //       expect(keyManager.activeItemIndex).toBe(0);
  //
  //       keyManager.updateActiveItem(2);
  //
  //       expect(keyManager.activeItemIndex).toBe(2);
  //       expect(spy).not.toHaveBeenCalled();
  //
  //       subscription.unsubscribe();
  //     });
  //
  //     it('should expose the active item correctly', () => {
  //       keyManager.onKeydown(fakeKeyEvents.downArrow);
  //
  //       expect(keyManager.activeItemIndex)
  //         .withContext('Expected active item to be the second option.')
  //         .toBe(1);
  //       expect(keyManager.activeItem)
  //         .withContext('Expected the active item to match the second option.')
  //         .toBe(itemList.toArray()[1]);
  //
  //       keyManager.onKeydown(fakeKeyEvents.downArrow);
  //       expect(keyManager.activeItemIndex)
  //         .withContext('Expected active item to be the third option.')
  //         .toBe(2);
  //       expect(keyManager.activeItem)
  //         .withContext('Expected the active item ID to match the third option.')
  //         .toBe(itemList.toArray()[2]);
  //     });
  //
  //     it('should setFirstItemActive()', () => {
  //       keyManager.onKeydown(fakeKeyEvents.downArrow);
  //       keyManager.onKeydown(fakeKeyEvents.downArrow);
  //       expect(keyManager.activeItemIndex)
  //         .withContext(`Expected last item of the list to be active.`)
  //         .toBe(2);
  //
  //       keyManager.setFirstItemActive();
  //       expect(keyManager.activeItemIndex)
  //         .withContext(`Expected setFirstItemActive() to set the active item to the first item.`)
  //         .toBe(0);
  //     });
  //
  //     it('should set the active item to the second item if the first one is disabled', () => {
  //       const items = itemList.toArray();
  //       items[0].disabled = true;
  //       itemList.reset(items);
  //
  //       keyManager.setFirstItemActive();
  //       expect(keyManager.activeItemIndex)
  //         .withContext(`Expected the second item to be active if the first was disabled.`)
  //         .toBe(1);
  //     });
  //
  //     it('should setLastItemActive()', () => {
  //       expect(keyManager.activeItemIndex)
  //         .withContext(`Expected first item of the list to be active.`)
  //         .toBe(0);
  //
  //       keyManager.setLastItemActive();
  //       expect(keyManager.activeItemIndex)
  //         .withContext(`Expected setLastItemActive() to set the active item to the last item.`)
  //         .toBe(2);
  //     });
  //
  //     it('should set the active item to the second to last item if the last is disabled', () => {
  //       const items = itemList.toArray();
  //       items[2].disabled = true;
  //       itemList.reset(items);
  //
  //       keyManager.setLastItemActive();
  //       expect(keyManager.activeItemIndex)
  //         .withContext(`Expected the second to last item to be active if the last was disabled.`)
  //         .toBe(1);
  //     });
  //
  //     it('should setNextItemActive()', () => {
  //       expect(keyManager.activeItemIndex)
  //         .withContext(`Expected first item of the list to be active.`)
  //         .toBe(0);
  //
  //       keyManager.setNextItemActive();
  //       expect(keyManager.activeItemIndex)
  //         .withContext(`Expected setNextItemActive() to set the active item to the next item.`)
  //         .toBe(1);
  //     });
  //
  //     it('should set the active item to the next enabled item if next is disabled', () => {
  //       const items = itemList.toArray();
  //       items[1].disabled = true;
  //       itemList.reset(items);
  //
  //       expect(keyManager.activeItemIndex)
  //         .withContext(`Expected first item of the list to be active.`)
  //         .toBe(0);
  //
  //       keyManager.setNextItemActive();
  //       expect(keyManager.activeItemIndex)
  //         .withContext(`Expected setNextItemActive() to only set enabled items as active.`)
  //         .toBe(2);
  //     });
  //
  //     it('should setPreviousItemActive()', () => {
  //       keyManager.onKeydown(fakeKeyEvents.downArrow);
  //       expect(keyManager.activeItemIndex)
  //         .withContext(`Expected second item of the list to be active.`)
  //         .toBe(1);
  //
  //       keyManager.setPreviousItemActive();
  //       expect(keyManager.activeItemIndex)
  //         .withContext(`Expected setPreviousItemActive() to set the active item to the previous.`)
  //         .toBe(0);
  //     });
  //
  //     it('should skip disabled items when setPreviousItemActive() is called', () => {
  //       const items = itemList.toArray();
  //       items[1].disabled = true;
  //       itemList.reset(items);
  //
  //       keyManager.onKeydown(fakeKeyEvents.downArrow);
  //       keyManager.onKeydown(fakeKeyEvents.downArrow);
  //       expect(keyManager.activeItemIndex)
  //         .withContext(`Expected third item of the list to be active.`)
  //         .toBe(2);
  //
  //       keyManager.setPreviousItemActive();
  //       expect(keyManager.activeItemIndex)
  //         .withContext(`Expected setPreviousItemActive() to skip the disabled item.`)
  //         .toBe(0);
  //     });
  //
  //     it('should not emit an event if the item did not change', () => {
  //       const spy = jasmine.createSpy('change spy');
  //       const subscription = keyManager.change.subscribe(spy);
  //
  //       keyManager.setActiveItem(2);
  //       keyManager.setActiveItem(2);
  //
  //       expect(spy).toHaveBeenCalledTimes(1);
  //
  //       subscription.unsubscribe();
  //     });
  //   });
  //
  //   describe('wrap mode', () => {
  //     it('should return itself to allow chaining', () => {
  //       expect(keyManager.withWrap())
  //         .withContext(`Expected withWrap() to return an instance of ListKeyManager.`)
  //         .toEqual(keyManager);
  //     });
  //
  //     it('should wrap focus when arrow keying past items while in wrap mode', () => {
  //       keyManager.withWrap();
  //       keyManager.onKeydown(fakeKeyEvents.downArrow);
  //       keyManager.onKeydown(fakeKeyEvents.downArrow);
  //
  //       expect(keyManager.activeItemIndex).withContext('Expected last item to be active.').toBe(2);
  //
  //       // this down arrow moves down past the end of the list
  //       keyManager.onKeydown(fakeKeyEvents.downArrow);
  //       expect(keyManager.activeItemIndex)
  //         .withContext('Expected active item to wrap to beginning.')
  //         .toBe(0);
  //
  //       // this up arrow moves up past the beginning of the list
  //       keyManager.onKeydown(fakeKeyEvents.upArrow);
  //       expect(keyManager.activeItemIndex)
  //         .withContext('Expected active item to wrap to end.')
  //         .toBe(2);
  //     });
  //
  //     it('should set last item active when up arrow is pressed if no active item', () => {
  //       keyManager.withWrap();
  //       keyManager.setActiveItem(-1);
  //       keyManager.onKeydown(fakeKeyEvents.upArrow);
  //
  //       expect(keyManager.activeItemIndex)
  //         .withContext('Expected last item to be active on up arrow if no active item.')
  //         .toBe(2);
  //       expect(keyManager.setActiveItem).not.toHaveBeenCalledWith(0);
  //       expect(keyManager.setActiveItem).toHaveBeenCalledWith(2);
  //
  //       keyManager.onKeydown(fakeKeyEvents.downArrow);
  //       expect(keyManager.activeItemIndex)
  //         .withContext('Expected active item to be 0 after wrapping back to beginning.')
  //         .toBe(0);
  //       expect(keyManager.setActiveItem).toHaveBeenCalledWith(0);
  //     });
  //
  //     // This test should pass if all items are disabled and the down arrow key got pressed.
  //     // If the test setup crashes or this test times out, this test can be considered as failed.
  //     it('should not get into an infinite loop if all items are disabled', () => {
  //       keyManager.withWrap();
  //       keyManager.setActiveItem(0);
  //       const items = itemList.toArray();
  //       items.forEach(item => (item.disabled = true));
  //       itemList.reset(items);
  //
  //       keyManager.onKeydown(fakeKeyEvents.downArrow);
  //     });
  //
  //     it('should be able to disable wrapping', () => {
  //       keyManager.withWrap();
  //       keyManager.setFirstItemActive();
  //       keyManager.onKeydown(fakeKeyEvents.upArrow);
  //
  //       expect(keyManager.activeItemIndex).toBe(itemList.length - 1);
  //
  //       keyManager.withWrap(false);
  //       keyManager.setFirstItemActive();
  //       keyManager.onKeydown(fakeKeyEvents.upArrow);
  //
  //       expect(keyManager.activeItemIndex).toBe(0);
  //     });
  //   });
  //
  //   describe('skip predicate', () => {
  //     it('should skip disabled items by default', () => {
  //       const items = itemList.toArray();
  //       items[1].disabled = true;
  //       itemList.reset(items);
  //
  //       expect(keyManager.activeItemIndex).toBe(0);
  //
  //       keyManager.onKeydown(fakeKeyEvents.downArrow);
  //
  //       expect(keyManager.activeItemIndex).toBe(2);
  //     });
  //
  //     it('should be able to skip items with a custom predicate', () => {
  //       keyManager.skipPredicate(item => item.skipItem);
  //
  //       const items = itemList.toArray();
  //       items[1].skipItem = true;
  //       itemList.reset(items);
  //
  //       expect(keyManager.activeItemIndex).toBe(0);
  //
  //       keyManager.onKeydown(fakeKeyEvents.downArrow);
  //
  //       expect(keyManager.activeItemIndex).toBe(2);
  //     });
  //   });
  //
  //   describe('typeahead mode', () => {
  //     const debounceInterval = 300;
  //
  //     beforeEach(() => {
  //       keyManager.withTypeAhead(debounceInterval);
  //       keyManager.setActiveItem(-1);
  //     });
  //
  //     it('should throw if the items do not implement the getLabel method', () => {
  //       const invalidQueryList = new QueryList<any>();
  //       invalidQueryList.reset([{disabled: false}]);
  //
  //       const invalidManager = new ListKeyManager(
  //         invalidQueryList as QueryList<ListKeyManagerOption>,
  //       );
  //
  //       expect(() => invalidManager.withTypeAhead()).toThrowError(/must implement/);
  //     });
  //
  //     it('should debounce the input key presses', fakeAsync(() => {
  //       keyManager.onKeydown(createKeyboardEvent('keydown', 79, 'o')); // types "o"
  //       keyManager.onKeydown(createKeyboardEvent('keydown', 78, 'n')); // types "n"
  //       keyManager.onKeydown(createKeyboardEvent('keydown', 69, 'e')); // types "e"
  //
  //       expect(keyManager.activeItem).not.toBe(itemList.toArray()[0]);
  //
  //       tick(debounceInterval);
  //
  //       expect(keyManager.activeItem).toBe(itemList.toArray()[0]);
  //     }));
  //
  //     it('should focus the first item that starts with a letter', fakeAsync(() => {
  //       keyManager.onKeydown(createKeyboardEvent('keydown', 84, 't')); // types "t"
  //
  //       tick(debounceInterval);
  //
  //       expect(keyManager.activeItem).toBe(itemList.toArray()[1]);
  //     }));
  //
  //     it('should not move focus if a modifier, that is not allowed, is pressed', fakeAsync(() => {
  //       const tEvent = createKeyboardEvent('keydown', 84, 't', {control: true});
  //
  //       expect(keyManager.activeItem).toBeFalsy();
  //
  //       keyManager.onKeydown(tEvent); // types "t"
  //       tick(debounceInterval);
  //
  //       expect(keyManager.activeItem).toBeFalsy();
  //     }));
  //
  //     it('should always allow the shift key', fakeAsync(() => {
  //       const tEvent = createKeyboardEvent('keydown', 84, 't', {shift: true});
  //
  //       expect(keyManager.activeItem).toBeFalsy();
  //
  //       keyManager.onKeydown(tEvent); // types "t"
  //       tick(debounceInterval);
  //
  //       expect(keyManager.activeItem).toBeTruthy();
  //     }));
  //
  //     it('should focus the first item that starts with sequence of letters', fakeAsync(() => {
  //       keyManager.onKeydown(createKeyboardEvent('keydown', 84, 't')); // types "t"
  //       keyManager.onKeydown(createKeyboardEvent('keydown', 72, 'h')); // types "h"
  //
  //       tick(debounceInterval);
  //
  //       expect(keyManager.activeItem).toBe(itemList.toArray()[2]);
  //     }));
  //
  //     it('should cancel any pending timers if a navigation key is pressed', fakeAsync(() => {
  //       keyManager.onKeydown(createKeyboardEvent('keydown', 84, 't')); // types "t"
  //       keyManager.onKeydown(createKeyboardEvent('keydown', 72, 'h')); // types "h"
  //       keyManager.onKeydown(fakeKeyEvents.downArrow);
  //
  //       tick(debounceInterval);
  //
  //       expect(keyManager.activeItem).toBe(itemList.toArray()[0]);
  //     }));
  //
  //     it('should handle non-English input', fakeAsync(() => {
  //       itemList.reset([
  //         new FakeFocusable('едно'),
  //         new FakeFocusable('две'),
  //         new FakeFocusable('три'),
  //       ]);
  //
  //       const keyboardEvent = createKeyboardEvent('keydown', 68, 'д');
  //
  //       keyManager.onKeydown(keyboardEvent); // types "д"
  //       tick(debounceInterval);
  //
  //       expect(keyManager.activeItem).toBe(itemList.toArray()[1]);
  //     }));
  //
  //     it('should handle non-letter characters', fakeAsync(() => {
  //       itemList.reset([new FakeFocusable('[]'), new FakeFocusable('321'), new FakeFocusable('`!?')]);
  //
  //       keyManager.onKeydown(createKeyboardEvent('keydown', 192, '`')); // types "`"
  //       tick(debounceInterval);
  //       expect(keyManager.activeItem).toBe(itemList.toArray()[2]);
  //
  //       keyManager.onKeydown(createKeyboardEvent('keydown', 51, '3')); // types "3"
  //       tick(debounceInterval);
  //       expect(keyManager.activeItem).toBe(itemList.toArray()[1]);
  //
  //       keyManager.onKeydown(createKeyboardEvent('keydown', 219, '[')); // types "["
  //       tick(debounceInterval);
  //       expect(keyManager.activeItem).toBe(itemList.toArray()[0]);
  //     }));
  //
  //     it('should not focus disabled items', fakeAsync(() => {
  //       expect(keyManager.activeItem).toBeFalsy();
  //
  //       const items = itemList.toArray();
  //       items[0].disabled = true;
  //       itemList.reset(items);
  //
  //       keyManager.onKeydown(createKeyboardEvent('keydown', 79, 'o')); // types "o"
  //       tick(debounceInterval);
  //
  //       expect(keyManager.activeItem).toBeFalsy();
  //     }));
  //
  //     it('should start looking for matches after the active item', fakeAsync(() => {
  //       itemList.reset([
  //         new FakeFocusable('Bilbo'),
  //         new FakeFocusable('Frodo'),
  //         new FakeFocusable('Pippin'),
  //         new FakeFocusable('Boromir'),
  //         new FakeFocusable('Aragorn'),
  //       ]);
  //
  //       keyManager.setActiveItem(1);
  //       keyManager.onKeydown(createKeyboardEvent('keydown', 66, 'b'));
  //       tick(debounceInterval);
  //
  //       expect(keyManager.activeItem).toBe(itemList.toArray()[3]);
  //     }));
  //
  //     it('should wrap back around if there were no matches after the active item', fakeAsync(() => {
  //       itemList.reset([
  //         new FakeFocusable('Bilbo'),
  //         new FakeFocusable('Frodo'),
  //         new FakeFocusable('Pippin'),
  //         new FakeFocusable('Boromir'),
  //         new FakeFocusable('Aragorn'),
  //       ]);
  //
  //       keyManager.setActiveItem(3);
  //       keyManager.onKeydown(createKeyboardEvent('keydown', 66, 'b'));
  //       tick(debounceInterval);
  //
  //       expect(keyManager.activeItem).toBe(itemList.toArray()[0]);
  //     }));
  //
  //     it('should wrap back around if the last item is active', fakeAsync(() => {
  //       keyManager.setActiveItem(2);
  //       keyManager.onKeydown(createKeyboardEvent('keydown', 79, 'o'));
  //       tick(debounceInterval);
  //
  //       expect(keyManager.activeItem).toBe(itemList.toArray()[0]);
  //     }));
  //
  //     it('should be able to select the first item', fakeAsync(() => {
  //       keyManager.setActiveItem(-1);
  //       keyManager.onKeydown(createKeyboardEvent('keydown', 79, 'o'));
  //       tick(debounceInterval);
  //
  //       expect(keyManager.activeItem).toBe(itemList.toArray()[0]);
  //     }));
  //
  //     it('should not do anything if there is no match', fakeAsync(() => {
  //       keyManager.setActiveItem(1);
  //       keyManager.onKeydown(createKeyboardEvent('keydown', 87, 'w'));
  //       tick(debounceInterval);
  //
  //       expect(keyManager.activeItem).toBe(itemList.toArray()[1]);
  //     }));
  //
  //     it('should expose whether the user is currently typing', fakeAsync(() => {
  //       expect(keyManager.isTyping()).toBe(false);
  //
  //       keyManager.onKeydown(createKeyboardEvent('keydown', 79, 'o')); // types "o"
  //
  //       expect(keyManager.isTyping()).toBe(true);
  //
  //       tick(debounceInterval);
  //
  //       expect(keyManager.isTyping()).toBe(false);
  //     }));
  //   });
  //
  //   let keyManager: FocusKeyManager<FakeFocusable>;
  //
  //   beforeEach(() => {
  //     itemList.reset([new FakeFocusable(), new FakeFocusable(), new FakeFocusable()]);
  //     keyManager = new FocusKeyManager<FakeFocusable>(itemList);
  //
  //     // first item is already focused
  //     keyManager.setFirstItemActive();
  //
  //     spyOn(itemList.toArray()[0], 'focus');
  //     spyOn(itemList.toArray()[1], 'focus');
  //     spyOn(itemList.toArray()[2], 'focus');
  //   });
  //
  //   it('should focus subsequent items when down arrow is pressed', () => {
  //     keyManager.onKeydown(fakeKeyEvents.downArrow);
  //
  //     expect(itemList.toArray()[0].focus).not.toHaveBeenCalled();
  //     expect(itemList.toArray()[1].focus).toHaveBeenCalledTimes(1);
  //     expect(itemList.toArray()[2].focus).not.toHaveBeenCalled();
  //
  //     keyManager.onKeydown(fakeKeyEvents.downArrow);
  //     expect(itemList.toArray()[0].focus).not.toHaveBeenCalled();
  //     expect(itemList.toArray()[1].focus).toHaveBeenCalledTimes(1);
  //     expect(itemList.toArray()[2].focus).toHaveBeenCalledTimes(1);
  //   });
  //
  //   it('should focus previous items when up arrow is pressed', () => {
  //     keyManager.onKeydown(fakeKeyEvents.downArrow);
  //
  //     expect(itemList.toArray()[0].focus).not.toHaveBeenCalled();
  //     expect(itemList.toArray()[1].focus).toHaveBeenCalledTimes(1);
  //
  //     keyManager.onKeydown(fakeKeyEvents.upArrow);
  //
  //     expect(itemList.toArray()[0].focus).toHaveBeenCalledTimes(1);
  //     expect(itemList.toArray()[1].focus).toHaveBeenCalledTimes(1);
  //   });
  //
  //   it('should allow setting the focused item without calling focus', () => {
  //     expect(keyManager.activeItemIndex)
  //       .withContext(`Expected first item of the list to be active.`)
  //       .toBe(0);
  //
  //     keyManager.updateActiveItem(1);
  //     expect(keyManager.activeItemIndex)
  //       .withContext(`Expected activeItemIndex to update after calling updateActiveItem().`)
  //       .toBe(1);
  //     expect(itemList.toArray()[1].focus).not.toHaveBeenCalledTimes(1);
  //   });
  //
  //   it('should be able to set the focus origin', () => {
  //     keyManager.setFocusOrigin('mouse');
  //
  //     keyManager.onKeydown(fakeKeyEvents.downArrow);
  //     expect(itemList.toArray()[1].focus).toHaveBeenCalledWith('mouse');
  //
  //     keyManager.onKeydown(fakeKeyEvents.downArrow);
  //     expect(itemList.toArray()[2].focus).toHaveBeenCalledWith('mouse');
  //
  //     keyManager.setFocusOrigin('keyboard');
  //
  //     keyManager.onKeydown(fakeKeyEvents.upArrow);
  //     expect(itemList.toArray()[1].focus).toHaveBeenCalledWith('keyboard');
  //   });
});
