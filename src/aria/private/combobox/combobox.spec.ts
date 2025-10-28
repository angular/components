/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, WritableSignal} from '@angular/core';
import {ComboboxInputs, ComboboxPattern} from './combobox';
import {OptionPattern} from '../listbox/option';
import {ComboboxListboxPattern} from '../listbox/combobox-listbox';
import {createKeyboardEvent} from '@angular/cdk/testing/private';
import {SignalLike} from '../behaviors/signal-like/signal-like';
import {ModifierKeys} from '@angular/cdk/testing';
import {TreeItemPattern} from '../tree/tree';
import {ComboboxTreePattern} from '../tree/combobox-tree';

// Test types
type TestOption = OptionPattern<string> & {
  disabled: WritableSignal<boolean>;
};

type TestInputs = {
  readonly [K in keyof ComboboxInputs<TestOption, string>]: WritableSignal<
    ComboboxInputs<TestOption, string>[K] extends SignalLike<infer T> ? T : never
  >;
};

type TreeItemData = {value: string; children?: TreeItemData[]};

// Keyboard event helpers
const up = () => createKeyboardEvent('keydown', 38, 'ArrowUp');
const down = () => createKeyboardEvent('keydown', 40, 'ArrowDown');
const home = () => createKeyboardEvent('keydown', 36, 'Home');
const end = () => createKeyboardEvent('keydown', 35, 'End');
const enter = () => createKeyboardEvent('keydown', 13, 'Enter');
const escape = () => createKeyboardEvent('keydown', 27, 'Escape');
const right = () => createKeyboardEvent('keydown', 39, 'ArrowRight');
const left = () => createKeyboardEvent('keydown', 37, 'ArrowLeft');

function clickOption(options: OptionPattern<any>[], index: number, mods?: ModifierKeys) {
  return {
    target: options[index].element(),
    shiftKey: mods?.shift,
    ctrlKey: mods?.control,
  } as unknown as PointerEvent;
}

function clickTreeItem(items: TreeItemPattern<any>[], index: number, mods?: ModifierKeys) {
  return {
    target: items[index].element(),
    shiftKey: mods?.shift,
    ctrlKey: mods?.control,
  } as unknown as PointerEvent;
}

function clickInput(inputEl: HTMLInputElement) {
  return {target: inputEl} as unknown as PointerEvent;
}

function _type(
  text: string,
  inputEl: HTMLInputElement,
  combobox: ComboboxPattern<any, string>,
  allOptions: TestOption[] | TreeItemPattern<string>[],
  popup: ComboboxListboxPattern<string> | ComboboxTreePattern<string>,
  firstMatch: WritableSignal<string | undefined>,
  backspace = false,
) {
  combobox.onFocusIn();
  inputEl.value = text;
  combobox.onInput(
    backspace
      ? new InputEvent('input', {inputType: 'deleteContentBackward'})
      : new InputEvent('input'),
  );
  const options = allOptions.filter(o => o.searchTerm().startsWith(text));
  if (popup instanceof ComboboxListboxPattern) {
    (popup.inputs.items as WritableSignal<any[]>).set(options);
  } else if (popup instanceof ComboboxTreePattern) {
    (popup.inputs.allItems as WritableSignal<any[]>).set(options);
  }
  firstMatch.set(options[0]?.value());
  combobox.onFilter();
}

function getComboboxPattern(
  inputs: Partial<{
    [K in keyof TestInputs]: TestInputs[K] extends WritableSignal<infer T> ? T : never;
  }> = {},
) {
  const containerEl = signal(document.createElement('div'));
  const inputEl = signal(document.createElement('input'));
  containerEl()?.appendChild(inputEl()!);
  const firstMatch = signal<string | undefined>(undefined);
  const inputValue = signal('');

  const combobox = new ComboboxPattern<any, string>({
    disabled: signal(inputs.disabled ?? false),
    readonly: signal(inputs.readonly ?? false),
    textDirection: signal(inputs.textDirection ?? 'ltr'),
    popupControls: signal(undefined), // will be set later
    inputEl,
    containerEl,
    filterMode: signal(inputs.filterMode ?? 'manual'),
    firstMatch,
    inputValue,
  });

  return {combobox, inputEl, containerEl, firstMatch, inputValue};
}

function getListboxPattern(
  combobox: ComboboxPattern<TestOption, string>,
  values: string[],
  initialValue?: string,
) {
  const options = signal<TestOption[]>([]);

  const listbox = new ComboboxListboxPattern<string>({
    id: signal('listbox-1'),
    items: options,
    value: signal(initialValue ? [initialValue] : []),
    combobox: signal(combobox) as any,
    activeItem: signal(undefined),
    typeaheadDelay: signal(0.5),
    wrap: signal(true),
    readonly: signal(false),
    disabled: signal(false),
    softDisabled: signal(false),
    multi: signal(false),
    focusMode: signal('activedescendant'),
    textDirection: signal('ltr'),
    orientation: signal('vertical'),
    selectionMode: signal('explicit'),
    element: signal(document.createElement('div')),
  });

  options.set(
    values.map((v, index) => {
      const element = document.createElement('div');
      element.role = 'option';
      return new OptionPattern({
        value: signal(v),
        id: signal(`option-${index}`),
        disabled: signal(false),
        searchTerm: signal(v),
        listbox: signal(listbox),
        element: signal(element),
      }) as TestOption;
    }),
  );

  return {listbox, options};
}

function getTreePattern(
  combobox: ComboboxPattern<TreeItemPattern<string>, string>,
  data: TreeItemData[],
  initialValue?: string,
) {
  const items = signal<TreeItemPattern<string>[]>([]);

  const tree = new ComboboxTreePattern<string>({
    id: signal('tree-1'),
    allItems: items,
    value: signal(initialValue ? [initialValue] : []),
    combobox: signal(combobox) as any,
    activeItem: signal(undefined),
    typeaheadDelay: signal(0.5),
    wrap: signal(true),
    disabled: signal(false),
    softDisabled: signal(false),
    multi: signal(false),
    focusMode: signal('activedescendant'),
    textDirection: signal('ltr'),
    orientation: signal('vertical'),
    selectionMode: signal('explicit'),
    element: signal(document.createElement('div')),
    nav: signal(false),
    currentType: signal('false'),
  });

  // Recursive function to create tree items
  function createTreeItems(
    data: TreeItemData[],
    parent: TreeItemPattern<string> | ComboboxTreePattern<string>,
  ) {
    return data.map((node, index) => {
      const element = document.createElement('div');
      element.role = 'treeitem';
      const treeItem = new TreeItemPattern<string>({
        value: signal(node.value),
        id: signal('tree-item-' + tree.allItems().length),
        disabled: signal(false),
        selectable: signal(true),
        searchTerm: signal(node.value),
        tree: signal(tree),
        parent: signal(parent),
        element: signal(element),
        hasChildren: signal(!!node.children),
        children: signal([]),
      });

      (tree.allItems as WritableSignal<TreeItemPattern<string>[]>).update(items =>
        items.concat(treeItem),
      );

      if (node.children) {
        const children = createTreeItems(node.children, treeItem);
        (treeItem.children as WritableSignal<TreeItemPattern<string>[]>).set(children);
      }

      return treeItem;
    });
  }

  createTreeItems(data, tree);
  return {tree, items};
}

describe('Combobox with Listbox Pattern', () => {
  function getPatterns(
    inputs: Partial<{
      [K in keyof TestInputs]: TestInputs[K] extends WritableSignal<infer T> ? T : never;
    }> = {},
  ) {
    const {combobox, inputEl, containerEl, firstMatch, inputValue} = getComboboxPattern(inputs);
    const {listbox, options} = getListboxPattern(combobox, [
      'Apple',
      'Apricot',
      'Banana',
      'Blackberry',
      'Blueberry',
      'Cantaloupe',
      'Cherry',
      'Clementine',
      'Cranberry',
    ]);

    (combobox.inputs.popupControls as WritableSignal<any>).set(listbox);

    return {
      combobox,
      listbox,
      options,
      inputEl: inputEl()!,
      containerEl: containerEl()!,
      firstMatch,
      inputValue,
    };
  }

  describe('Navigation', () => {
    it('should navigate to the first item on ArrowDown', () => {
      const {combobox, listbox} = getPatterns();
      combobox.onKeydown(down());
      expect(listbox.inputs.activeItem()).toBe(listbox.inputs.items()[0]);
    });

    it('should navigate to the last item on ArrowUp', () => {
      const {combobox, listbox} = getPatterns();
      combobox.onKeydown(up());
      expect(listbox.inputs.activeItem()).toBe(listbox.inputs.items()[8]);
    });

    it('should navigate to the next item on ArrowDown when open', () => {
      const {combobox, listbox} = getPatterns();
      combobox.onKeydown(down());
      combobox.onKeydown(down());
      expect(listbox.inputs.activeItem()).toBe(listbox.inputs.items()[1]);
    });

    it('should navigate to the previous item on ArrowUp when open', () => {
      const {combobox, listbox} = getPatterns();
      combobox.onKeydown(up());
      combobox.onKeydown(up());
      expect(listbox.inputs.activeItem()).toBe(listbox.inputs.items()[7]);
    });

    it('should navigate to the first item on Home when open', () => {
      const {combobox, listbox} = getPatterns();
      combobox.onKeydown(up());
      combobox.onKeydown(home());
      expect(listbox.inputs.activeItem()).toBe(listbox.inputs.items()[0]);
    });

    it('should navigate to the last item on End when open', () => {
      const {combobox, listbox} = getPatterns();
      combobox.onKeydown(down());
      combobox.onKeydown(end());
      expect(listbox.inputs.activeItem()).toBe(listbox.inputs.items()[8]);
    });
  });

  describe('Expansion', () => {
    it('should open on click', () => {
      const {combobox, inputEl} = getPatterns();
      expect(combobox.expanded()).toBe(false);
      combobox.onPointerup(clickInput(inputEl));
      expect(combobox.expanded()).toBe(true);
    });

    it('should open on ArrowDown', () => {
      const {combobox} = getPatterns();
      expect(combobox.expanded()).toBe(false);
      combobox.onKeydown(down());
      expect(combobox.expanded()).toBe(true);
    });

    it('should open on ArrowUp', () => {
      const {combobox} = getPatterns();
      expect(combobox.expanded()).toBe(false);
      combobox.onKeydown(up());
      expect(combobox.expanded()).toBe(true);
    });

    it('should close on Escape', () => {
      const {combobox} = getPatterns();
      combobox.onKeydown(down());
      expect(combobox.expanded()).toBe(true);
      combobox.onKeydown(escape());
      expect(combobox.expanded()).toBe(false);
    });

    it('should close on Enter', () => {
      const {combobox} = getPatterns();
      combobox.onKeydown(down());
      expect(combobox.expanded()).toBe(true);
      combobox.onKeydown(enter());
      expect(combobox.expanded()).toBe(false);
    });

    it('should close on focusout', () => {
      const {combobox} = getPatterns();
      combobox.onKeydown(down());
      expect(combobox.expanded()).toBe(true);
      combobox.onFocusOut(new FocusEvent('focusout'));
      expect(combobox.expanded()).toBe(false);
    });

    it('should not close on focusout if focus moves to an element inside the container', () => {
      const {combobox, containerEl} = getPatterns();
      const internalElement = document.createElement('div');
      containerEl.appendChild(internalElement);
      combobox.onKeydown(down());

      expect(combobox.expanded()).toBe(true);

      const event = new FocusEvent('focusout', {relatedTarget: internalElement});
      combobox.onFocusOut(event);

      expect(combobox.expanded()).toBe(true);
    });

    it('should not expand when disabled', () => {
      const {combobox, inputEl} = getPatterns({disabled: true});
      expect(combobox.expanded()).toBe(false);
      combobox.onPointerup(clickInput(inputEl));
      expect(combobox.expanded()).toBe(false);
    });
  });

  describe('Selection', () => {
    let combobox: ComboboxPattern<any, string>;
    let listbox: ComboboxListboxPattern<string>;
    let inputEl: HTMLInputElement;
    let options: () => TestOption[];
    let firstMatch: WritableSignal<string | undefined>;

    function type(text: string, opts: {backspace?: boolean} = {}) {
      _type(text, inputEl, combobox, options(), listbox, firstMatch, opts.backspace);
    }

    describe('when filterMode is "manual"', () => {
      beforeEach(() => {
        ({combobox, listbox, inputEl, options, firstMatch} = getPatterns({
          filterMode: 'manual',
        }));
      });

      it('should select and commit on click', () => {
        combobox.onPointerup(clickOption(listbox.inputs.items(), 0));
        expect(listbox.getSelectedItem()).toBe(listbox.inputs.items()[0]);
        expect(listbox.inputs.value()).toEqual(['Apple']);
        expect(inputEl.value).toBe('Apple');
      });

      it('should select and commit to input on Enter', () => {
        combobox.onKeydown(down());
        combobox.onKeydown(enter());
        expect(listbox.getSelectedItem()).toBe(listbox.inputs.items()[0]);
        expect(listbox.inputs.value()).toEqual(['Apple']);
        expect(inputEl.value).toBe('Apple');
      });

      it('should select on focusout if the input text exactly matches an item', () => {
        type('Apple');
        combobox.onFocusOut(new FocusEvent('focusout'));
        expect(listbox.getSelectedItem()).toBe(listbox.inputs.items()[0]);
        expect(listbox.inputs.value()).toEqual(['Apple']);
      });

      it('should deselect on backspace', () => {
        combobox.onKeydown(down());
        combobox.onKeydown(enter());

        type('Appl', {backspace: true});
        combobox.onInput(new InputEvent('input', {inputType: 'deleteContentBackward'}));

        expect(listbox.getSelectedItem()).toBe(undefined);
        expect(listbox.inputs.value()).toEqual([]);
      });

      it('should not select on navigation', () => {
        combobox.onKeydown(down());
        expect(listbox.getSelectedItem()).toBe(undefined);
        expect(listbox.inputs.value()).toEqual([]);
      });

      it('should not select on input', () => {
        type('A');
        expect(listbox.getSelectedItem()).toBe(undefined);
        expect(listbox.inputs.value()).toEqual([]);
      });

      it('should not select on focusout if the input text does not match an item', () => {
        type('Appl');
        combobox.onFocusOut(new FocusEvent('focusout'));
        expect(listbox.getSelectedItem()).toBe(undefined);
        expect(listbox.inputs.value()).toEqual([]);
        expect(inputEl.value).toBe('Appl');
      });
    });

    describe('when filterMode is "auto-select"', () => {
      beforeEach(() => {
        ({combobox, listbox, inputEl, options, firstMatch} = getPatterns({
          filterMode: 'auto-select',
        }));
      });

      it('should select and commit on click', () => {
        combobox.onPointerup(clickOption(listbox.inputs.items(), 3));
        expect(listbox.getSelectedItem()).toBe(listbox.inputs.items()[3]);
        expect(listbox.inputs.value()).toEqual(['Blackberry']);
        expect(inputEl.value).toBe('Blackberry');
      });

      it('should select and commit on Enter', () => {
        combobox.onKeydown(down());
        combobox.onKeydown(down());
        combobox.onKeydown(down());
        combobox.onKeydown(enter());
        expect(listbox.getSelectedItem()).toBe(listbox.inputs.items()[2]);
        expect(listbox.inputs.value()).toEqual(['Banana']);
        expect(inputEl.value).toBe('Banana');
      });

      it('should select the first item on arrow down when collapsed', () => {
        combobox.onKeydown(down());
        expect(listbox.getSelectedItem()).toBe(listbox.inputs.items()[0]);
        expect(listbox.inputs.value()).toEqual(['Apple']);
      });

      it('should select the last item on arrow up when collapsed', () => {
        combobox.onKeydown(up());
        expect(listbox.getSelectedItem()).toBe(
          listbox.inputs.items()[listbox.inputs.items().length - 1],
        );
        expect(listbox.inputs.value()).toEqual(['Cranberry']);
      });

      it('should select on navigation', () => {
        combobox.onKeydown(down());
        combobox.onKeydown(down());
        expect(listbox.getSelectedItem()).toBe(listbox.inputs.items()[1]);
        expect(listbox.inputs.value()).toEqual(['Apricot']);
      });

      it('should select the first option on input', () => {
        type('A');
        expect(listbox.inputs.value()).toEqual(['Apple']);

        type('Apr');
        expect(listbox.inputs.value()).toEqual(['Apricot']);
      });

      it('should commit the selected option on focusout', () => {
        combobox.onKeydown(down());
        type('App');
        combobox.onFocusOut(new FocusEvent('focusout'));
        expect(inputEl.value).toBe('Apple');
      });
    });

    describe('when filterMode is "highlight"', () => {
      beforeEach(() => {
        ({combobox, listbox, inputEl, options, firstMatch} = getPatterns({
          filterMode: 'highlight',
        }));
      });

      it('should select and commit on click', () => {
        combobox.onPointerup(clickOption(listbox.inputs.items(), 3));
        expect(listbox.getSelectedItem()).toBe(listbox.inputs.items()[3]);
        expect(listbox.inputs.value()).toEqual(['Blackberry']);
        expect(inputEl.value).toBe('Blackberry');
      });

      it('should select and commit on Enter', () => {
        combobox.onKeydown(down());
        combobox.onKeydown(down());
        combobox.onKeydown(down());
        combobox.onKeydown(enter());
        expect(listbox.getSelectedItem()).toBe(listbox.inputs.items()[2]);
        expect(listbox.inputs.value()).toEqual(['Banana']);
        expect(inputEl.value).toBe('Banana');
      });

      it('should select the first item on arrow down when collapsed', () => {
        combobox.onKeydown(down());
        expect(listbox.getSelectedItem()).toBe(listbox.inputs.items()[0]);
        expect(listbox.inputs.value()).toEqual(['Apple']);
      });

      it('should select the last item on arrow up when collapsed', () => {
        combobox.onKeydown(up());
        expect(listbox.getSelectedItem()).toBe(
          listbox.inputs.items()[listbox.inputs.items().length - 1],
        );
        expect(listbox.inputs.value()).toEqual(['Cranberry']);
      });

      it('should select on navigation', () => {
        combobox.onKeydown(down());
        combobox.onKeydown(down());
        expect(listbox.getSelectedItem()).toBe(listbox.inputs.items()[1]);
        expect(listbox.inputs.value()).toEqual(['Apricot']);
      });

      it('should select the first option on input', () => {
        type('A');
        expect(listbox.inputs.value()).toEqual(['Apple']);

        type('Apr');
        expect(listbox.inputs.value()).toEqual(['Apricot']);
      });

      it('should commit the selected option on navigation', () => {
        combobox.onKeydown(down());
        expect(inputEl.value).toBe('Apple');
        combobox.onKeydown(down());
        expect(inputEl.value).toBe('Apricot');
      });

      it('should commit the selected option on focusout', () => {
        combobox.onKeydown(down());
        type('App');
        combobox.onFocusOut(new FocusEvent('focusout'));
        expect(inputEl.value).toBe('Apple');
      });

      it('should insert a highlighted completion string on input', () => {
        type('A');
        expect(inputEl.value).toBe('Apple');
        expect(inputEl.selectionStart).toBe(1);
        expect(inputEl.selectionEnd).toBe(5);
      });

      it('should should remember which option was highlighted after navigating', () => {
        type('A');
        combobox.onKeydown(down());

        expect(inputEl.value).toBe('Apricot');
        expect(inputEl.selectionStart).toBe(7);
        expect(inputEl.selectionEnd).toBe(7);

        combobox.onKeydown(up());

        expect(inputEl.value).toBe('Apple');
        expect(inputEl.selectionStart).toBe(1);
        expect(inputEl.selectionEnd).toBe(5);
      });
    });
  });

  describe('Readonly mode', () => {
    it('should select and close on selection', () => {
      const {combobox, listbox, inputEl} = getPatterns({readonly: true});
      combobox.onPointerup(clickOption(listbox.inputs.items(), 2));
      expect(listbox.getSelectedItem()).toBe(listbox.inputs.items()[2]);
      expect(listbox.inputs.value()).toEqual(['Banana']);
      expect(inputEl.value).toBe('Banana');
      expect(combobox.expanded()).toBe(false);
    });

    it('should close on escape', () => {
      const {combobox} = getPatterns({readonly: true});
      combobox.onKeydown(down());
      expect(combobox.expanded()).toBe(true);
      combobox.onKeydown(escape());
      expect(combobox.expanded()).toBe(false);
    });

    it('should clear selection on escape when already closed', () => {
      const {combobox, listbox} = getPatterns({readonly: true});
      combobox.onPointerup(clickOption(listbox.inputs.items(), 2));
      expect(listbox.getSelectedItem()).toBe(listbox.inputs.items()[2]);
      expect(listbox.inputs.value()).toEqual(['Banana']);
      combobox.onKeydown(escape());
      expect(listbox.getSelectedItem()).toBe(undefined);
      expect(listbox.inputs.value()).toEqual([]);
    });
  });
});

describe('Combobox with Tree Pattern', () => {
  function getPatterns(
    inputs: Partial<{
      [K in keyof TestInputs]: TestInputs[K] extends WritableSignal<infer T> ? T : never;
    }> = {},
  ) {
    const {combobox, inputEl, containerEl, firstMatch, inputValue} = getComboboxPattern(inputs);
    const {tree, items} = getTreePattern(combobox, [
      {value: 'Fruit', children: [{value: 'Apple'}, {value: 'Banana'}, {value: 'Cantaloupe'}]},
      {value: 'Vegetables', children: [{value: 'Broccoli'}, {value: 'Carrot'}, {value: 'Lettuce'}]},
      {value: 'Grains', children: [{value: 'Rice'}, {value: 'Wheat'}]},
    ]);

    (combobox.inputs.popupControls as WritableSignal<any>).set(tree);

    return {
      combobox,
      tree,
      items: items,
      inputEl: inputEl()!,
      containerEl: containerEl()!,
      firstMatch,
      inputValue,
    };
  }

  describe('Navigation', () => {
    it('should navigate to the first focusable item on ArrowDown', () => {
      const {combobox, tree} = getPatterns();
      combobox.onKeydown(down());
      expect(tree.inputs.activeItem()?.searchTerm()).toBe('Fruit');
    });

    it('should navigate to the last focusable item on ArrowUp', () => {
      const {combobox, tree} = getPatterns();
      combobox.onKeydown(up());
      expect(tree.inputs.activeItem()?.searchTerm()).toBe('Grains');
    });

    it('should navigate to the next focusable item on ArrowDown when open', () => {
      const {combobox, tree} = getPatterns();
      combobox.onKeydown(down());
      combobox.onKeydown(down());
      expect(tree.inputs.activeItem()?.searchTerm()).toBe('Vegetables');
    });

    it('should navigate to the previous item on ArrowUp when open', () => {
      const {combobox, tree} = getPatterns();
      combobox.onKeydown(up());
      combobox.onKeydown(up());
      expect(tree.inputs.activeItem()?.searchTerm()).toBe('Vegetables');
    });

    it('should expand a closed node on ArrowRight', () => {
      const {combobox, tree} = getPatterns();
      const before = tree.visibleItems().map(i => i.searchTerm());
      expect(before).toEqual(['Fruit', 'Vegetables', 'Grains']);
      combobox.onKeydown(down());
      combobox.onKeydown(right());
      const after = tree.visibleItems().map(i => i.searchTerm());
      expect(after).toEqual(['Fruit', 'Apple', 'Banana', 'Cantaloupe', 'Vegetables', 'Grains']);
    });

    it('should navigate to the next item on ArrowRight when already expanded', () => {
      const {combobox, tree} = getPatterns();
      combobox.onKeydown(down());
      combobox.onKeydown(right());
      combobox.onKeydown(right());
      expect(tree.inputs.activeItem()?.searchTerm()).toBe('Apple');
    });

    it('should collapse an open node on ArrowLeft', () => {
      const {combobox, tree} = getPatterns();
      combobox.onKeydown(down());
      combobox.onKeydown(right());
      combobox.onKeydown(left());
      const after = tree.visibleItems().map(i => i.searchTerm());
      expect(after).toEqual(['Fruit', 'Vegetables', 'Grains']);
      expect(tree.inputs.activeItem()?.searchTerm()).toBe('Fruit');
    });

    it('should navigate to the parent node on ArrowLeft when in a child node', () => {
      const {combobox, tree} = getPatterns();
      combobox.onKeydown(down());
      combobox.onKeydown(right());
      combobox.onKeydown(right());
      expect(tree.inputs.activeItem()?.searchTerm()).toBe('Apple');
      combobox.onKeydown(left());
      expect(tree.inputs.activeItem()?.searchTerm()).toBe('Fruit');
    });

    it('should navigate to the first focusable item on Home when open', () => {
      const {combobox, tree} = getPatterns();
      combobox.onKeydown(up());
      combobox.onKeydown(home());
      expect(tree.inputs.activeItem()?.searchTerm()).toBe('Fruit');
    });

    it('should navigate to the last focusable item on End when open', () => {
      const {combobox, tree} = getPatterns();
      combobox.onKeydown(down());
      combobox.onKeydown(end());
      expect(tree.inputs.activeItem()?.searchTerm()).toBe('Grains');
    });
  });

  describe('Selection', () => {
    let combobox: ComboboxPattern<any, string>;
    let tree: ComboboxTreePattern<string>;
    let inputEl: HTMLInputElement;
    let items: () => TreeItemPattern<string>[];
    let firstMatch: WritableSignal<string | undefined>;

    function type(text: string, opts: {backspace?: boolean} = {}) {
      _type(text, inputEl, combobox, items(), tree, firstMatch, opts.backspace);
    }

    describe('when filterMode is "manual"', () => {
      beforeEach(() => {
        ({combobox, tree, inputEl, items, firstMatch} = getPatterns({
          filterMode: 'manual',
        }));
      });

      it('should select and commit on click', () => {
        combobox.onPointerup(clickTreeItem(tree.inputs.allItems(), 0));
        expect(tree.inputs.value()).toEqual(['Fruit']);
        expect(inputEl.value).toBe('Fruit');
      });

      it('should select and commit to input on Enter', () => {
        combobox.onKeydown(down());
        combobox.onKeydown(enter());
        expect(tree.getSelectedItem()).toBe(tree.inputs.allItems()[0]);
        expect(tree.inputs.value()).toEqual(['Fruit']);
        expect(inputEl.value).toBe('Fruit');
      });

      it('should select on focusout if the input text exactly matches an item', () => {
        combobox.onPointerup(clickInput(inputEl));
        type('Apple');
        combobox.onFocusOut(new FocusEvent('focusout'));
        expect(tree.inputs.value()).toEqual(['Apple']);
      });

      it('should deselect on backspace', () => {
        combobox.onKeydown(down());
        combobox.onKeydown(enter());

        type('Appl', {backspace: true});

        expect(tree.getSelectedItem()).toBe(undefined);
        expect(tree.inputs.value()).toEqual([]);
      });

      it('should not select on navigation', () => {
        combobox.onKeydown(down());
        expect(tree.getSelectedItem()).toBe(undefined);
        expect(tree.inputs.value()).toEqual([]);
      });

      it('should not select on input', () => {
        type('A');
        expect(tree.getSelectedItem()).toBe(undefined);
        expect(tree.inputs.value()).toEqual([]);
      });

      it('should not select on focusout if the input text does not match an item', () => {
        type('Appl');
        combobox.onFocusOut(new FocusEvent('focusout'));
        expect(tree.getSelectedItem()).toBe(undefined);
        expect(tree.inputs.value()).toEqual([]);
        expect(inputEl.value).toBe('Appl');
      });
    });

    describe('when filterMode is "auto-select"', () => {
      beforeEach(() => {
        ({combobox, tree, inputEl, items, firstMatch} = getPatterns({
          filterMode: 'auto-select',
        }));
      });

      it('should select and commit on click', () => {
        combobox.onPointerup(clickTreeItem(tree.inputs.allItems(), 2));
        expect(tree.getSelectedItem()).toBe(tree.inputs.allItems()[2]);
        expect(tree.inputs.value()).toEqual(['Banana']);
        expect(inputEl.value).toBe('Banana');
      });

      it('should select and commit on Enter', () => {
        combobox.onKeydown(down());
        combobox.onKeydown(down());
        combobox.onKeydown(down());
        combobox.onKeydown(enter());
        expect(tree.inputs.value()).toEqual(['Grains']);
        expect(inputEl.value).toBe('Grains');
      });

      it('should select the first item on arrow down when collapsed', () => {
        combobox.onKeydown(down());
        expect(tree.getSelectedItem()).toBe(tree.inputs.allItems()[0]);
        expect(tree.inputs.value()).toEqual(['Fruit']);
      });

      it('should select the last focusable item on arrow up when collapsed', () => {
        combobox.onKeydown(up());
        expect(tree.inputs.value()).toEqual(['Grains']);
      });

      it('should select on navigation', () => {
        combobox.onKeydown(down());
        combobox.onKeydown(right());
        combobox.onKeydown(right());
        expect(tree.inputs.value()).toEqual(['Apple']);
      });

      it('should select the first option on input', () => {
        type('B');
        expect(tree.inputs.value()).toEqual(['Banana']);

        type('Bro');
        expect(tree.inputs.value()).toEqual(['Broccoli']);
      });

      it('should commit the selected option on focusout', () => {
        combobox.onKeydown(down());
        type('App');
        combobox.onFocusOut(new FocusEvent('focusout'));
        expect(inputEl.value).toBe('Apple');
      });
    });

    describe('when filterMode is "highlight"', () => {
      beforeEach(() => {
        ({combobox, tree, inputEl, items, firstMatch} = getPatterns({
          filterMode: 'highlight',
        }));
      });

      it('should select and commit on click', () => {
        combobox.onPointerup(clickTreeItem(tree.inputs.allItems(), 2));
        expect(tree.getSelectedItem()).toBe(tree.inputs.allItems()[2]);
        expect(tree.inputs.value()).toEqual(['Banana']);
        expect(inputEl.value).toBe('Banana');
      });

      it('should select and commit on Enter', () => {
        combobox.onKeydown(down());
        combobox.onKeydown(down());
        combobox.onKeydown(down());
        combobox.onKeydown(enter());
        expect(tree.inputs.value()).toEqual(['Grains']);
        expect(inputEl.value).toBe('Grains');
      });

      it('should select the first item on arrow down when collapsed', () => {
        combobox.onKeydown(down());
        expect(tree.getSelectedItem()).toBe(tree.inputs.allItems()[0]);
        expect(tree.inputs.value()).toEqual(['Fruit']);
      });

      it('should select the last focusable item on arrow up when collapsed', () => {
        combobox.onKeydown(up());
        expect(tree.inputs.value()).toEqual(['Grains']);
      });

      it('should select on navigation', () => {
        combobox.onKeydown(down());
        combobox.onKeydown(right());
        combobox.onKeydown(right());
        expect(tree.inputs.value()).toEqual(['Apple']);
      });

      it('should select the first option on input', () => {
        type('B');
        expect(tree.inputs.value()).toEqual(['Banana']);

        type('Bro');
        expect(tree.inputs.value()).toEqual(['Broccoli']);
      });

      it('should commit the selected option on navigation', () => {
        combobox.onKeydown(down());
        expect(inputEl.value).toBe('Fruit');
        combobox.onKeydown(right());
        combobox.onKeydown(right());
        expect(inputEl.value).toBe('Apple');
        combobox.onKeydown(down());
        expect(tree.inputs.value()).toEqual(['Banana']);
      });

      it('should commit the selected option on focusout', () => {
        combobox.onKeydown(down());
        type('App');
        combobox.onFocusOut(new FocusEvent('focusout'));
        expect(inputEl.value).toBe('Apple');
      });

      it('should insert a highlighted completion string on input', () => {
        type('A');
        expect(inputEl.value).toBe('Apple');
        expect(inputEl.selectionStart).toBe(1);
        expect(inputEl.selectionEnd).toBe(5);
      });
    });
  });

  describe('Readonly mode', () => {
    it('should select and close on selection', () => {
      const {combobox, tree, inputEl} = getPatterns({readonly: true});
      combobox.onPointerup(clickInput(inputEl));
      expect(combobox.expanded()).toBe(true);
      combobox.onPointerup(clickTreeItem(tree.inputs.allItems(), 0));
      expect(tree.inputs.value()).toEqual(['Fruit']);
      expect(inputEl.value).toBe('Fruit');
      expect(combobox.expanded()).toBe(false);
    });

    it('should close on escape', () => {
      const {combobox} = getPatterns({readonly: true});
      combobox.onKeydown(down());
      expect(combobox.expanded()).toBe(true);
      combobox.onKeydown(escape());
      expect(combobox.expanded()).toBe(false);
    });

    it('should clear selection on escape when already closed', () => {
      const {combobox, tree, inputEl} = getPatterns({readonly: true});
      combobox.onPointerup(clickInput(inputEl));
      combobox.onPointerup(clickTreeItem(tree.inputs.allItems(), 0));
      expect(tree.inputs.value()).toEqual(['Fruit']);
      expect(inputEl.value).toBe('Fruit');
      expect(combobox.expanded()).toBe(false);
      combobox.onKeydown(escape());
      expect(tree.inputs.value()).toEqual([]);
      expect(inputEl.value).toBe('');
    });
  });
});
