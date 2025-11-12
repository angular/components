import {Component, signal} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Direction} from '@angular/cdk/bidi';
import {provideFakeDirectionality, runAccessibilityChecks} from '@angular/cdk/testing/private';
import {Tree, TreeItem, TreeItemGroup} from './tree';

interface ModifierKeys {
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

describe('Tree', () => {
  let fixture: ComponentFixture<TestTreeComponent>;
  let testComponent: TestTreeComponent;
  let treeElement: HTMLElement;
  let treeInstance: Tree<string>;
  let treeItemElements: HTMLElement[];

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
    const treeDebugElement = fixture.debugElement.query(By.directive(Tree));
    const treeItemDebugElements = fixture.debugElement.queryAll(By.directive(TreeItem));

    treeElement = treeDebugElement.nativeElement as HTMLElement;
    treeInstance = treeDebugElement.componentInstance as Tree<string>;
    treeItemElements = treeItemDebugElements.map(debugEl => debugEl.nativeElement);
  }

  function updateTree(
    config: {
      nodes?: TestTreeNode[];
      values?: string[];
      disabled?: boolean;
      orientation?: 'horizontal' | 'vertical';
      multi?: boolean;
      wrap?: boolean;
      softDisabled?: boolean;
      focusMode?: 'roving' | 'activedescendant';
      selectionMode?: 'follow' | 'explicit';
      nav?: boolean;
      currentType?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
    } = {},
  ) {
    if (config.nodes !== undefined) testComponent.nodes.set(config.nodes);
    if (config.values !== undefined) treeInstance.values.set(config.values);
    if (config.disabled !== undefined) testComponent.disabled.set(config.disabled);
    if (config.orientation !== undefined) testComponent.orientation.set(config.orientation);
    if (config.multi !== undefined) testComponent.multi.set(config.multi);
    if (config.wrap !== undefined) testComponent.wrap.set(config.wrap);
    if (config.softDisabled !== undefined) testComponent.softDisabled.set(config.softDisabled);
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
          if (config.selectable !== undefined) node.selectable = config.selectable;
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

  function expandAll() {
    const fruitsEl = getTreeItemElementByValue('fruits')!;
    click(fruitsEl);
    const berriesEl = getTreeItemElementByValue('berries')!;
    click(berriesEl);
    const vegetablesEl = getTreeItemElementByValue('vegetables')!;
    click(vegetablesEl);
    updateTree({values: []});
  }

  afterEach(async () => {
    fixture.detectChanges();
    await runAccessibilityChecks(fixture.nativeElement);
  });

  describe('ARIA attributes and roles', () => {
    describe('default configuration', () => {
      beforeEach(() => {
        setupTestTree();
      });

      it('should correctly set the role attribute to "tree" for Tree', () => {
        expect(treeElement.getAttribute('role')).toBe('tree');
      });

      it('should correctly set the role attribute to "treeitem" for TreeItem', () => {
        expandAll();

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
        expandAll();

        const fruits = getTreeItemElementByValue('fruits')!;
        expect(fruits.getAttribute('aria-level')).toBe('1');
        expect(fruits.getAttribute('aria-setsize')).toBe('4');
        expect(fruits.getAttribute('aria-posinset')).toBe('1');
        expect(fruits.getAttribute('aria-expanded')).toBe('true');

        const vegetables = getTreeItemElementByValue('vegetables')!;
        expect(vegetables.getAttribute('aria-level')).toBe('1');
        expect(vegetables.getAttribute('aria-setsize')).toBe('4');
        expect(vegetables.getAttribute('aria-posinset')).toBe('2');
        expect(vegetables.getAttribute('aria-expanded')).toBe('true');

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
        expect(berries.getAttribute('aria-expanded')).toBe('true');

        const strawberry = getTreeItemElementByValue('strawberry')!;
        expect(strawberry.getAttribute('aria-level')).toBe('3');
        expect(strawberry.getAttribute('aria-setsize')).toBe('2');
        expect(strawberry.getAttribute('aria-posinset')).toBe('1');
      });
    });

    describe('custom configuration', () => {
      beforeEach(() => {
        setupTestTree();
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
        expandAll();
        updateTree({values: ['apple']});

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
        expandAll();
        updateTree({nav: true, values: ['apple']});

        const appleItem = getTreeItemElementByValue('apple')!;
        const bananaItem = getTreeItemElementByValue('banana')!;
        expect(appleItem.getAttribute('aria-current')).toBe('page');
        expect(bananaItem.hasAttribute('aria-current')).toBe(false);

        updateTree({currentType: 'location'});
        expect(appleItem.getAttribute('aria-current')).toBe('location');
      });

      it('should not set aria-current when not selectable', () => {
        expandAll();
        updateTree({nav: true, values: ['apple']});
        const appleItem = getTreeItemElementByValue('apple')!;
        expect(appleItem.getAttribute('aria-current')).toBe('page');

        updateTreeItemByValue('apple', {selectable: false});
        expect(appleItem.hasAttribute('aria-current')).toBe(false);
      });

      it('should not set aria-selected when nav="true"', () => {
        expandAll();

        updateTree({values: ['apple'], nav: true});
        const appleItem = getTreeItemElementByValue('apple')!;
        expect(appleItem.hasAttribute('aria-selected')).toBe(false);

        updateTree({nav: false});
        expect(appleItem.getAttribute('aria-selected')).toBe('true');
      });

      it('should not set aria-selected when not selectable', () => {
        expandAll();
        updateTree({values: ['apple']});
        const appleItem = getTreeItemElementByValue('apple')!;
        expect(appleItem.getAttribute('aria-selected')).toBe('true');

        updateTreeItemByValue('apple', {selectable: false});
        expect(appleItem.hasAttribute('aria-selected')).toBe(false);
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

      it('should set tabindex="0" for the tree when disabled when softDisabled is false', () => {
        updateTree({disabled: true, focusMode: 'roving', softDisabled: false});

        expect(treeElement.getAttribute('tabindex')).toBe('0');
      });

      it('should set tabindex="0" for the tree when disabled when softDisabled is true', () => {
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
        updateTree({values: ['vegetables', 'dairy'], focusMode: 'roving'});

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
        updateTree({values: ['vegetables', 'dairy'], focusMode: 'activedescendant'});

        const vegetablesItem = getTreeItemElementByValue('vegetables')!;
        expect(treeElement.getAttribute('aria-activedescendant')).toBe(vegetablesItem.id);
      });

      it('should set tabindex="-1" for all items', () => {
        expandAll();

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
      expandAll();
      updateTree({values: ['apple', 'strawberry', 'carrot']});

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
          expect(treeInstance.values()).toEqual(['apple']);
          expect(appleEl.getAttribute('aria-selected')).toBe('true');
          expect(bananaEl.getAttribute('aria-selected')).toBe('false');

          click(bananaEl);
          expect(treeInstance.values()).toEqual(['banana']);
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
            expect(treeInstance.values()).toEqual(['apple']);
            expect(appleEl.getAttribute('aria-selected')).toBe('true');

            shiftClick(carrotEl);
            expect(treeInstance.values()).toEqual([
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
            expect(treeInstance.values()).toEqual(['apple']);

            click(bananaEl);
            expect(treeInstance.values()).toEqual(['apple', 'banana']);

            click(appleEl);
            expect(treeInstance.values()).toEqual(['banana']);
          });

          describe('selectable=false', () => {
            it('should not select an item on click', () => {
              updateTree({values: ['banana']});
              updateTreeItemByValue('apple', {selectable: false});
              const appleEl = getTreeItemElementByValue('apple')!;

              click(appleEl);
              expect(treeInstance.values()).not.toContain('apple');
              expect(treeInstance.values()).toContain('banana');
            });
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
            expect(treeInstance.values()).toEqual(['apple', 'banana']);

            click(carrotEl);
            expect(treeInstance.values()).toEqual(['carrot']);

            click(appleEl);
            expect(treeInstance.values()).toEqual(['apple']);
          });

          it('should add to selection with ctrl+click and toggle individual items', () => {
            const appleEl = getTreeItemElementByValue('apple')!;
            const berriesEl = getTreeItemElementByValue('berries')!;

            click(appleEl);
            expect(treeInstance.values()).toEqual(['apple']);

            ctrlClick(berriesEl);
            expect(treeInstance.values()).toEqual(['apple', 'berries']);

            ctrlClick(appleEl);
            expect(treeInstance.values()).toEqual(['berries']);
          });

          it('should select a range with shift+click, anchoring from last selected/focused', () => {
            const appleEl = getTreeItemElementByValue('apple')!;
            const berriesEl = getTreeItemElementByValue('berries')!;
            const carrotEl = getTreeItemElementByValue('carrot')!;
            const broccoliEl = getTreeItemElementByValue('broccoli')!;

            click(appleEl);
            expect(treeInstance.values()).toEqual(['apple']);

            shiftClick(carrotEl);
            expect(treeInstance.values()).toEqual([
              'apple',
              'banana',
              'berries',
              'vegetables',
              'carrot',
            ]);

            click(berriesEl);
            expect(treeInstance.values()).toEqual(['berries']);

            shiftClick(broccoliEl);
            expect(treeInstance.values()).toEqual([
              'berries',
              'strawberry',
              'blueberry',
              'vegetables',
              'carrot',
              'broccoli',
            ]);
          });

          describe('selectable=false', () => {
            it('should not select a range with shift+click if an item is not selectable', () => {
              updateTreeItemByValue('banana', {selectable: false});
              const appleEl = getTreeItemElementByValue('apple')!;
              const berriesEl = getTreeItemElementByValue('berries')!;

              click(appleEl);
              shiftClick(berriesEl);

              expect(treeInstance.values()).not.toContain('banana');
              expect(treeInstance.values()).toContain('apple');
              expect(treeInstance.values()).toContain('berries');
            });

            it('should not toggle selection of an item on simple click', () => {
              updateTreeItemByValue('apple', {selectable: false});
              const appleEl = getTreeItemElementByValue('apple')!;

              click(appleEl);
              expect(treeInstance.values()).not.toContain('apple');
            });

            it('should not add to selection with ctrl+click', () => {
              updateTree({values: ['banana']});
              updateTreeItemByValue('apple', {selectable: false});
              const appleEl = getTreeItemElementByValue('apple')!;

              ctrlClick(appleEl);
              expect(treeInstance.values()).not.toContain('apple');
              expect(treeInstance.values()).toContain('banana');
            });
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
            expect(treeInstance.values()).toEqual(['fruits']);

            down();
            enter();
            expect(treeInstance.values()).toEqual(['vegetables']);
          });

          it('should select the focused item with Space and deselect others', () => {
            space();
            expect(treeInstance.values()).toEqual(['fruits']);

            down();
            space();
            expect(treeInstance.values()).toEqual(['vegetables']);
          });

          it('should move focus with arrows without changing selection until Enter/Space', () => {
            enter();
            expect(treeInstance.values()).toEqual(['fruits']);

            down();
            expect(treeInstance.values()).toEqual(['fruits']);

            down();
            expect(treeInstance.values()).toEqual(['fruits']);

            enter();
            expect(treeInstance.values()).toEqual(['grains']);
          });

          describe('selectable=false', () => {
            it('should not select the focused item with Enter', () => {
              updateTreeItemByValue('fruits', {selectable: false});
              enter();
              expect(treeInstance.values()).toEqual([]);
            });

            it('should not select the focused item with Space', () => {
              updateTreeItemByValue('fruits', {selectable: false});
              space();
              expect(treeInstance.values()).toEqual([]);
            });
          });
        });

        describe('selectionMode="follow"', () => {
          beforeEach(() => {
            updateTree({selectionMode: 'follow'});
          });

          it('should select an item when it becomes focused with ArrowDown and deselect others', () => {
            updateTree({values: ['fruits']});
            expect(treeInstance.values()).toEqual(['fruits']);

            down();
            expect(treeInstance.values()).toEqual(['vegetables']);

            down();
            expect(treeInstance.values()).toEqual(['grains']);
          });

          it('should select an item when it becomes focused with ArrowUp and deselect others', () => {
            updateTree({values: ['grains']});

            up();
            expect(treeInstance.values()).toEqual(['vegetables']);
          });

          it('should select the first item with Home and deselect others', () => {
            updateTree({values: ['grains']});
            expect(treeInstance.values()).toEqual(['grains']);

            home();
            expect(treeInstance.values()).toEqual(['fruits']);
          });

          it('should select the last visible item with End and deselect others', () => {
            updateTree({values: ['fruits']});
            expect(treeInstance.values()).toEqual(['fruits']);

            end();
            expect(treeInstance.values()).toEqual(['dairy']);
          });

          it('should select an item via typeahead and deselect others', () => {
            updateTree({values: ['fruits']});
            expect(treeInstance.values()).toEqual(['fruits']);

            type('V');
            expect(treeInstance.values()).toEqual(['vegetables']);
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
            expect(treeInstance.values()).toEqual(['fruits']);

            down();
            space();
            expect(treeInstance.values().sort()).toEqual(['fruits', 'vegetables']);
          });

          it('should move focus with arrows without changing selection', () => {
            space();
            expect(treeInstance.values()).toEqual(['fruits']);

            down();
            expect(treeInstance.values()).toEqual(['fruits']);
          });

          it('should extend selection downwards with Shift+ArrowDown', () => {
            shift();
            down({shiftKey: true});
            expect(treeInstance.values().sort()).toEqual(['fruits', 'vegetables']);

            down({shiftKey: true});
            expect(treeInstance.values().sort()).toEqual(['fruits', 'grains', 'vegetables']);
          });

          it('should extend selection upwards with Shift+ArrowUp', () => {
            end();
            shift();
            up({shiftKey: true});
            expect(treeInstance.values().sort()).toEqual(['dairy', 'grains']);
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
            expect(treeInstance.values().sort()).toEqual([
              'apple',
              'banana',
              'berries',
              'dairy',
              'fruits',
              'grains',
              'vegetables',
            ]);

            keydown('A', {ctrlKey: true});
            expect(treeInstance.values()).toEqual([]);
          });

          it('Ctrl+ArrowKey should move focus without changing selection', () => {
            space();
            expect(treeInstance.values()).toEqual(['fruits']);

            down({ctrlKey: true});
            expect(treeInstance.values()).toEqual(['fruits']);

            up({ctrlKey: true});
            expect(treeInstance.values()).toEqual(['fruits']);
          });

          describe('selectable=false', () => {
            it('should not toggle selection of the focused item with Space', () => {
              updateTreeItemByValue('fruits', {selectable: false});
              space();
              expect(treeInstance.values()).toEqual([]);
            });

            it('should not extend selection with Shift+ArrowDown', () => {
              updateTreeItemByValue('vegetables', {selectable: false});
              shift();
              down({shiftKey: true});
              down({shiftKey: true});
              expect(treeInstance.values()).not.toContain('vegetables');
              expect(treeInstance.values().sort()).toEqual(['fruits', 'grains']);
            });

            it('Ctrl+A should not select non-selectable items', () => {
              expandAll();
              updateTreeItemByValue('apple', {selectable: false});
              updateTreeItemByValue('carrot', {selectable: false});
              keydown('A', {ctrlKey: true});
              const value = treeInstance.values();
              expect(value).not.toContain('apple');
              expect(value).not.toContain('carrot');
              expect(value).toContain('banana');
              expect(value).toContain('broccoli');
            });
          });
        });

        describe('selectionMode="follow"', () => {
          beforeEach(() => {
            updateTree({selectionMode: 'follow'});
          });

          it('should select the focused item and deselect others on ArrowDown', () => {
            updateTree({values: ['fruits']});
            expect(treeInstance.values()).toEqual(['fruits']);

            down();
            expect(treeInstance.values()).toEqual(['vegetables']);
          });

          it('should select the focused item and deselect others on ArrowUp', () => {
            updateTree({values: ['vegetables']});
            expect(treeInstance.values()).toEqual(['vegetables']);

            up();
            expect(treeInstance.values()).toEqual(['fruits']);
          });

          it('should move focus without changing selection on Ctrl+ArrowDown', () => {
            updateTree({values: ['fruits']});
            expect(getFocusedTreeItemValue()).toBe('fruits');

            down({ctrlKey: true});
            expect(treeInstance.values()).toEqual(['fruits']);
            expect(getFocusedTreeItemValue()).toBe('vegetables');
          });

          it('should move focus without changing selection on Ctrl+ArrowUp', () => {
            updateTree({values: ['fruits']});

            down({ctrlKey: true});
            expect(getFocusedTreeItemValue()).toBe('vegetables');

            up({ctrlKey: true});
            expect(treeInstance.values()).toEqual(['fruits']);
            expect(getFocusedTreeItemValue()).toBe('fruits');
          });

          it('should toggle selection of the focused item on Ctrl+Space, adding to existing selection', () => {
            updateTree({values: ['fruits']});
            down({ctrlKey: true});
            expect(getFocusedTreeItemValue()).toBe('vegetables');

            space({ctrlKey: true});
            expect(treeInstance.values().sort()).toEqual(['fruits', 'vegetables']);

            space({ctrlKey: true});
            expect(treeInstance.values()).toEqual(['fruits']);
          });

          it('should toggle selection of the focused item on Ctrl+Enter, adding to existing selection', () => {
            updateTree({values: ['fruits']});
            down({ctrlKey: true});
            expect(getFocusedTreeItemValue()).toBe('vegetables');

            enter({ctrlKey: true});
            expect(treeInstance.values().sort()).toEqual(['fruits', 'vegetables']);

            enter({ctrlKey: true});
            expect(treeInstance.values()).toEqual(['fruits']);
          });

          it('should extend selection downwards with Shift+ArrowDown', () => {
            right(); // Expands fruits
            updateTree({values: ['fruits']});

            shift();
            down({shiftKey: true});
            expect(treeInstance.values().sort()).toEqual(['apple', 'fruits']);

            down({shiftKey: true});
            expect(treeInstance.values().sort()).toEqual(['apple', 'banana', 'fruits']);
          });

          it('should extend selection upwards with Shift+ArrowUp', () => {
            updateTree({values: ['grains']});

            shift();
            up({shiftKey: true});
            expect(treeInstance.values().sort()).toEqual(['grains', 'vegetables']);

            up({shiftKey: true});
            expect(treeInstance.values().sort()).toEqual(['fruits', 'grains', 'vegetables']);
          });

          it('should select a range with Shift+Space, anchoring from last selected/focused item', () => {
            right(); // Expands fruits
            updateTree({values: ['fruits']});

            down({ctrlKey: true});
            down({ctrlKey: true});
            expect(getFocusedTreeItemValue()).toBe('banana');

            space({shiftKey: true});
            expect(treeInstance.values().sort()).toEqual(['apple', 'banana', 'fruits']);
          });

          it('Ctrl+A: select all enabled visible items; second Ctrl+A deselects all except focused', () => {
            right(); // Expands fruits
            updateTreeItemByValue('vegetables', {disabled: true});

            keydown('A', {ctrlKey: true});
            expect(treeInstance.values().sort()).toEqual([
              'apple',
              'banana',
              'berries',
              'dairy',
              'fruits',
              'grains',
            ]);

            keydown('A', {ctrlKey: true});
            expect(treeInstance.values()).toEqual(['fruits']);
          });

          it('typeahead should select the focused item and deselect others', () => {
            updateTree({values: ['fruits']});
            type('V');
            expect(treeInstance.values()).toEqual(['vegetables']);
            expect(getFocusedTreeItemValue()).toBe('vegetables');
          });

          describe('selectable=false', () => {
            it('should not select an item on ArrowDown', () => {
              updateTreeItemByValue('vegetables', {selectable: false});
              down();
              expect(treeInstance.values()).not.toContain('vegetables');
              expect(treeInstance.values()).toEqual([]);
            });

            it('should not toggle selection of the focused item on Ctrl+Space', () => {
              updateTreeItemByValue('fruits', {selectable: false});
              space({ctrlKey: true});
              expect(treeInstance.values()).toEqual([]);
            });

            it('should not extend selection with Shift+ArrowDown', () => {
              updateTreeItemByValue('vegetables', {selectable: false});
              shift();
              down({shiftKey: true});
              down({shiftKey: true});
              expect(treeInstance.values()).not.toContain('vegetables');
              expect(treeInstance.values().sort()).toEqual(['fruits', 'grains']);
            });

            it('typeahead should not select the focused item', () => {
              updateTreeItemByValue('vegetables', {selectable: false});
              type('v');
              expect(getFocusedTreeItemValue()).toBe('vegetables');
              expect(treeInstance.values()).not.toContain('vegetables');
            });
          });

          it('should not select disabled items during Shift+ArrowKey navigation even if softDisabled is true', () => {
            right(); // Expands fruits
            updateTreeItemByValue('banana', {disabled: true});
            updateTree({values: ['apple'], softDisabled: true});
            expect(getFocusedTreeItemValue()).toBe('apple');

            keydown('Shift');
            down({shiftKey: true});
            expect(getFocusedTreeItemValue()).toBe('banana');
            expect(treeInstance.values().sort()).toEqual(['apple']);

            down({shiftKey: true}); // Focus 'berries'
            expect(getFocusedTreeItemValue()).toBe('berries');
            expect(treeInstance.values().sort()).toEqual(['apple', 'berries']);
          });

          it('should not change selection if tree is disabled', () => {
            updateTree({values: ['fruits'], disabled: true});
            down();
            expect(treeInstance.values()).toEqual(['fruits']);
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

            it('should skip disabled items with ArrowDown if softDisabled=false', () => {
              right(); // Expands fruits
              updateTreeItemByValue('apple', {disabled: true});
              updateTree({softDisabled: false});

              expect(isFocused('fruits')).toBe(true);
              down();
              expect(isFocused('banana')).toBe(true);
            });

            it('should not skip disabled items with ArrowDown if softDisabled=true', () => {
              right(); // Expands fruits
              updateTreeItemByValue('apple', {disabled: true});
              updateTree({softDisabled: true});

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

          it('should move focus to the last enabled visible item on End (softDisabled="false")', () => {
            updateTree({softDisabled: false});
            right(); // Expands fruits
            updateTreeItemByValue('dairy', {disabled: true});
            updateTreeItemByValue('grains', {disabled: true});
            updateTreeItemByValue('vegetables', {disabled: true});
            end();
            expect(isFocused('berries')).toBe(true);
          });

          it('should move focus to the first enabled visible item on Home (softDisabled="false")', () => {
            updateTree({softDisabled: false});
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

          it('should move focus to the clicked disabled item if softDisabled=true', () => {
            updateTreeItemByValue('vegetables', {disabled: true});
            updateTree({softDisabled: true});
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
            expect(treeInstance.values()).toEqual(['grains']);
          });

          it('should not select the focused item if selectionMode is "explicit"', () => {
            updateTree({selectionMode: 'explicit'});
            type('Gr');
            expect(isFocused('grains')).toBe(true);
            expect(treeInstance.values()).toEqual([]);
          });

          it('should skip disabled items with typeahead if softDisabled=false', () => {
            right(); // Expands fruits
            updateTreeItemByValue('banana', {disabled: true});
            updateTree({softDisabled: false});
            type('B');
            expect(isFocused('berries')).toBe(true);
          });

          it('should focus disabled items with typeahead if softDisabled=true', () => {
            updateTreeItemByValue('vegetables', {disabled: true});
            updateTree({softDisabled: true});
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
  selectable?: boolean;
  children?: TestTreeNode<V>[];
}

@Component({
  template: `
    <ul
      ngTree
      [focusMode]="focusMode()"
      [selectionMode]="selectionMode()"
      [multi]="multi()"
      [wrap]="wrap()"
      [softDisabled]="softDisabled()"
      [orientation]="orientation()"
      [disabled]="disabled()"
      [(values)]="values"
      [nav]="nav()"
      [currentType]="currentType()"
      #tree="ngTree"
    >
      @for (node of nodes(); track node.value) {
        <ng-template [ngTemplateOutlet]="nodeTemplate" [ngTemplateOutletContext]="{ node: node, parent: tree }" />
      }
    </ul>

    <ng-template #nodeTemplate let-node="node" let-parent="parent">
      <li
        ngTreeItem
        [value]="node.value"
        [label]="node.label"
        [disabled]="!!node.disabled"
        [selectable]="node.selectable ?? true"
        [parent]="parent"
        [attr.data-value]="node.value"
        #treeItem="ngTreeItem"
      >
        {{ node.label }}
        @if (node.children !== undefined && node.children!.length > 0) {
          <ul role="group">
            <ng-template
              ngTreeItemGroup
              [ownedBy]="treeItem"
              #group="ngTreeItemGroup">
              @for (node of node.children; track node.value) {
                <ng-template [ngTemplateOutlet]="nodeTemplate" [ngTemplateOutletContext]="{ node: node, parent: group }" />
              }
            </ng-template>
          </ul>
        }
      </li>
    </ng-template>
  `,
  imports: [Tree, TreeItem, TreeItemGroup, NgTemplateOutlet],
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
  values = signal<string[]>([]);
  disabled = signal(false);
  orientation = signal<'vertical' | 'horizontal'>('vertical');
  multi = signal(false);
  wrap = signal(true);
  softDisabled = signal(true);
  focusMode = signal<'roving' | 'activedescendant'>('roving');
  selectionMode = signal<'explicit' | 'follow'>('explicit');
  nav = signal(false);
  currentType = signal('page' as 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false');
}
