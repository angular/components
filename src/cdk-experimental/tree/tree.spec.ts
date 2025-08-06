import {Component, signal} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Direction} from '@angular/cdk/bidi';
import {provideFakeDirectionality, runAccessibilityChecks} from '@angular/cdk/testing/private';
import {CdkTree, CdkTreeItem, CdkTreeItemGroup, CdkTreeItemGroupContent} from './tree';

interface ModifierKeys {
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

describe('CdkTree', () => {
  let fixture: ComponentFixture<TestTreeComponent>;
  let testComponent: TestTreeComponent;
  let treeElement: HTMLElement;
  let treeInstance: CdkTree<string>;
  let treeItemElements: HTMLElement[];
  let treeItemGroupElements: HTMLElement[];

  const keydown = (key: string, modifierKeys: ModifierKeys = {}) => {
    const event = new KeyboardEvent('keydown', {key, bubbles: true, ...modifierKeys});
    treeElement.dispatchEvent(event);
    fixture.detectChanges();
    defineTestVariables();
  };

  const pointerDown = (target: HTMLElement, eventInit: PointerEventInit = {}) => {
    target.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, ...eventInit}));
    fixture.detectChanges();
    defineTestVariables();
  };

  const up = (modifierKeys?: ModifierKeys) => keydown('ArrowUp', modifierKeys);
  const down = (modifierKeys?: ModifierKeys) => keydown('ArrowDown', modifierKeys);
  const left = (modifierKeys?: ModifierKeys) => keydown('ArrowLeft', modifierKeys);
  const right = (modifierKeys?: ModifierKeys) => keydown('ArrowRight', modifierKeys);
  const home = (modifierKeys?: ModifierKeys) => keydown('Home', modifierKeys);
  const end = (modifierKeys?: ModifierKeys) => keydown('End', modifierKeys);
  const enter = (modifierKeys?: ModifierKeys) => keydown('Enter', modifierKeys);
  const space = (modifierKeys?: ModifierKeys) => keydown(' ', modifierKeys);
  const shift = () => keydown('Shift');
  const type = (chars: string) => {
    for (const char of chars) {
      keydown(char);
    }
  };
  const click = (target: HTMLElement) => pointerDown(target);
  const shiftClick = (target: HTMLElement) => pointerDown(target, {shiftKey: true});
  const ctrlClick = (target: HTMLElement) => pointerDown(target, {ctrlKey: true});

  function setupTestTree(textDirection: Direction = 'ltr') {
    TestBed.configureTestingModule({
      providers: [provideFakeDirectionality(textDirection)],
    });

    fixture = TestBed.createComponent(TestTreeComponent);
    testComponent = fixture.componentInstance;

    fixture.detectChanges();
    defineTestVariables();
  }

  function defineTestVariables() {
    const treeDebugElement = fixture.debugElement.query(By.directive(CdkTree));
    const treeItemDebugElements = fixture.debugElement.queryAll(By.directive(CdkTreeItem));
    const treeItemGroupDebugElements = fixture.debugElement.queryAll(
      By.directive(CdkTreeItemGroup),
    );

    treeElement = treeDebugElement.nativeElement as HTMLElement;
    treeInstance = treeDebugElement.componentInstance as CdkTree<string>;
    treeItemElements = treeItemDebugElements.map(debugEl => debugEl.nativeElement);
    treeItemGroupElements = treeItemGroupDebugElements.map(debugEl => debugEl.nativeElement);
  }

  function updateTree(
    config: {
      nodes?: TestTreeNode[];
      value?: string[];
      disabled?: boolean;
      orientation?: 'horizontal' | 'vertical';
      multi?: boolean;
      wrap?: boolean;
      skipDisabled?: boolean;
      focusMode?: 'roving' | 'activedescendant';
      selectionMode?: 'follow' | 'explicit';
      nav?: boolean;
      currentType?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
    } = {},
  ) {
    if (config.nodes !== undefined) testComponent.nodes.set(config.nodes);
    if (config.value !== undefined) treeInstance.value.set(config.value);
    if (config.disabled !== undefined) testComponent.disabled.set(config.disabled);
    if (config.orientation !== undefined) testComponent.orientation.set(config.orientation);
    if (config.multi !== undefined) testComponent.multi.set(config.multi);
    if (config.wrap !== undefined) testComponent.wrap.set(config.wrap);
    if (config.skipDisabled !== undefined) testComponent.skipDisabled.set(config.skipDisabled);
    if (config.focusMode !== undefined) testComponent.focusMode.set(config.focusMode);
    if (config.selectionMode !== undefined) testComponent.selectionMode.set(config.selectionMode);
    if (config.nav !== undefined) testComponent.nav.set(config.nav);
    if (config.currentType !== undefined) testComponent.currentType.set(config.currentType);

    fixture.detectChanges();
    defineTestVariables();
  }

  function updateTreeItemByValue(value: string, config: Partial<TestTreeNode<string>>) {
    const newNodes = JSON.parse(JSON.stringify(testComponent.nodes()));
    const childrenList = [newNodes];
    while (childrenList.length > 0) {
      const list = childrenList.shift()!;
      for (const node of list) {
        if (node.value === value) {
          if (config.value !== undefined) node.value = config.value;
          if (config.label !== undefined) node.label = config.label;
          if (config.children !== undefined) node.children = config.children;
          if (config.disabled !== undefined) node.disabled = config.disabled;
          if (config.preserveContent !== undefined) node.preserveContent = config.preserveContent;
          updateTree({nodes: newNodes});
          return;
        }
        if (node.children) {
          childrenList.push(node.children);
        }
      }
    }
  }

  function getTreeItemElementByValue(value: string): HTMLElement | undefined {
    return treeItemElements.find(el => el.getAttribute('data-value') === String(value));
  }

  function getTreeItemGroupElementByValue(value: string): HTMLElement | undefined {
    return treeItemGroupElements.find(el => el.getAttribute('data-group-for') === String(value));
  }

  function getFocusedTreeItemValue(): string | undefined {
    let item: HTMLElement | undefined;
    if (testComponent.focusMode() === 'roving') {
      item = treeItemElements.find(el => el.getAttribute('tabindex') === '0');
    } else {
      const itemId = treeElement.getAttribute('aria-activedescendant');
      if (itemId) {
        item = treeItemElements.find(el => el.id === itemId);
      }
    }
    return item?.getAttribute('data-value') ?? undefined;
  }

  afterEach(async () => {
    fixture.detectChanges();
    await runAccessibilityChecks(fixture.nativeElement);
  });

  describe('ARIA attributes and roles', () => {
    describe('default configuration', () => {
      beforeEach(() => {
        setupTestTree();
        // Preserve collapsed children nodes for checking attributes.
        updateTreeItemByValue('fruits', {preserveContent: true});
        updateTreeItemByValue('berries', {preserveContent: true});
        updateTreeItemByValue('vegetables', {preserveContent: true});
      });

      it('should correctly set the role attribute to "tree" for CdkTree', () => {
        expect(treeElement.getAttribute('role')).toBe('tree');
      });

      it('should correctly set the role attribute to "treeitem" for CdkTreeItem', () => {
        expect(getTreeItemElementByValue('fruits')!.getAttribute('role')).toBe('treeitem');
        expect(getTreeItemElementByValue('vegetables')!.getAttribute('role')).toBe('treeitem');
        expect(getTreeItemElementByValue('grains')!.getAttribute('role')).toBe('treeitem');
        expect(getTreeItemElementByValue('dairy')!.getAttribute('role')).toBe('treeitem');
        expect(getTreeItemElementByValue('apple')!.getAttribute('role')).toBe('treeitem');
        expect(getTreeItemElementByValue('banana')!.getAttribute('role')).toBe('treeitem');
        expect(getTreeItemElementByValue('berries')!.getAttribute('role')).toBe('treeitem');
        expect(getTreeItemElementByValue('strawberry')!.getAttribute('role')).toBe('treeitem');
        expect(getTreeItemElementByValue('blueberry')!.getAttribute('role')).toBe('treeitem');
      });

      it('should correctly set the role attribute to "group" for CdkTreeItemGroup', () => {
        expect(getTreeItemGroupElementByValue('fruits')!.getAttribute('role')).toBe('group');
        expect(getTreeItemGroupElementByValue('vegetables')!.getAttribute('role')).toBe('group');
        expect(getTreeItemGroupElementByValue('berries')!.getAttribute('role')).toBe('group');
      });

      it('should set aria-orientation to "vertical" by default', () => {
        expect(treeElement.getAttribute('aria-orientation')).toBe('vertical');
      });

      it('should set aria-multiselectable to "false" by default', () => {
        expect(treeElement.getAttribute('aria-multiselectable')).toBe('false');
      });

      it('should set aria-disabled to "false" by default for the tree', () => {
        expect(treeElement.getAttribute('aria-disabled')).toBe('false');
      });

      it('should set aria-disabled to "false" by default for items', () => {
        expect(treeItemElements[0].getAttribute('aria-disabled')).toBe('false');
      });

      it('should not have aria-expanded for items without children', () => {
        const grainsItem = getTreeItemElementByValue('grains')!;
        expect(grainsItem.hasAttribute('aria-expanded')).toBe(false);
      });

      it('should set aria-expanded to "false" by default for items with children', () => {
        const fruitsItem = getTreeItemElementByValue('fruits')!;
        expect(fruitsItem.getAttribute('aria-expanded')).toBe('false');
      });

      it('should set aria-level, aria-setsize, and aria-posinset correctly', () => {
        const fruits = getTreeItemElementByValue('fruits')!;
        expect(fruits.getAttribute('aria-level')).toBe('1');
        expect(fruits.getAttribute('aria-setsize')).toBe('4');
        expect(fruits.getAttribute('aria-posinset')).toBe('1');
        expect(fruits.getAttribute('aria-expanded')).toBe('false');

        const vegetables = getTreeItemElementByValue('vegetables')!;
        expect(vegetables.getAttribute('aria-level')).toBe('1');
        expect(vegetables.getAttribute('aria-setsize')).toBe('4');
        expect(vegetables.getAttribute('aria-posinset')).toBe('2');
        expect(vegetables.getAttribute('aria-expanded')).toBe('false');

        const grains = getTreeItemElementByValue('grains')!;
        expect(grains.getAttribute('aria-level')).toBe('1');
        expect(grains.getAttribute('aria-setsize')).toBe('4');
        expect(grains.getAttribute('aria-posinset')).toBe('3');

        const dairy = getTreeItemElementByValue('dairy')!;
        expect(dairy.getAttribute('aria-level')).toBe('1');
        expect(dairy.getAttribute('aria-setsize')).toBe('4');
        expect(dairy.getAttribute('aria-posinset')).toBe('4');

        const apple = getTreeItemElementByValue('apple')!;
        expect(apple.getAttribute('aria-level')).toBe('2');
        expect(apple.getAttribute('aria-setsize')).toBe('3');
        expect(apple.getAttribute('aria-posinset')).toBe('1');

        const berries = getTreeItemElementByValue('berries')!;
        expect(berries.getAttribute('aria-level')).toBe('2');
        expect(berries.getAttribute('aria-setsize')).toBe('3');
        expect(berries.getAttribute('aria-posinset')).toBe('3');
        expect(berries.getAttribute('aria-expanded')).toBe('false');

        const strawberry = getTreeItemElementByValue('strawberry')!;
        expect(strawberry.getAttribute('aria-level')).toBe('3');
        expect(strawberry.getAttribute('aria-setsize')).toBe('2');
        expect(strawberry.getAttribute('aria-posinset')).toBe('1');
      });

      it('should set aria-owns on expandable items pointing to their group id', () => {
        const fruitsItem = getTreeItemElementByValue('fruits')!;
        const group = getTreeItemGroupElementByValue('fruits')!;
        expect(fruitsItem.getAttribute('aria-owns')).toBe(group!.id);
      });
    });

    describe('custom configuration', () => {
      beforeEach(() => {
        setupTestTree();
        // Preserve collapsed children nodes for checking attributes.
        updateTreeItemByValue('fruits', {preserveContent: true});
        updateTreeItemByValue('berries', {preserveContent: true});
        updateTreeItemByValue('vegetables', {preserveContent: true});
      });

      it('should set aria-orientation to "horizontal"', () => {
        updateTree({orientation: 'horizontal'});

        expect(treeElement.getAttribute('aria-orientation')).toBe('horizontal');
      });

      it('should set aria-multiselectable to "true"', () => {
        updateTree({multi: true});

        expect(treeElement.getAttribute('aria-multiselectable')).toBe('true');
      });

      it('should set aria-disabled to "true" for the tree', () => {
        updateTree({disabled: true});

        expect(treeElement.getAttribute('aria-disabled')).toBe('true');
      });

      it('should set aria-disabled to "true" for disabled items', () => {
        updateTreeItemByValue('fruits', {disabled: true});

        const fruitsItem = getTreeItemElementByValue('fruits')!;
        expect(fruitsItem.getAttribute('aria-disabled')).toBe('true');
      });

      it('should set aria-selected to "true" for selected items', () => {
        updateTree({value: ['apple']});

        const appleItem = getTreeItemElementByValue('apple')!;
        expect(appleItem.getAttribute('aria-selected')).toBe('true');
        const fruitsItem = getTreeItemElementByValue('fruits')!;
        expect(fruitsItem.getAttribute('aria-selected')).toBe('false');
      });

      it('should set aria-expanded to "true" for expanded items', () => {
        right();
        const fruitsItem = getTreeItemElementByValue('fruits')!;
        expect(fruitsItem.getAttribute('aria-expanded')).toBe('true');
      });

      it('should set aria-current to specific current type when nav="true"', () => {
        updateTree({nav: true, value: ['apple']});

        const appleItem = getTreeItemElementByValue('apple')!;
        const bananaItem = getTreeItemElementByValue('banana')!;
        expect(appleItem.getAttribute('aria-current')).toBe('page');
        expect(bananaItem.hasAttribute('aria-current')).toBe(false);

        updateTree({currentType: 'location'});
        expect(appleItem.getAttribute('aria-current')).toBe('location');
      });

      it('should not set aria-selected when nav="true"', () => {
        updateTree({value: ['apple'], nav: true});
        const appleItem = getTreeItemElementByValue('apple')!;
        expect(appleItem.hasAttribute('aria-selected')).toBe(false);

        updateTree({nav: false});
        expect(appleItem.getAttribute('aria-selected')).toBe('true');
      });
    });

    describe('roving focus mode (focusMode="roving")', () => {
      beforeEach(() => {
        setupTestTree();
        updateTree({focusMode: 'roving'});
      });

      it('should set tabindex="-1" for the tree', () => {
        expect(treeElement.getAttribute('tabindex')).toBe('-1');
      });

      it('should set tabindex="0" for the tree when disabled', () => {
        updateTree({disabled: true, focusMode: 'roving'});

        expect(treeElement.getAttribute('tabindex')).toBe('0');
      });

      it('should set initial focus (tabindex="0") on the first non-disabled item if no value is set', () => {
        const fruitsItem = getTreeItemElementByValue('fruits')!;
        const vegetablesItem = getTreeItemElementByValue('vegetables')!;
        const grainsItem = getTreeItemElementByValue('grains')!;
        const dairyItem = getTreeItemElementByValue('dairy')!;

        expect(fruitsItem.getAttribute('tabindex')).toBe('0');
        expect(vegetablesItem.getAttribute('tabindex')).toBe('-1');
        expect(grainsItem.getAttribute('tabindex')).toBe('-1');
        expect(dairyItem.getAttribute('tabindex')).toBe('-1');
      });

      it('should set initial focus (tabindex="0") on the first selected item', () => {
        updateTree({value: ['vegetables', 'dairy'], focusMode: 'roving'});

        const fruitsItem = getTreeItemElementByValue('fruits')!;
        const vegetablesItem = getTreeItemElementByValue('vegetables')!;
        const grainsItem = getTreeItemElementByValue('grains')!;
        const dairyItem = getTreeItemElementByValue('dairy')!;

        expect(fruitsItem.getAttribute('tabindex')).toBe('-1');
        expect(vegetablesItem.getAttribute('tabindex')).toBe('0');
        expect(grainsItem.getAttribute('tabindex')).toBe('-1');
        expect(dairyItem.getAttribute('tabindex')).toBe('-1');
      });

      it('should not have aria-activedescendant', () => {
        expect(treeElement.hasAttribute('aria-activedescendant')).toBe(false);
      });
    });

    describe('activedescendant focus mode (focusMode="activedescendant")', () => {
      beforeEach(() => {
        setupTestTree();
        updateTree({focusMode: 'activedescendant'});
      });

      it('should set tabindex="0" for the tree', () => {
        expect(treeElement.getAttribute('tabindex')).toBe('0');
      });

      it('should set aria-activedescendant to the ID of the first non-disabled item if no value is set', () => {
        const fruitsItem = getTreeItemElementByValue('fruits')!;
        expect(treeElement.getAttribute('aria-activedescendant')).toBe(fruitsItem.id);
      });

      it('should set aria-activedescendant to the ID of the first selected item', () => {
        updateTree({value: ['vegetables', 'dairy'], focusMode: 'activedescendant'});

        const vegetablesItem = getTreeItemElementByValue('vegetables')!;
        expect(treeElement.getAttribute('aria-activedescendant')).toBe(vegetablesItem.id);
      });

      it('should set tabindex="-1" for all items', () => {
        // Preserve collapsed children nodes for checking attributes.
        updateTreeItemByValue('fruits', {preserveContent: true});
        updateTreeItemByValue('berries', {preserveContent: true});
        updateTreeItemByValue('vegetables', {preserveContent: true});

        expect(getTreeItemElementByValue('fruits')!.getAttribute('tabindex')).toBe('-1');
        expect(getTreeItemElementByValue('apple')!.getAttribute('tabindex')).toBe('-1');
        expect(getTreeItemElementByValue('banana')!.getAttribute('tabindex')).toBe('-1');
        expect(getTreeItemElementByValue('berries')!.getAttribute('tabindex')).toBe('-1');
        expect(getTreeItemElementByValue('strawberry')!.getAttribute('tabindex')).toBe('-1');
        expect(getTreeItemElementByValue('blueberry')!.getAttribute('tabindex')).toBe('-1');
        expect(getTreeItemElementByValue('vegetables')!.getAttribute('tabindex')).toBe('-1');
        expect(getTreeItemElementByValue('carrot')!.getAttribute('tabindex')).toBe('-1');
        expect(getTreeItemElementByValue('broccoli')!.getAttribute('tabindex')).toBe('-1');
        expect(getTreeItemElementByValue('grains')!.getAttribute('tabindex')).toBe('-1');
        expect(getTreeItemElementByValue('dairy')!.getAttribute('tabindex')).toBe('-1');
      });
    });
  });

  describe('value and selection', () => {
    it('should select items based on the initial value input', () => {
      setupTestTree();
      // Preserve collapsed children nodes for checking attributes.
      updateTreeItemByValue('fruits', {preserveContent: true});
      updateTreeItemByValue('berries', {preserveContent: true});
      updateTreeItemByValue('vegetables', {preserveContent: true});
      updateTree({value: ['apple', 'strawberry', 'carrot']});

      expect(getTreeItemElementByValue('apple')!.getAttribute('aria-selected')).toBe('true');
      expect(getTreeItemElementByValue('strawberry')!.getAttribute('aria-selected')).toBe('true');
      expect(getTreeItemElementByValue('carrot')!.getAttribute('aria-selected')).toBe('true');
      expect(getTreeItemElementByValue('banana')!.getAttribute('aria-selected')).toBe('false');
    });

    describe('pointer interactions', () => {
      describe('single select (multi=false, selectionMode="explicit")', () => {
        beforeEach(() => {
          setupTestTree();
          updateTree({multi: false, selectionMode: 'explicit'});
        });

        it('should select an item on click and deselect others', () => {
          right();
          const appleEl = getTreeItemElementByValue('apple')!;
          const bananaEl = getTreeItemElementByValue('banana')!;

          click(appleEl);
          expect(treeInstance.value()).toEqual(['apple']);
          expect(appleEl.getAttribute('aria-selected')).toBe('true');
          expect(bananaEl.getAttribute('aria-selected')).toBe('false');

          click(bananaEl);
          expect(treeInstance.value()).toEqual(['banana']);
          expect(appleEl.getAttribute('aria-selected')).toBe('false');
          expect(bananaEl.getAttribute('aria-selected')).toBe('true');
        });
      });

      describe('multi select (multi=true)', () => {
        beforeEach(() => {
          setupTestTree();
          updateTree({multi: true});

          // Expands vegetables and fruits
          down();
          right();
          up();
          right();
        });

        describe('selectionMode="explicit"', () => {
          beforeEach(() => {
            updateTree({selectionMode: 'explicit'});
          });

          it('should select a range with shift+click', () => {
            const appleEl = getTreeItemElementByValue('apple')!;
            const carrotEl = getTreeItemElementByValue('carrot')!;

            click(appleEl);
            expect(treeInstance.value()).toEqual(['apple']);
            expect(appleEl.getAttribute('aria-selected')).toBe('true');

            shiftClick(carrotEl);
            expect(treeInstance.value()).toEqual([
              'apple',
              'banana',
              'berries',
              'vegetables',
              'carrot',
            ]);
          });

          it('should toggle selection of an item on simple click, leaving other selections intact', () => {
            const appleEl = getTreeItemElementByValue('apple')!;
            const bananaEl = getTreeItemElementByValue('banana')!;

            click(appleEl);
            expect(treeInstance.value()).toEqual(['apple']);

            click(bananaEl);
            expect(treeInstance.value()).toEqual(['apple', 'banana']);

            click(appleEl);
            expect(treeInstance.value()).toEqual(['banana']);
          });
        });

        describe('selectionMode="follow"', () => {
          beforeEach(() => {
            updateTree({selectionMode: 'follow'});
          });

          it('should select only the clicked item with a simple click (like single select), deselecting others', () => {
            const appleEl = getTreeItemElementByValue('apple')!;
            const bananaEl = getTreeItemElementByValue('banana')!;
            const carrotEl = getTreeItemElementByValue('carrot')!;

            ctrlClick(appleEl);
            ctrlClick(bananaEl);
            expect(treeInstance.value()).toEqual(['apple', 'banana']);

            click(carrotEl);
            expect(treeInstance.value()).toEqual(['carrot']);

            click(appleEl);
            expect(treeInstance.value()).toEqual(['apple']);
          });

          it('should add to selection with ctrl+click and toggle individual items', () => {
            const appleEl = getTreeItemElementByValue('apple')!;
            const berriesEl = getTreeItemElementByValue('berries')!;

            click(appleEl);
            expect(treeInstance.value()).toEqual(['apple']);

            ctrlClick(berriesEl);
            expect(treeInstance.value()).toEqual(['apple', 'berries']);

            ctrlClick(appleEl);
            expect(treeInstance.value()).toEqual(['berries']);
          });

          it('should select a range with shift+click, anchoring from last selected/focused', () => {
            const appleEl = getTreeItemElementByValue('apple')!;
            const berriesEl = getTreeItemElementByValue('berries')!;
            const carrotEl = getTreeItemElementByValue('carrot')!;
            const broccoliEl = getTreeItemElementByValue('broccoli')!;

            click(appleEl);
            expect(treeInstance.value()).toEqual(['apple']);

            shiftClick(carrotEl);
            expect(treeInstance.value()).toEqual([
              'apple',
              'banana',
              'berries',
              'vegetables',
              'carrot',
            ]);

            click(berriesEl);
            expect(treeInstance.value()).toEqual(['berries']);

            shiftClick(broccoliEl);
            expect(treeInstance.value()).toEqual([
              'berries',
              'strawberry',
              'blueberry',
              'vegetables',
              'carrot',
              'broccoli',
            ]);
          });
        });
      });
    });

    describe('keyboard interactions', () => {
      describe('single select (multi=false)', () => {
        beforeEach(() => {
          setupTestTree();
          updateTree({multi: false});
        });

        describe('selectionMode="explicit"', () => {
          beforeEach(() => {
            updateTree({selectionMode: 'explicit'});
          });

          it('should select the focused item with Enter and deselect others', () => {
            enter();
            expect(treeInstance.value()).toEqual(['fruits']);

            down();
            enter();
            expect(treeInstance.value()).toEqual(['vegetables']);
          });

          it('should select the focused item with Space and deselect others', () => {
            space();
            expect(treeInstance.value()).toEqual(['fruits']);

            down();
            space();
            expect(treeInstance.value()).toEqual(['vegetables']);
          });

          it('should move focus with arrows without changing selection until Enter/Space', () => {
            enter();
            expect(treeInstance.value()).toEqual(['fruits']);

            down();
            expect(treeInstance.value()).toEqual(['fruits']);

            down();
            expect(treeInstance.value()).toEqual(['fruits']);

            enter();
            expect(treeInstance.value()).toEqual(['grains']);
          });
        });

        describe('selectionMode="follow"', () => {
          beforeEach(() => {
            updateTree({selectionMode: 'follow'});
          });

          it('should select an item when it becomes focused with ArrowDown and deselect others', () => {
            updateTree({value: ['fruits']});
            expect(treeInstance.value()).toEqual(['fruits']);

            down();
            expect(treeInstance.value()).toEqual(['vegetables']);

            down();
            expect(treeInstance.value()).toEqual(['grains']);
          });

          it('should select an item when it becomes focused with ArrowUp and deselect others', () => {
            updateTree({value: ['grains']});

            up();
            expect(treeInstance.value()).toEqual(['vegetables']);
          });

          it('should select the first item with Home and deselect others', () => {
            updateTree({value: ['grains']});
            expect(treeInstance.value()).toEqual(['grains']);

            home();
            expect(treeInstance.value()).toEqual(['fruits']);
          });

          it('should select the last visible item with End and deselect others', () => {
            updateTree({value: ['fruits']});
            expect(treeInstance.value()).toEqual(['fruits']);

            end();
            expect(treeInstance.value()).toEqual(['dairy']);
          });

          it('should select an item via typeahead and deselect others', () => {
            updateTree({value: ['fruits']});
            expect(treeInstance.value()).toEqual(['fruits']);

            type('V');
            expect(treeInstance.value()).toEqual(['vegetables']);
          });
        });
      });

      describe('multi select (multi=true)', () => {
        beforeEach(() => {
          setupTestTree();
          updateTree({multi: true});
        });

        describe('selectionMode="explicit"', () => {
          beforeEach(() => {
            updateTree({selectionMode: 'explicit'});
          });

          it('should toggle selection of the focused item with Space, leaving other selections intact', () => {
            space();
            expect(treeInstance.value()).toEqual(['fruits']);

            down();
            space();
            expect(treeInstance.value().sort()).toEqual(['fruits', 'vegetables']);
          });

          it('should move focus with arrows without changing selection', () => {
            space();
            expect(treeInstance.value()).toEqual(['fruits']);

            down();
            expect(treeInstance.value()).toEqual(['fruits']);
          });

          it('should extend selection downwards with Shift+ArrowDown', () => {
            shift();
            down({shiftKey: true});
            expect(treeInstance.value().sort()).toEqual(['fruits', 'vegetables']);

            down({shiftKey: true});
            expect(treeInstance.value().sort()).toEqual(['fruits', 'grains', 'vegetables']);
          });

          it('should extend selection upwards with Shift+ArrowUp', () => {
            end();
            shift();
            up({shiftKey: true});
            expect(treeInstance.value().sort()).toEqual(['dairy', 'grains']);
          });

          it('Ctrl+A should select all enabled visible items, then deselect all', () => {
            // Expands vegetables and fruits
            down();
            right();
            up();
            right();

            updateTreeItemByValue('carrot', {disabled: true});
            updateTreeItemByValue('broccoli', {disabled: true});

            keydown('A', {ctrlKey: true});
            expect(treeInstance.value().sort()).toEqual([
              'apple',
              'banana',
              'berries',
              'dairy',
              'fruits',
              'grains',
              'vegetables',
            ]);

            keydown('A', {ctrlKey: true});
            expect(treeInstance.value()).toEqual([]);
          });

          it('Ctrl+ArrowKey should move focus without changing selection', () => {
            space();
            expect(treeInstance.value()).toEqual(['fruits']);

            down({ctrlKey: true});
            expect(treeInstance.value()).toEqual(['fruits']);

            up({ctrlKey: true});
            expect(treeInstance.value()).toEqual(['fruits']);
          });
        });

        describe('selectionMode="follow"', () => {
          beforeEach(() => {
            updateTree({selectionMode: 'follow'});
          });

          it('should select the focused item and deselect others on ArrowDown', () => {
            updateTree({value: ['fruits']});
            expect(treeInstance.value()).toEqual(['fruits']);

            down();
            expect(treeInstance.value()).toEqual(['vegetables']);
          });

          it('should select the focused item and deselect others on ArrowUp', () => {
            updateTree({value: ['vegetables']});
            expect(treeInstance.value()).toEqual(['vegetables']);

            up();
            expect(treeInstance.value()).toEqual(['fruits']);
          });

          it('should move focus without changing selection on Ctrl+ArrowDown', () => {
            updateTree({value: ['fruits']});
            expect(getFocusedTreeItemValue()).toBe('fruits');

            down({ctrlKey: true});
            expect(treeInstance.value()).toEqual(['fruits']);
            expect(getFocusedTreeItemValue()).toBe('vegetables');
          });

          it('should move focus without changing selection on Ctrl+ArrowUp', () => {
            updateTree({value: ['fruits']});

            down({ctrlKey: true});
            expect(getFocusedTreeItemValue()).toBe('vegetables');

            up({ctrlKey: true});
            expect(treeInstance.value()).toEqual(['fruits']);
            expect(getFocusedTreeItemValue()).toBe('fruits');
          });

          it('should toggle selection of the focused item on Ctrl+Space, adding to existing selection', () => {
            updateTree({value: ['fruits']});
            down({ctrlKey: true});
            expect(getFocusedTreeItemValue()).toBe('vegetables');

            space({ctrlKey: true});
            expect(treeInstance.value().sort()).toEqual(['fruits', 'vegetables']);

            space({ctrlKey: true});
            expect(treeInstance.value()).toEqual(['fruits']);
          });

          it('should toggle selection of the focused item on Ctrl+Enter, adding to existing selection', () => {
            updateTree({value: ['fruits']});
            down({ctrlKey: true});
            expect(getFocusedTreeItemValue()).toBe('vegetables');

            enter({ctrlKey: true});
            expect(treeInstance.value().sort()).toEqual(['fruits', 'vegetables']);

            enter({ctrlKey: true});
            expect(treeInstance.value()).toEqual(['fruits']);
          });

          it('should extend selection downwards with Shift+ArrowDown', () => {
            right(); // Expands fruits
            updateTree({value: ['fruits']});

            shift();
            down({shiftKey: true});
            expect(treeInstance.value().sort()).toEqual(['apple', 'fruits']);

            down({shiftKey: true});
            expect(treeInstance.value().sort()).toEqual(['apple', 'banana', 'fruits']);
          });

          it('should extend selection upwards with Shift+ArrowUp', () => {
            updateTree({value: ['grains']});

            shift();
            up({shiftKey: true});
            expect(treeInstance.value().sort()).toEqual(['grains', 'vegetables']);

            up({shiftKey: true});
            expect(treeInstance.value().sort()).toEqual(['fruits', 'grains', 'vegetables']);
          });

          it('should select a range with Shift+Space, anchoring from last selected/focused item', () => {
            right(); // Expands fruits
            updateTree({value: ['fruits']});

            down({ctrlKey: true});
            down({ctrlKey: true});
            expect(getFocusedTreeItemValue()).toBe('banana');

            space({shiftKey: true});
            expect(treeInstance.value().sort()).toEqual(['apple', 'banana', 'fruits']);
          });

          it('Ctrl+A: select all enabled visible items; second Ctrl+A deselects all except focused', () => {
            right(); // Expands fruits
            updateTreeItemByValue('vegetables', {disabled: true});

            keydown('A', {ctrlKey: true});
            expect(treeInstance.value().sort()).toEqual([
              'apple',
              'banana',
              'berries',
              'dairy',
              'fruits',
              'grains',
            ]);

            keydown('A', {ctrlKey: true});
            expect(treeInstance.value()).toEqual(['fruits']);
          });

          it('typeahead should select the focused item and deselect others', () => {
            updateTree({value: ['fruits']});
            type('V');
            expect(treeInstance.value()).toEqual(['vegetables']);
            expect(getFocusedTreeItemValue()).toBe('vegetables');
          });

          it('should not select disabled items during Shift+ArrowKey navigation even if skipDisabled is false', () => {
            right(); // Expands fruits
            updateTreeItemByValue('banana', {disabled: true});
            updateTree({value: ['apple'], skipDisabled: false});
            expect(getFocusedTreeItemValue()).toBe('apple');

            keydown('Shift');
            down({shiftKey: true});
            expect(getFocusedTreeItemValue()).toBe('banana');
            expect(treeInstance.value().sort()).toEqual(['apple']);

            down({shiftKey: true}); // Focus 'berries'
            expect(getFocusedTreeItemValue()).toBe('berries');
            expect(treeInstance.value().sort()).toEqual(['apple', 'berries']);
          });

          it('should not change selection if tree is disabled', () => {
            updateTree({value: ['fruits'], disabled: true});
            down();
            expect(treeInstance.value()).toEqual(['fruits']);
          });
        });
      });
    });
  });

  describe('expansion and collapse', () => {
    describe('LTR', () => {
      beforeEach(() => {
        setupTestTree();
      });

      describe('orientation="vertical"', () => {
        beforeEach(() => {
          updateTree({orientation: 'vertical'});
        });

        it('should expand a collapsed item with ArrowRight', () => {
          const fruitsEl = getTreeItemElementByValue('fruits')!;
          expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');

          right();
          expect(fruitsEl.getAttribute('aria-expanded')).toBe('true');
        });

        it('should move focus to first child if ArrowRight on an expanded item', () => {
          right(); // Expands fruits
          expect(getFocusedTreeItemValue()).toBe('fruits');

          right();
          expect(getFocusedTreeItemValue()).toBe('apple');
        });

        it('should collapse an expanded item with ArrowLeft', () => {
          right(); // Expands fruits
          const fruitsEl = getTreeItemElementByValue('fruits')!;
          expect(fruitsEl.getAttribute('aria-expanded')).toBe('true');
          left();
          expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');
        });

        it('should move focus to parent if ArrowLeft on a collapsed non-root item', () => {
          right(); // Expands fruits
          right(); // Focus apple (child of fruits)
          expect(getFocusedTreeItemValue()).toBe('apple');

          left();
          expect(getFocusedTreeItemValue()).toBe('fruits');
        });
      });

      describe('orientation="horizontal"', () => {
        beforeEach(() => {
          updateTree({orientation: 'horizontal'});
        });

        it('should expand a collapsed item with ArrowDown', () => {
          updateTree({orientation: 'horizontal'});
          const fruitsEl = getTreeItemElementByValue('fruits')!;
          expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');
          down();
          expect(fruitsEl.getAttribute('aria-expanded')).toBe('true');
        });

        it('should move focus to first child if ArrowDown on an expanded item', () => {
          updateTree({orientation: 'horizontal'});
          expect(getFocusedTreeItemValue()).toBe('fruits');
          down();
          down();
          expect(getFocusedTreeItemValue()).toBe('apple');
        });

        it('should collapse an expanded item with ArrowUp', () => {
          updateTree({orientation: 'horizontal'});
          down(); // Expands fruits
          const fruitsEl = getTreeItemElementByValue('fruits')!;
          expect(fruitsEl.getAttribute('aria-expanded')).toBe('true');
          up();
          expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');
        });

        it('should move focus to parent if ArrowUp on a collapsed non-root item', () => {
          updateTree({orientation: 'horizontal'});
          down(); // Expands fruits
          down();
          expect(getFocusedTreeItemValue()).toBe('apple');
          up();
          expect(getFocusedTreeItemValue()).toBe('fruits');
        });
      });

      it('should expand all sibling items with Shift + *', () => {
        const fruitsEl = getTreeItemElementByValue('fruits')!;
        const vegetablesEl = getTreeItemElementByValue('vegetables')!;
        const grainsEl = getTreeItemElementByValue('grains')!;
        const dairyEl = getTreeItemElementByValue('dairy')!;

        expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');
        expect(vegetablesEl.getAttribute('aria-expanded')).toBe('false');

        keydown('*', {shiftKey: true});

        expect(fruitsEl.getAttribute('aria-expanded')).toBe('true');
        expect(vegetablesEl.getAttribute('aria-expanded')).toBe('true');
        expect(grainsEl.hasAttribute('aria-expanded')).toBe(false);
        expect(dairyEl.hasAttribute('aria-expanded')).toBe(false);
      });

      it('should toggle expansion on pointerdown (click) for an expandable item', () => {
        const fruitsEl = getTreeItemElementByValue('fruits')!;
        expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');

        click(fruitsEl);
        expect(fruitsEl.getAttribute('aria-expanded')).toBe('true');
        expect(getFocusedTreeItemValue()).toBe('fruits');

        click(fruitsEl);
        expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');
      });

      it('should not expand a non-expandable item on click', () => {
        const grainsEl = getTreeItemElementByValue('grains')!;
        expect(grainsEl.hasAttribute('aria-expanded')).toBe(false);

        click(grainsEl);
        expect(grainsEl.hasAttribute('aria-expanded')).toBe(false);
        expect(getFocusedTreeItemValue()).toBe('grains');
      });

      it('should not expand a non-expandable item with expand key', () => {
        const grainsEl = getTreeItemElementByValue('grains')!;
        down();
        down();
        expect(getFocusedTreeItemValue()).toBe('grains');

        right();
        expect(grainsEl.hasAttribute('aria-expanded')).toBe(false);
        expect(getFocusedTreeItemValue()).toBe('grains');
      });

      it('should not expand/collapse if item is disabled', () => {
        updateTreeItemByValue('fruits', {disabled: true});
        const fruitsEl = getTreeItemElementByValue('fruits')!;

        click(fruitsEl);
        expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');

        right();
        expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');
      });

      it('should not expand/collapse if tree is disabled', () => {
        updateTree({disabled: true});
        const fruitsEl = getTreeItemElementByValue('fruits')!;

        click(fruitsEl);
        expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');

        right();
        expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');
      });

      it('should do nothing on collapseKey if item is collapsed and is a root item', () => {
        const fruitsEl = getTreeItemElementByValue('fruits')!;
        expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');
        expect(getFocusedTreeItemValue()).toBe('fruits');

        left();
        expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');
        expect(getFocusedTreeItemValue()).toBe('fruits');
      });
    });

    describe('RTL', () => {
      beforeEach(() => {
        setupTestTree('rtl');
      });

      describe('orientation="vertical"', () => {
        it('should expand a collapsed item with ArrowLeft', () => {
          const fruitsEl = getTreeItemElementByValue('fruits')!;
          expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');
          left();
          expect(fruitsEl.getAttribute('aria-expanded')).toBe('true');
        });

        it('should collapse an expanded item with ArrowRight', () => {
          left();
          const fruitsEl = getTreeItemElementByValue('fruits')!;
          expect(fruitsEl.getAttribute('aria-expanded')).toBe('true');

          right();
          expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');
        });
      });
    });
  });

  describe('keyboard navigation', () => {
    for (const focusMode of ['roving', 'activedescendant'] as const) {
      const isFocused = (value: string) => getFocusedTreeItemValue() === value;

      describe(`focusMode="${focusMode}"`, () => {
        describe('LTR', () => {
          beforeEach(() => {
            setupTestTree('ltr');
            updateTree({focusMode});
          });

          describe('vertical orientation', () => {
            beforeEach(() => {
              updateTree({orientation: 'vertical'});
            });

            it('should move focus to the next visible item on ArrowDown', () => {
              expect(isFocused('fruits')).toBe(true);
              right(); // Expands fruits
              down();
              expect(isFocused('apple')).toBe(true);
              down();
              expect(isFocused('banana')).toBe(true);
            });

            it('should move focus to the previous visible item on ArrowUp', () => {
              expect(isFocused('fruits')).toBe(true);
              right(); // Expands fruits
              down();
              down();
              expect(isFocused('banana')).toBe(true);
              up();
              expect(isFocused('apple')).toBe(true);
              up();
              expect(isFocused('fruits')).toBe(true);
            });

            it('should skip disabled items with ArrowDown if skipDisabled=true', () => {
              right(); // Expands fruits
              updateTreeItemByValue('apple', {disabled: true});
              updateTree({skipDisabled: true});

              expect(isFocused('fruits')).toBe(true);
              down();
              expect(isFocused('banana')).toBe(true);
            });

            it('should not skip disabled items with ArrowDown if skipDisabled=false', () => {
              right(); // Expands fruits
              updateTreeItemByValue('apple', {disabled: true});
              updateTree({skipDisabled: false});

              expect(isFocused('fruits')).toBe(true);
              down();
              expect(isFocused('apple')).toBe(true);
            });

            it('should wrap focus from last to first with ArrowDown when wrap is true', () => {
              updateTree({wrap: true});
              end();
              expect(isFocused('dairy')).toBe(true);
              down();
              expect(isFocused('fruits')).toBe(true);
            });

            it('should not wrap focus from last to first with ArrowDown when wrap is false', () => {
              updateTree({wrap: false});
              end();
              expect(isFocused('dairy')).toBe(true);
              down();
              expect(isFocused('dairy')).toBe(true);
            });
          });

          describe('horizontal orientation', () => {
            beforeEach(() => {
              updateTree({orientation: 'horizontal'});
            });

            it('should move focus to the next visible item on ArrowRight', () => {
              expect(isFocused('fruits')).toBe(true);
              right();
              expect(isFocused('vegetables')).toBe(true);
            });

            it('should move focus to the previous visible item on ArrowLeft', () => {
              right();
              expect(isFocused('vegetables')).toBe(true);
              left();
              expect(isFocused('fruits')).toBe(true);
            });
          });

          it('should move focus to the last enabled visible item on End', () => {
            right(); // Expands fruits
            updateTreeItemByValue('dairy', {disabled: true});
            updateTreeItemByValue('grains', {disabled: true});
            updateTreeItemByValue('vegetables', {disabled: true});
            end();
            expect(isFocused('berries')).toBe(true);
          });

          it('should move focus to the first enabled visible item on Home', () => {
            end();
            updateTreeItemByValue('fruits', {disabled: true});
            home();
            expect(isFocused('vegetables')).toBe(true);
          });
        });

        describe('RTL', () => {
          beforeEach(() => {
            setupTestTree('rtl');
            updateTree({focusMode});
          });

          describe('vertical orientation', () => {
            beforeEach(() => {
              updateTree({orientation: 'vertical'});
            });

            it('should move focus to the next visible item on ArrowDown', () => {
              expect(isFocused('fruits')).toBe(true);
              down();
              expect(isFocused('vegetables')).toBe(true);
            });

            it('should move focus to the previous visible item on ArrowUp', () => {
              down();
              expect(isFocused('vegetables')).toBe(true);
              up();
              expect(isFocused('fruits')).toBe(true);
            });
          });

          describe('horizontal orientation', () => {
            beforeEach(() => {
              updateTree({orientation: 'horizontal'});
            });

            it('should move focus to the next visible item on ArrowLeft', () => {
              expect(isFocused('fruits')).toBe(true);
              left();
              expect(isFocused('vegetables')).toBe(true);
            });

            it('should move focus to the previous visible item on ArrowRight', () => {
              left();
              expect(isFocused('vegetables')).toBe(true);
              right();
              expect(isFocused('fruits')).toBe(true);
            });
          });
        });

        describe('pointer navigation', () => {
          beforeEach(() => setupTestTree());

          it('should move focus to the clicked item', () => {
            const vegetablesEl = getTreeItemElementByValue('vegetables')!;
            click(vegetablesEl);
            expect(isFocused('vegetables')).toBe(true);
          });

          it('should move focus to the clicked disabled item if skipDisabled=false', () => {
            updateTreeItemByValue('vegetables', {disabled: true});
            updateTree({skipDisabled: false});
            const vegetablesEl = getTreeItemElementByValue('vegetables')!;
            click(vegetablesEl);
            expect(isFocused('vegetables')).toBe(true);
          });
        });

        describe('typeahead functionality', () => {
          beforeEach(() => setupTestTree()); // LTR by default

          it('should focus the first matching visible item when typing characters', () => {
            right(); // Expands fruits
            type('Ba');
            expect(isFocused('banana')).toBe(true);
          });

          it('should select the focused item if selectionMode is "follow"', () => {
            updateTree({selectionMode: 'follow'});
            type('Gr');
            expect(isFocused('grains')).toBe(true);
            expect(treeInstance.value()).toEqual(['grains']);
          });

          it('should not select the focused item if selectionMode is "explicit"', () => {
            updateTree({selectionMode: 'explicit'});
            type('Gr');
            expect(isFocused('grains')).toBe(true);
            expect(treeInstance.value()).toEqual([]);
          });

          it('should skip disabled items with typeahead if skipDisabled=true', () => {
            right(); // Expands fruits
            updateTreeItemByValue('banana', {disabled: true});
            updateTree({skipDisabled: true});
            type('B');
            expect(isFocused('berries')).toBe(true);
          });

          it('should focus disabled items with typeahead if skipDisabled=false', () => {
            updateTreeItemByValue('vegetables', {disabled: true});
            updateTree({skipDisabled: false});
            type('V');
            expect(isFocused('vegetables')).toBe(true);
          });
        });
      });
    }
  });
});

interface TestTreeNode<V = string> {
  value: V;
  label: string;
  disabled?: boolean;
  children?: TestTreeNode<V>[];
  preserveContent?: boolean;
}

@Component({
  template: `
    <ul
      cdkTree
      [focusMode]="focusMode()"
      [selectionMode]="selectionMode()"
      [multi]="multi()"
      [wrap]="wrap()"
      [skipDisabled]="skipDisabled()"
      [orientation]="orientation()"
      [disabled]="disabled()"
      [(value)]="value"
      [nav]="nav()"
      [currentType]="currentType()"
      #tree="cdkTree"
    >
      @for (node of nodes(); track node.value) {
        <ng-template [ngTemplateOutlet]="nodeTemplate" [ngTemplateOutletContext]="{ node: node, parent: tree }" />
      }
    </ul>

    <ng-template #nodeTemplate let-node="node" let-parent="parent">
      <li
        cdkTreeItem
        [value]="node.value"
        [label]="node.label"
        [disabled]="!!node.disabled"
        [parent]="parent"
        [attr.data-value]="node.value"
        #treeItem="cdkTreeItem"
      >
        {{ node.label }}
        @if (node.children !== undefined && node.children!.length > 0) {
          <ul
            cdkTreeItemGroup
            [ownedBy]="treeItem"
            [preserveContent]="!!node.preserveContent"
            [attr.data-group-for]="node.value"
            #group="cdkTreeItemGroup">
            <ng-template cdkTreeItemGroupContent>
              @for (node of node.children; track node.value) {
                <ng-template [ngTemplateOutlet]="nodeTemplate" [ngTemplateOutletContext]="{ node: node, parent: group }" />
              }
            </ng-template>
          </ul>
        }
      </li>
    </ng-template>
  `,
  imports: [CdkTree, CdkTreeItem, CdkTreeItemGroup, CdkTreeItemGroupContent, NgTemplateOutlet],
})
class TestTreeComponent {
  nodes = signal<TestTreeNode[]>([
    {
      value: 'fruits',
      label: 'Fruits',
      children: [
        {value: 'apple', label: 'Apple'},
        {value: 'banana', label: 'Banana'},
        {
          value: 'berries',
          label: 'Berries',
          children: [
            {value: 'strawberry', label: 'Strawberry'},
            {value: 'blueberry', label: 'Blueberry'},
          ],
        },
      ],
    },
    {
      value: 'vegetables',
      label: 'Vegetables',
      children: [
        {value: 'carrot', label: 'Carrot'},
        {value: 'broccoli', label: 'Broccoli'},
      ],
    },
    {value: 'grains', label: 'Grains'},
    {value: 'dairy', label: 'Dairy'},
  ]);
  value = signal<string[]>([]);
  disabled = signal(false);
  orientation = signal<'vertical' | 'horizontal'>('vertical');
  multi = signal(false);
  wrap = signal(true);
  skipDisabled = signal(true);
  focusMode = signal<'roving' | 'activedescendant'>('roving');
  selectionMode = signal<'explicit' | 'follow'>('explicit');
  nav = signal(false);
  currentType = signal('page');
}
