import {ChangeDetectionStrategy, Component, QueryList} from '@angular/core';
import {ArrayDataSource} from '@angular/cdk/collections';
import {coerceObservable} from '@angular/cdk/coercion/private';
import {FlatTreeControl, CdkTreeModule} from '@angular/cdk/tree';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {
  TREE_KEY_MANAGER,
  TreeKeyManagerFactory,
  TreeKeyManagerItem,
  TreeKeyManagerStrategy,
} from '@angular/cdk/a11y';
import {
  DOWN_ARROW,
  END,
  ENTER,
  H,
  HOME,
  J,
  K,
  L,
  LEFT_ARROW,
  RIGHT_ARROW,
  SPACE,
  TAB,
  UP_ARROW,
} from '@angular/cdk/keycodes';
import {Subject, isObservable, Observable} from 'rxjs';
import {take} from 'rxjs/operators';

const TREE_DATA: ExampleFlatNode[] = [
  {
    name: 'Fruit',
    expandable: true,
    level: 0,
  },
  {
    name: 'Apple',
    expandable: false,
    level: 1,
  },
  {
    name: 'Banana',
    expandable: false,
    level: 1,
  },
  {
    name: 'Fruit loops',
    expandable: false,
    level: 1,
  },
  {
    name: 'Vegetables',
    expandable: true,
    level: 0,
  },
  {
    name: 'Green',
    expandable: true,
    level: 1,
  },
  {
    name: 'Broccoli',
    expandable: false,
    level: 2,
  },
  {
    name: 'Brussels sprouts',
    expandable: false,
    level: 2,
  },
  {
    name: 'Orange',
    expandable: true,
    level: 1,
  },
  {
    name: 'Pumpkins',
    expandable: false,
    level: 2,
  },
  {
    name: 'Carrots',
    expandable: false,
    level: 2,
  },
];

/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
  isExpanded?: boolean;
}

/**
 * This class manages keyboard events for trees. If you pass it a QueryList or other list of tree
 * items, it will set the active item, focus, handle expansion and typeahead correctly when
 * keyboard events occur.
 */
export class VimTreeKeyManager<T extends TreeKeyManagerItem> implements TreeKeyManagerStrategy<T> {
  private _activeItemIndex = -1;
  private _activeItem: T | null = null;

  private _items: T[] = [];

  private _hasInitialFocused = false;

  private _initialFocus() {
    if (this._hasInitialFocused) {
      return;
    }

    if (!this._items.length) {
      return;
    }

    this._focusFirstItem();

    this._hasInitialFocused = true;
  }

  // TreeKeyManagerOptions not implemented.
  constructor(items: Observable<T[]> | QueryList<T> | T[]) {
    // We allow for the items to be an array or Observable because, in some cases, the consumer may
    // not have access to a QueryList of the items they want to manage (e.g. when the
    // items aren't being collected via `ViewChildren` or `ContentChildren`).
    if (items instanceof QueryList) {
      this._items = items.toArray();
      items.changes.subscribe((newItems: QueryList<T>) => {
        this._items = newItems.toArray();
        this._updateActiveItemIndex(this._items);
        this._initialFocus();
      });
    } else if (isObservable(items)) {
      items.subscribe(newItems => {
        this._items = newItems;
        this._updateActiveItemIndex(newItems);
        this._initialFocus();
      });
    } else {
      this._items = items;
      this._initialFocus();
    }
  }

  destroy() {
    this.change.complete();
  }

  /** Stream that emits any time the focused item changes. */
  readonly change = new Subject<T | null>();

  /**
   * Handles a keyboard event on the tree.
   * @param event Keyboard event that represents the user interaction with the tree.
   */
  onKeydown(event: KeyboardEvent) {
    const keyCode = event.keyCode;

    switch (keyCode) {
      case TAB:
        // Return early here, in order to allow Tab to actually tab out of the tree
        return;

      case DOWN_ARROW:
      case J:
        this._focusNextItem();
        break;

      case UP_ARROW:
      case K:
        this._focusPreviousItem();
        break;

      case RIGHT_ARROW:
      case L:
        this._expandCurrentItem();
        break;

      case LEFT_ARROW:
      case H:
        this._collapseCurrentItem();
        break;

      case HOME:
        this._focusFirstItem();
        break;

      case END:
        this._focusLastItem();
        break;

      case ENTER:
      case SPACE:
        this._activateCurrentItem();
        break;
    }
  }

  /** Index of the currently active item. */
  getActiveItemIndex(): number | null {
    return this._activeItemIndex;
  }

  /** The currently active item. */
  getActiveItem(): T | null {
    return this._activeItem;
  }

  /**
   * Focus the provided item by index.
   * @param index The index of the item to focus.
   * @param options Additional focusing options.
   */
  focusItem(index: number, options?: {emitChangeEvent?: boolean}): void;
  /**
   * Focus the provided item.
   * @param item The item to focus. Equality is determined via the trackBy function.
   * @param options Additional focusing options.
   */
  focusItem(item: T, options?: {emitChangeEvent?: boolean}): void;
  focusItem(itemOrIndex: number | T, options?: {emitChangeEvent?: boolean}): void;
  focusItem(itemOrIndex: number | T, options: {emitChangeEvent?: boolean} = {}) {
    // Set default options
    options.emitChangeEvent ??= true;

    let index =
      typeof itemOrIndex === 'number'
        ? itemOrIndex
        : this._items.findIndex(item => item === itemOrIndex);
    if (index < 0 || index >= this._items.length) {
      return;
    }
    const activeItem = this._items[index];

    // If we're just setting the same item, don't re-call activate or focus
    if (this._activeItem !== null && activeItem === this._activeItem) {
      return;
    }

    this._activeItem = activeItem ?? null;
    this._activeItemIndex = index;

    if (options.emitChangeEvent) {
      // Emit to `change` stream as required by TreeKeyManagerStrategy interface.
      this.change.next(this._activeItem);
    }
    this._activeItem?.focus();
    this._activateCurrentItem();
  }

  private _updateActiveItemIndex(newItems: T[]) {
    const activeItem = this._activeItem;
    if (activeItem) {
      const newIndex = newItems.findIndex(item => item === activeItem);

      if (newIndex > -1 && newIndex !== this._activeItemIndex) {
        this._activeItemIndex = newIndex;
      }
    }
  }

  /** Focus the first available item. */
  private _focusFirstItem(): void {
    this.focusItem(this._findNextAvailableItemIndex(-1));
  }

  /** Focus the last available item. */
  private _focusLastItem(): void {
    this.focusItem(this._findPreviousAvailableItemIndex(this._items.length));
  }

  /** Focus the next available item. */
  private _focusNextItem(): void {
    this.focusItem(this._findNextAvailableItemIndex(this._activeItemIndex));
  }

  /** Focus the previous available item. */
  private _focusPreviousItem(): void {
    this.focusItem(this._findPreviousAvailableItemIndex(this._activeItemIndex));
  }

  //// Navigational methods
  private _findNextAvailableItemIndex(startingIndex: number) {
    if (startingIndex + 1 < this._items.length) {
      return startingIndex + 1;
    }
    return startingIndex;
  }

  private _findPreviousAvailableItemIndex(startingIndex: number) {
    if (startingIndex - 1 >= 0) {
      return startingIndex - 1;
    }
    return startingIndex;
  }

  /**
   * If the item is already expanded, we collapse the item. Otherwise, we will focus the parent.
   */
  private _collapseCurrentItem() {
    if (!this._activeItem) {
      return;
    }

    if (this._isCurrentItemExpanded()) {
      this._activeItem.collapse();
    } else {
      const parent = this._activeItem.getParent();
      if (!parent) {
        return;
      }
      this.focusItem(parent as T);
    }
  }

  /**
   * If the item is already collapsed, we expand the item. Otherwise, we will focus the first child.
   */
  private _expandCurrentItem() {
    if (!this._activeItem) {
      return;
    }

    if (!this._isCurrentItemExpanded()) {
      this._activeItem.expand();
    } else {
      coerceObservable(this._activeItem.getChildren())
        .pipe(take(1))
        .subscribe(children => {
          const firstChild = children[0];
          if (!firstChild) {
            return;
          }
          this.focusItem(firstChild as T);
        });
    }
  }

  private _isCurrentItemExpanded() {
    if (!this._activeItem) {
      return false;
    }
    return typeof this._activeItem.isExpanded === 'boolean'
      ? this._activeItem.isExpanded
      : this._activeItem.isExpanded();
  }

  private _activateCurrentItem() {
    this._activeItem?.activate();
  }
}

function VimTreeKeyManagerFactory<T extends TreeKeyManagerItem>(): TreeKeyManagerFactory<T> {
  return items => new VimTreeKeyManager(items);
}

const VIM_TREE_KEY_MANAGER_PROVIDER = {
  provide: TREE_KEY_MANAGER,
  useFactory: VimTreeKeyManagerFactory,
};

/**
 * @title Tree with vim keyboard commands.
 */
@Component({
  selector: 'cdk-tree-custom-key-manager-example',
  templateUrl: 'cdk-tree-custom-key-manager-example.html',
  styleUrls: ['cdk-tree-custom-key-manager-example.css'],
  imports: [CdkTreeModule, MatButtonModule, MatIconModule],
  providers: [VIM_TREE_KEY_MANAGER_PROVIDER],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkTreeCustomKeyManagerExample {
  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level,
    node => node.expandable,
  );

  dataSource = new ArrayDataSource(TREE_DATA);

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  getParentNode(node: ExampleFlatNode) {
    const nodeIndex = TREE_DATA.indexOf(node);

    for (let i = nodeIndex - 1; i >= 0; i--) {
      if (TREE_DATA[i].level === node.level - 1) {
        return TREE_DATA[i];
      }
    }

    return null;
  }

  shouldRender(node: ExampleFlatNode) {
    let parent = this.getParentNode(node);
    while (parent) {
      if (!parent.isExpanded) {
        return false;
      }
      parent = this.getParentNode(parent);
    }
    return true;
  }
}
