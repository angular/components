import {Component, signal, ChangeDetectionStrategy} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Direction} from '@angular/cdk/bidi';
import {provideFakeDirectionality, runAccessibilityChecks} from '@angular/cdk/testing/private';
import {Tree} from './tree';
import {TreeItem} from './tree-item';
import {TreeItemGroup} from './tree-item-group';
import {waitForMicrotasks} from '../private/testing/test-helpers';

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

  const keydown = async (key: string, modifierKeys: ModifierKeys = {}) => {
    const event = new KeyboardEvent('keydown', {key, bubbles: true, ...modifierKeys});
    treeElement.dispatchEvent(event);
    await fixture.whenStable();
    defineTestVariables();
  };

  const up = async (modifierKeys?: ModifierKeys) => await keydown('ArrowUp', modifierKeys);
  const down = async (modifierKeys?: ModifierKeys) => await keydown('ArrowDown', modifierKeys);
  const left = async (modifierKeys?: ModifierKeys) => await keydown('ArrowLeft', modifierKeys);
  const right = async (modifierKeys?: ModifierKeys) => await keydown('ArrowRight', modifierKeys);
  const home = async (modifierKeys?: ModifierKeys) => await keydown('Home', modifierKeys);
  const end = async (modifierKeys?: ModifierKeys) => await keydown('End', modifierKeys);
  const enter = async (modifierKeys?: ModifierKeys) => await keydown('Enter', modifierKeys);
  const space = async (modifierKeys?: ModifierKeys) => await keydown(' ', modifierKeys);
  const shift = async () => await keydown('Shift');
  const type = async (chars: string) => {
    for (const char of chars) {
      await keydown(char);
    }
  };
  const clickHelper = async (target: HTMLElement, eventInit: PointerEventInit = {}) => {
    target.dispatchEvent(
      new PointerEvent('click', {
        bubbles: true,
        ...eventInit,
      }),
    );
    await fixture.whenStable();
    defineTestVariables();
  };
  const click = async (target: HTMLElement) => await clickHelper(target);
  const shiftClick = async (target: HTMLElement) => await clickHelper(target, {shiftKey: true});
  const ctrlClick = async (target: HTMLElement) => await clickHelper(target, {ctrlKey: true});

  async function setupTestTree(textDirection: Direction = 'ltr') {
    TestBed.configureTestingModule({
      providers: [provideFakeDirectionality(textDirection)],
    });

    fixture = TestBed.createComponent(TestTreeComponent);
    testComponent = fixture.componentInstance;

    await fixture.whenStable();
    defineTestVariables();
  }

  function defineTestVariables() {
    const treeDebugElement = fixture.debugElement.query(By.directive(Tree));
    const treeItemDebugElements = fixture.debugElement.queryAll(By.directive(TreeItem));

    treeElement = treeDebugElement.nativeElement as HTMLElement;
    treeInstance = treeDebugElement.componentInstance as Tree<string>;
    treeItemElements = treeItemDebugElements.map(debugEl => debugEl.nativeElement);
  }

  async function updateTree(
    config: {
      nodes?: TestTreeNode[];
      value?: string[];
      disabled?: boolean;
      orientation?: 'horizontal' | 'vertical';
      multi?: boolean;
      wrap?: boolean;
      softDisabled?: boolean;
      focusMode?: 'roving' | 'activedescendant';
      selectionMode?: 'follow' | 'explicit';
      nav?: boolean;
      currentType?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
      tabIndex?: number;
    } = {},
  ) {
    if (config.nodes !== undefined) testComponent.nodes.set(config.nodes);
    if (config.value !== undefined) treeInstance.value.set(config.value);
    if (config.disabled !== undefined) testComponent.disabled.set(config.disabled);
    if (config.orientation !== undefined) testComponent.orientation.set(config.orientation);
    if (config.multi !== undefined) testComponent.multi.set(config.multi);
    if (config.wrap !== undefined) testComponent.wrap.set(config.wrap);
    if (config.softDisabled !== undefined) testComponent.softDisabled.set(config.softDisabled);
    if (config.focusMode !== undefined) testComponent.focusMode.set(config.focusMode);
    if (config.selectionMode !== undefined) testComponent.selectionMode.set(config.selectionMode);
    if (config.nav !== undefined) testComponent.nav.set(config.nav);
    if (config.currentType !== undefined) testComponent.currentType.set(config.currentType);
    if (config.tabIndex !== undefined) testComponent.tabIndex.set(config.tabIndex);

    await fixture.whenStable();
    defineTestVariables();
  }

  async function updateTreeItemByValue(value: string, config: Partial<TestTreeNode<string>>) {
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
          await updateTree({nodes: newNodes});
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

  async function expandAll() {
    const fruitsEl = getTreeItemElementByValue('fruits')!;
    await click(fruitsEl);
    const berriesEl = getTreeItemElementByValue('berries')!;
    await click(berriesEl);
    const vegetablesEl = getTreeItemElementByValue('vegetables')!;
    await click(vegetablesEl);
    await updateTree({value: []});
  }

  afterEach(async () => {
    await fixture.whenStable();
    await runAccessibilityChecks(fixture.nativeElement);
  });

  describe('dynamic updates', () => {
    it('should update item order correctly after items are shuffled', async () => {
      await setupTestTree();
      await expandAll();
      await fixture.whenStable();

      const treeDirective = fixture.debugElement.query(By.directive(Tree)).injector.get(Tree);
      const itemsBefore = treeDirective._pattern.inputs.items();
      expect(itemsBefore.length).toBe(11);
      expect(itemsBefore[0].value()).toBe('fruits');

      // Shuffle top-level nodes: move fruits to end
      const nodes = testComponent.nodes();
      const firstNode = nodes.shift()!;
      nodes.push(firstNode);
      testComponent.nodes.set([...nodes]);
      await fixture.whenStable();
      await waitForMicrotasks();

      const itemsAfter = treeDirective._pattern.inputs.items();
      expect(itemsAfter.length).toBe(11);
      expect(itemsAfter[0].value()).toBe('vegetables');
    });
  });

  describe('structural validations', () => {
    let consoleSpy: jasmine.Spy;

    beforeEach(() => {
      consoleSpy = spyOn(console, 'warn');
    });

    afterEach(async () => {
      TestBed.resetTestingModule();
      await setupTestTree();
    });

    it('should warn when duplicate values are detected inside ngTree', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [TreeWithDuplicateValues],
      });
      const duplicateFixture = TestBed.createComponent(TreeWithDuplicateValues);
      duplicateFixture.detectChanges();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Duplicate tree item value 'item0' detected inside ngTree.",
      );
    });

    it('should warn when single-select tree has multiple selected values', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [SingleSelectTreeWithMultipleValues],
      });
      const singleSelectFixture = TestBed.createComponent(SingleSelectTreeWithMultipleValues);
      singleSelectFixture.detectChanges();

      expect(consoleSpy).toHaveBeenCalledWith(
        'A single-select tree should not have multiple selected options. Selected options: item0, item1',
      );
    });
  });

  describe('ARIA attributes and roles', () => {
    describe('default configuration', () => {
      beforeEach(async () => {
        await setupTestTree();
      });

      it('should correctly set the role attribute to "tree" for Tree', () => {
        expect(treeElement.getAttribute('role')).toBe('tree');
      });

      it('should correctly set the role attribute to "treeitem" for TreeItem', async () => {
        await expandAll();

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

      it('should set aria-level, aria-setsize, and aria-posinset correctly', async () => {
        await expandAll();

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
      beforeEach(async () => {
        await setupTestTree();
      });

      it('should set aria-orientation to "horizontal"', async () => {
        await updateTree({orientation: 'horizontal'});

        expect(treeElement.getAttribute('aria-orientation')).toBe('horizontal');
      });

      it('should set aria-multiselectable to "true"', async () => {
        await updateTree({multi: true});

        expect(treeElement.getAttribute('aria-multiselectable')).toBe('true');
      });

      it('should set aria-disabled to "true" for the tree', async () => {
        await updateTree({disabled: true});

        expect(treeElement.getAttribute('aria-disabled')).toBe('true');
      });

      it('should be able to override tabindex', async () => {
        await updateTree({tabIndex: -1});
        expect(treeElement.getAttribute('tabindex')).toBe('-1');
      });

      it('should set aria-disabled to "true" for disabled items', async () => {
        await updateTreeItemByValue('fruits', {disabled: true});

        const fruitsItem = getTreeItemElementByValue('fruits')!;
        expect(fruitsItem.getAttribute('aria-disabled')).toBe('true');
      });

      it('should set aria-selected to "true" for selected items', async () => {
        await expandAll();
        await updateTree({value: ['apple']});

        const appleItem = getTreeItemElementByValue('apple')!;
        expect(appleItem.getAttribute('aria-selected')).toBe('true');
        const fruitsItem = getTreeItemElementByValue('fruits')!;
        expect(fruitsItem.getAttribute('aria-selected')).toBe('false');
      });

      it('should set aria-expanded to "true" for expanded items', async () => {
        await right();

        const fruitsItem = getTreeItemElementByValue('fruits')!;
        expect(fruitsItem.getAttribute('aria-expanded')).toBe('true');
      });

      it('should set aria-current to specific current type when nav="true"', async () => {
        await expandAll();
        await updateTree({nav: true, value: ['apple']});

        const appleItem = getTreeItemElementByValue('apple')!;
        const bananaItem = getTreeItemElementByValue('banana')!;
        expect(appleItem.getAttribute('aria-current')).toBe('page');
        expect(bananaItem.hasAttribute('aria-current')).toBe(false);

        await updateTree({currentType: 'location'});
        expect(appleItem.getAttribute('aria-current')).toBe('location');
      });

      it('should not set aria-current when not selectable', async () => {
        await expandAll();
        await updateTree({nav: true, value: ['apple']});
        const appleItem = getTreeItemElementByValue('apple')!;
        expect(appleItem.getAttribute('aria-current')).toBe('page');

        await updateTreeItemByValue('apple', {selectable: false});
        expect(appleItem.hasAttribute('aria-current')).toBe(false);
      });

      it('should not set aria-selected when nav="true"', async () => {
        await expandAll();

        await updateTree({value: ['apple'], nav: true});
        const appleItem = getTreeItemElementByValue('apple')!;
        expect(appleItem.hasAttribute('aria-selected')).toBe(false);

        await updateTree({nav: false});
        expect(appleItem.getAttribute('aria-selected')).toBe('true');
      });

      it('should not set aria-selected when not selectable', async () => {
        await expandAll();
        await updateTree({value: ['apple']});
        const appleItem = getTreeItemElementByValue('apple')!;
        expect(appleItem.getAttribute('aria-selected')).toBe('true');

        await updateTreeItemByValue('apple', {selectable: false});
        expect(appleItem.hasAttribute('aria-selected')).toBe(false);
      });
    });

    describe('roving focus mode (focusMode="roving")', () => {
      beforeEach(async () => {
        await setupTestTree();
        await updateTree({focusMode: 'roving'});
      });

      it('should set tabindex="-1" for the tree', () => {
        expect(treeElement.getAttribute('tabindex')).toBe('-1');
      });

      it('should set tabindex="0" for the tree when disabled when softDisabled is false', async () => {
        await updateTree({disabled: true, focusMode: 'roving', softDisabled: false});

        expect(treeElement.getAttribute('tabindex')).toBe('0');
      });

      it('should set tabindex="0" for the tree when disabled when softDisabled is true', async () => {
        await updateTree({disabled: true, focusMode: 'roving'});

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

      it('should set initial focus (tabindex="0") on the first selected item', async () => {
        await updateTree({value: ['vegetables', 'dairy'], focusMode: 'roving'});

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
      beforeEach(async () => {
        await setupTestTree();
        await updateTree({focusMode: 'activedescendant'});
      });

      it('should set tabindex="0" for the tree', () => {
        expect(treeElement.getAttribute('tabindex')).toBe('0');
      });

      it('should set aria-activedescendant to the ID of the first non-disabled item if no value is set', () => {
        const fruitsItem = getTreeItemElementByValue('fruits')!;
        expect(treeElement.getAttribute('aria-activedescendant')).toBe(fruitsItem.id);
      });

      it('should set aria-activedescendant to the ID of the first selected item', async () => {
        await updateTree({value: ['vegetables', 'dairy'], focusMode: 'activedescendant'});

        const vegetablesItem = getTreeItemElementByValue('vegetables')!;
        expect(treeElement.getAttribute('aria-activedescendant')).toBe(vegetablesItem.id);
      });

      it('should set tabindex="-1" for all items', async () => {
        await expandAll();

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
    it('should select items based on the initial value input', async () => {
      await setupTestTree();
      await expandAll();
      await updateTree({value: ['apple', 'strawberry', 'carrot']});

      expect(getTreeItemElementByValue('apple')!.getAttribute('aria-selected')).toBe('true');
      expect(getTreeItemElementByValue('strawberry')!.getAttribute('aria-selected')).toBe('true');
      expect(getTreeItemElementByValue('carrot')!.getAttribute('aria-selected')).toBe('true');
      expect(getTreeItemElementByValue('banana')!.getAttribute('aria-selected')).toBe('false');
    });

    describe('pointer interactions', () => {
      describe('single select (multi=false, selectionMode="explicit")', () => {
        beforeEach(async () => {
          await setupTestTree();
          await updateTree({multi: false, selectionMode: 'explicit'});
        });

        it('should select an item on click and deselect others', async () => {
          await right();
          const appleEl = getTreeItemElementByValue('apple')!;
          const bananaEl = getTreeItemElementByValue('banana')!;

          await click(appleEl);
          expect(treeInstance.value()).toEqual(['apple']);
          expect(appleEl.getAttribute('aria-selected')).toBe('true');
          expect(bananaEl.getAttribute('aria-selected')).toBe('false');

          await click(bananaEl);
          expect(treeInstance.value()).toEqual(['banana']);
          expect(appleEl.getAttribute('aria-selected')).toBe('false');
          expect(bananaEl.getAttribute('aria-selected')).toBe('true');
        });
      });

      describe('multi select (multi=true)', () => {
        beforeEach(async () => {
          await setupTestTree();
          await updateTree({multi: true});

          // Expands vegetables and fruits
          await down();
          await right();
          await up();
          await right();
        });

        describe('selectionMode="explicit"', () => {
          beforeEach(async () => {
            await updateTree({selectionMode: 'explicit'});
          });

          it('should select a range with shift+click', async () => {
            const appleEl = getTreeItemElementByValue('apple')!;
            const carrotEl = getTreeItemElementByValue('carrot')!;

            await click(appleEl);
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

          it('should toggle selection of an item on simple click, leaving other selections intact', async () => {
            const appleEl = getTreeItemElementByValue('apple')!;
            const bananaEl = getTreeItemElementByValue('banana')!;

            await click(appleEl);
            expect(treeInstance.value()).toEqual(['apple']);

            await click(bananaEl);
            expect(treeInstance.value()).toEqual(['apple', 'banana']);

            await click(appleEl);
            expect(treeInstance.value()).toEqual(['banana']);
          });

          describe('selectable=false', () => {
            it('should not select an item on click', async () => {
              await updateTree({value: ['banana']});
              await updateTreeItemByValue('apple', {selectable: false});
              const appleEl = getTreeItemElementByValue('apple')!;

              await click(appleEl);
              expect(treeInstance.value()).not.toContain('apple');
              expect(treeInstance.value()).toContain('banana');
            });
          });
        });

        describe('selectionMode="follow"', () => {
          beforeEach(async () => {
            await updateTree({selectionMode: 'follow'});
          });

          it('should select only the clicked item with a simple click (like single select), deselecting others', async () => {
            const appleEl = getTreeItemElementByValue('apple')!;
            const bananaEl = getTreeItemElementByValue('banana')!;
            const carrotEl = getTreeItemElementByValue('carrot')!;

            ctrlClick(appleEl);
            ctrlClick(bananaEl);
            expect(treeInstance.value()).toEqual(['apple', 'banana']);

            await click(carrotEl);
            expect(treeInstance.value()).toEqual(['carrot']);

            await click(appleEl);
            expect(treeInstance.value()).toEqual(['apple']);
          });

          it('should add to selection with ctrl+click and toggle individual items', async () => {
            const appleEl = getTreeItemElementByValue('apple')!;
            const berriesEl = getTreeItemElementByValue('berries')!;

            await click(appleEl);
            expect(treeInstance.value()).toEqual(['apple']);

            ctrlClick(berriesEl);
            expect(treeInstance.value()).toEqual(['apple', 'berries']);

            ctrlClick(appleEl);
            expect(treeInstance.value()).toEqual(['berries']);
          });

          it('should select a range with shift+click, anchoring from last selected/focused', async () => {
            const appleEl = getTreeItemElementByValue('apple')!;
            const berriesEl = getTreeItemElementByValue('berries')!;
            const carrotEl = getTreeItemElementByValue('carrot')!;
            const broccoliEl = getTreeItemElementByValue('broccoli')!;

            await click(appleEl);
            expect(treeInstance.value()).toEqual(['apple']);

            shiftClick(carrotEl);
            expect(treeInstance.value()).toEqual([
              'apple',
              'banana',
              'berries',
              'vegetables',
              'carrot',
            ]);

            await click(berriesEl);
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

          describe('selectable=false', () => {
            it('should not select a range with shift+click if an item is not selectable', async () => {
              await updateTreeItemByValue('banana', {selectable: false});
              const appleEl = getTreeItemElementByValue('apple')!;
              const berriesEl = getTreeItemElementByValue('berries')!;

              await click(appleEl);
              shiftClick(berriesEl);

              expect(treeInstance.value()).not.toContain('banana');
              expect(treeInstance.value()).toContain('apple');
              expect(treeInstance.value()).toContain('berries');
            });

            it('should not toggle selection of an item on simple click', async () => {
              await updateTreeItemByValue('apple', {selectable: false});
              const appleEl = getTreeItemElementByValue('apple')!;

              await click(appleEl);
              expect(treeInstance.value()).not.toContain('apple');
            });

            it('should not add to selection with ctrl+click', async () => {
              await updateTree({value: ['banana']});
              await updateTreeItemByValue('apple', {selectable: false});
              const appleEl = getTreeItemElementByValue('apple')!;

              ctrlClick(appleEl);
              expect(treeInstance.value()).not.toContain('apple');
              expect(treeInstance.value()).toContain('banana');
            });
          });
        });
      });
    });

    describe('keyboard interactions', () => {
      describe('single select (multi=false)', () => {
        beforeEach(async () => {
          await setupTestTree();
          await updateTree({multi: false});
        });

        describe('selectionMode="explicit"', () => {
          beforeEach(async () => {
            await updateTree({selectionMode: 'explicit'});
          });

          it('should select the focused item with Enter and deselect others', async () => {
            await enter();
            expect(treeInstance.value()).toEqual(['fruits']);

            await down();
            await enter();
            expect(treeInstance.value()).toEqual(['vegetables']);
          });

          it('should select the focused item with Space and deselect others', async () => {
            await space();
            expect(treeInstance.value()).toEqual(['fruits']);

            await down();
            await space();
            expect(treeInstance.value()).toEqual(['vegetables']);
          });

          it('should move focus with arrows without changing selection until Enter/Space', async () => {
            await enter();
            expect(treeInstance.value()).toEqual(['fruits']);

            await down();
            expect(treeInstance.value()).toEqual(['fruits']);

            await down();
            expect(treeInstance.value()).toEqual(['fruits']);

            await enter();
            expect(treeInstance.value()).toEqual(['grains']);
          });

          describe('selectable=false', () => {
            it('should not select the focused item with Enter', async () => {
              await updateTreeItemByValue('fruits', {selectable: false});
              await enter();
              expect(treeInstance.value()).toEqual([]);
            });

            it('should not select the focused item with Space', async () => {
              await updateTreeItemByValue('fruits', {selectable: false});
              await space();
              expect(treeInstance.value()).toEqual([]);
            });
          });
        });

        describe('selectionMode="follow"', () => {
          beforeEach(async () => {
            await updateTree({selectionMode: 'follow'});
          });

          it('should select an item when it becomes focused with ArrowDown and deselect others', async () => {
            await updateTree({value: ['fruits']});
            expect(treeInstance.value()).toEqual(['fruits']);

            await down();
            expect(treeInstance.value()).toEqual(['vegetables']);

            await down();
            expect(treeInstance.value()).toEqual(['grains']);
          });

          it('should select an item when it becomes focused with ArrowUp and deselect others', async () => {
            await updateTree({value: ['grains']});

            await up();
            expect(treeInstance.value()).toEqual(['vegetables']);
          });

          it('should select the first item with Home and deselect others', async () => {
            await updateTree({value: ['grains']});
            expect(treeInstance.value()).toEqual(['grains']);

            await home();
            expect(treeInstance.value()).toEqual(['fruits']);
          });

          it('should select the last visible item with End and deselect others', async () => {
            await updateTree({value: ['fruits']});
            expect(treeInstance.value()).toEqual(['fruits']);

            await end();
            expect(treeInstance.value()).toEqual(['dairy']);
          });

          it('should select an item via typeahead and deselect others', async () => {
            await updateTree({value: ['fruits']});
            expect(treeInstance.value()).toEqual(['fruits']);

            await type('V');
            expect(treeInstance.value()).toEqual(['vegetables']);
          });
        });
      });

      describe('multi select (multi=true)', () => {
        beforeEach(async () => {
          await setupTestTree();
          await updateTree({multi: true});
        });

        describe('selectionMode="explicit"', () => {
          beforeEach(async () => {
            await updateTree({selectionMode: 'explicit'});
          });

          it('should toggle selection of the focused item with Space, leaving other selections intact', async () => {
            await space();
            expect(treeInstance.value()).toEqual(['fruits']);

            await down();
            await space();
            expect(treeInstance.value().sort()).toEqual(['fruits', 'vegetables']);
          });

          it('should move focus with arrows without changing selection', async () => {
            await space();
            expect(treeInstance.value()).toEqual(['fruits']);

            await down();
            expect(treeInstance.value()).toEqual(['fruits']);
          });

          it('should extend selection downwards with Shift+ArrowDown', async () => {
            await shift();
            await down({shiftKey: true});
            expect(treeInstance.value().sort()).toEqual(['fruits', 'vegetables']);

            await down({shiftKey: true});
            expect(treeInstance.value().sort()).toEqual(['fruits', 'grains', 'vegetables']);
          });

          it('should extend selection upwards with Shift+ArrowUp', async () => {
            await end();
            await shift();
            await up({shiftKey: true});
            expect(treeInstance.value().sort()).toEqual(['dairy', 'grains']);
          });

          it('Ctrl+A should select all enabled visible items, then deselect all', async () => {
            // Expands vegetables and fruits
            await down();
            await right();
            await up();
            await right();

            await updateTreeItemByValue('carrot', {disabled: true});
            await updateTreeItemByValue('broccoli', {disabled: true});

            await keydown('A', {ctrlKey: true});
            expect(treeInstance.value().sort()).toEqual([
              'apple',
              'banana',
              'berries',
              'dairy',
              'fruits',
              'grains',
              'vegetables',
            ]);

            await keydown('A', {ctrlKey: true});
            expect(treeInstance.value()).toEqual([]);
          });

          it('Ctrl+ArrowKey should move focus without changing selection', async () => {
            await space();
            expect(treeInstance.value()).toEqual(['fruits']);

            await down({ctrlKey: true});
            expect(treeInstance.value()).toEqual(['fruits']);

            await up({ctrlKey: true});
            expect(treeInstance.value()).toEqual(['fruits']);
          });

          describe('selectable=false', () => {
            it('should not toggle selection of the focused item with Space', async () => {
              await updateTreeItemByValue('fruits', {selectable: false});
              await space();
              expect(treeInstance.value()).toEqual([]);
            });

            it('should not extend selection with Shift+ArrowDown', async () => {
              await updateTreeItemByValue('vegetables', {selectable: false});
              await shift();
              await down({shiftKey: true});
              await down({shiftKey: true});
              expect(treeInstance.value()).not.toContain('vegetables');
              expect(treeInstance.value().sort()).toEqual(['fruits', 'grains']);
            });

            it('Ctrl+A should not select non-selectable items', async () => {
              await expandAll();
              await updateTreeItemByValue('apple', {selectable: false});
              await updateTreeItemByValue('carrot', {selectable: false});
              await keydown('A', {ctrlKey: true});
              const value = treeInstance.value();
              expect(value).not.toContain('apple');
              expect(value).not.toContain('carrot');
              expect(value).toContain('banana');
              expect(value).toContain('broccoli');
            });
          });
        });

        describe('selectionMode="follow"', () => {
          beforeEach(async () => {
            await updateTree({selectionMode: 'follow'});
          });

          it('should select the focused item and deselect others on ArrowDown', async () => {
            await updateTree({value: ['fruits']});
            expect(treeInstance.value()).toEqual(['fruits']);

            await down();
            expect(treeInstance.value()).toEqual(['vegetables']);
          });

          it('should select the focused item and deselect others on ArrowUp', async () => {
            await updateTree({value: ['vegetables']});
            expect(treeInstance.value()).toEqual(['vegetables']);

            await up();
            expect(treeInstance.value()).toEqual(['fruits']);
          });

          it('should move focus without changing selection on Ctrl+ArrowDown', async () => {
            await updateTree({value: ['fruits']});
            expect(getFocusedTreeItemValue()).toBe('fruits');

            await down({ctrlKey: true});
            expect(treeInstance.value()).toEqual(['fruits']);
            expect(getFocusedTreeItemValue()).toBe('vegetables');
          });

          it('should move focus without changing selection on Ctrl+ArrowUp', async () => {
            await updateTree({value: ['fruits']});

            await down({ctrlKey: true});
            expect(getFocusedTreeItemValue()).toBe('vegetables');

            await up({ctrlKey: true});
            expect(treeInstance.value()).toEqual(['fruits']);
            expect(getFocusedTreeItemValue()).toBe('fruits');
          });

          it('should toggle selection of the focused item on Ctrl+Space, adding to existing selection', async () => {
            await updateTree({value: ['fruits']});
            await down({ctrlKey: true});
            expect(getFocusedTreeItemValue()).toBe('vegetables');

            await space({ctrlKey: true});
            expect(treeInstance.value().sort()).toEqual(['fruits', 'vegetables']);

            await space({ctrlKey: true});
            expect(treeInstance.value()).toEqual(['fruits']);
          });

          it('should toggle selection of the focused item on Ctrl+Enter, adding to existing selection', async () => {
            await updateTree({value: ['fruits']});
            await down({ctrlKey: true});
            expect(getFocusedTreeItemValue()).toBe('vegetables');

            await enter({ctrlKey: true});
            expect(treeInstance.value().sort()).toEqual(['fruits', 'vegetables']);

            await enter({ctrlKey: true});
            expect(treeInstance.value()).toEqual(['fruits']);
          });

          it('should extend selection downwards with Shift+ArrowDown', async () => {
            await right(); // Expands fruits
            await updateTree({value: ['fruits']});

            await shift();
            await down({shiftKey: true});
            expect(treeInstance.value().sort()).toEqual(['apple', 'fruits']);

            await down({shiftKey: true});
            expect(treeInstance.value().sort()).toEqual(['apple', 'banana', 'fruits']);
          });

          it('should extend selection upwards with Shift+ArrowUp', async () => {
            await updateTree({value: ['grains']});

            await shift();
            await up({shiftKey: true});
            expect(treeInstance.value().sort()).toEqual(['grains', 'vegetables']);

            await up({shiftKey: true});
            expect(treeInstance.value().sort()).toEqual(['fruits', 'grains', 'vegetables']);
          });

          it('should select a range with Shift+Space, anchoring from last selected/focused item', async () => {
            await right(); // Expands fruits
            await updateTree({value: ['fruits']});

            await down({ctrlKey: true});
            await down({ctrlKey: true});
            expect(getFocusedTreeItemValue()).toBe('banana');

            await space({shiftKey: true});
            expect(treeInstance.value().sort()).toEqual(['apple', 'banana', 'fruits']);
          });

          it('Ctrl+A: select all enabled visible items; second Ctrl+A deselects all except focused', async () => {
            await right(); // Expands fruits
            await updateTreeItemByValue('vegetables', {disabled: true});

            await keydown('A', {ctrlKey: true});
            expect(treeInstance.value().sort()).toEqual([
              'apple',
              'banana',
              'berries',
              'dairy',
              'fruits',
              'grains',
            ]);

            await keydown('A', {ctrlKey: true});
            expect(treeInstance.value()).toEqual(['fruits']);
          });

          it('typeahead should select the focused item and deselect others', async () => {
            await updateTree({value: ['fruits']});
            await type('V');
            expect(treeInstance.value()).toEqual(['vegetables']);
            expect(getFocusedTreeItemValue()).toBe('vegetables');
          });

          describe('selectable=false', () => {
            it('should not select an item on ArrowDown', async () => {
              await updateTreeItemByValue('vegetables', {selectable: false});
              await down();
              expect(treeInstance.value()).not.toContain('vegetables');
              expect(treeInstance.value()).toEqual([]);
            });

            it('should not toggle selection of the focused item on Ctrl+Space', async () => {
              await updateTreeItemByValue('fruits', {selectable: false});
              await space({ctrlKey: true});
              expect(treeInstance.value()).toEqual([]);
            });

            it('should not extend selection with Shift+ArrowDown', async () => {
              await updateTreeItemByValue('vegetables', {selectable: false});
              await shift();
              await down({shiftKey: true});
              await down({shiftKey: true});
              expect(treeInstance.value()).not.toContain('vegetables');
              expect(treeInstance.value().sort()).toEqual(['fruits', 'grains']);
            });

            it('typeahead should not select the focused item', async () => {
              await updateTreeItemByValue('vegetables', {selectable: false});
              await type('v');
              expect(getFocusedTreeItemValue()).toBe('vegetables');
              expect(treeInstance.value()).not.toContain('vegetables');
            });
          });

          it('should not select disabled items during Shift+ArrowKey navigation even if softDisabled is true', async () => {
            await right(); // Expands fruits
            await updateTreeItemByValue('banana', {disabled: true});
            await updateTree({value: ['apple'], softDisabled: true});
            await down(); // Focus moves to apple
            expect(getFocusedTreeItemValue()).toBe('apple');

            await keydown('Shift');
            await down({shiftKey: true});
            expect(getFocusedTreeItemValue()).toBe('banana');
            expect(treeInstance.value().sort()).toEqual(['apple']);

            await down({shiftKey: true}); // Focus 'berries'
            expect(getFocusedTreeItemValue()).toBe('berries');
            expect(treeInstance.value().sort()).toEqual(['apple', 'berries']);
          });

          it('should not change selection if tree is disabled', async () => {
            await updateTree({value: ['fruits'], disabled: true});
            await down();
            expect(treeInstance.value()).toEqual(['fruits']);
          });
        });
      });
    });
  });

  describe('expansion and collapse', () => {
    it('should expand items by setting expanded input', async () => {
      await setupTestTree();
      await updateTree({
        nodes: [
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
                expanded: true,
              },
            ],
            expanded: true,
          },
        ],
      });
      const fruitsEl = getTreeItemElementByValue('fruits')!;
      const berriesEl = getTreeItemElementByValue('berries')!;
      expect(fruitsEl.getAttribute('aria-expanded')).toBe('true');
      expect(berriesEl.getAttribute('aria-expanded')).toBe('true');
    });

    it('should not affect selected item when collapse', async () => {
      await setupTestTree();
      await updateTree({
        nodes: [
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
                expanded: true,
              },
            ],
            expanded: true,
          },
        ],
      });
      const blueberryEl = getTreeItemElementByValue('blueberry')!;
      const berriesEl = getTreeItemElementByValue('berries')!;
      const fruits = getTreeItemElementByValue('fruits')!;

      await click(blueberryEl);
      expect(treeInstance.value()).toEqual(['blueberry']);

      await left();
      await left(); // collapse berries
      expect(berriesEl.getAttribute('aria-expanded')).toBe('false');
      expect(treeInstance.value()).toEqual(['blueberry']);

      await left();
      await left(); // collapse fruits
      expect(fruits.getAttribute('aria-expanded')).toBe('false');
      expect(treeInstance.value()).toEqual(['blueberry']);
    });

    describe('LTR', () => {
      beforeEach(async () => {
        await setupTestTree();
      });

      describe('orientation="vertical"', () => {
        beforeEach(async () => {
          await updateTree({orientation: 'vertical'});
        });

        it('should expand a collapsed item with ArrowRight', async () => {
          const fruitsEl = getTreeItemElementByValue('fruits')!;
          expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');

          await right();
          expect(fruitsEl.getAttribute('aria-expanded')).toBe('true');
        });

        it('should move focus to first child if ArrowRight on an expanded item', async () => {
          await right(); // Expands fruits
          expect(getFocusedTreeItemValue()).toBe('fruits');

          await right();
          expect(getFocusedTreeItemValue()).toBe('apple');
        });

        it('should collapse an expanded item with ArrowLeft', async () => {
          await right(); // Expands fruits
          const fruitsEl = getTreeItemElementByValue('fruits')!;
          expect(fruitsEl.getAttribute('aria-expanded')).toBe('true');
          await left();
          expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');
        });

        it('should move focus to parent if ArrowLeft on a collapsed non-root item', async () => {
          await right(); // Expands fruits
          await right(); // Focus apple (child of fruits)
          expect(getFocusedTreeItemValue()).toBe('apple');

          await left();
          expect(getFocusedTreeItemValue()).toBe('fruits');
        });
      });

      describe('orientation="horizontal"', () => {
        beforeEach(async () => {
          await updateTree({orientation: 'horizontal'});
        });

        it('should expand a collapsed item with ArrowDown', async () => {
          await updateTree({orientation: 'horizontal'});
          const fruitsEl = getTreeItemElementByValue('fruits')!;
          expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');
          await down();
          expect(fruitsEl.getAttribute('aria-expanded')).toBe('true');
        });

        it('should move focus to first child if ArrowDown on an expanded item', async () => {
          await updateTree({orientation: 'horizontal'});
          expect(getFocusedTreeItemValue()).toBe('fruits');
          await down();
          await down();
          expect(getFocusedTreeItemValue()).toBe('apple');
        });

        it('should collapse an expanded item with ArrowUp', async () => {
          await updateTree({orientation: 'horizontal'});
          await down(); // Expands fruits
          const fruitsEl = getTreeItemElementByValue('fruits')!;
          expect(fruitsEl.getAttribute('aria-expanded')).toBe('true');
          await up();
          expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');
        });

        it('should move focus to parent if ArrowUp on a collapsed non-root item', async () => {
          await updateTree({orientation: 'horizontal'});
          await down(); // Expands fruits
          await down();
          expect(getFocusedTreeItemValue()).toBe('apple');
          await up();
          expect(getFocusedTreeItemValue()).toBe('fruits');
        });
      });

      it('should expand all sibling items with Shift + *', async () => {
        const fruitsEl = getTreeItemElementByValue('fruits')!;
        const vegetablesEl = getTreeItemElementByValue('vegetables')!;
        const grainsEl = getTreeItemElementByValue('grains')!;
        const dairyEl = getTreeItemElementByValue('dairy')!;

        expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');
        expect(vegetablesEl.getAttribute('aria-expanded')).toBe('false');

        await keydown('*', {shiftKey: true});

        expect(fruitsEl.getAttribute('aria-expanded')).toBe('true');
        expect(vegetablesEl.getAttribute('aria-expanded')).toBe('true');
        expect(grainsEl.hasAttribute('aria-expanded')).toBe(false);
        expect(dairyEl.hasAttribute('aria-expanded')).toBe(false);
      });

      it('should toggle expansion on pointerdown (click) for an expandable item', async () => {
        const fruitsEl = getTreeItemElementByValue('fruits')!;
        expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');

        await click(fruitsEl);
        expect(fruitsEl.getAttribute('aria-expanded')).toBe('true');
        expect(getFocusedTreeItemValue()).toBe('fruits');

        await click(fruitsEl);
        expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');
      });

      it('should not expand a non-expandable item on click', async () => {
        const grainsEl = getTreeItemElementByValue('grains')!;
        expect(grainsEl.hasAttribute('aria-expanded')).toBe(false);

        await click(grainsEl);
        expect(grainsEl.hasAttribute('aria-expanded')).toBe(false);
        expect(getFocusedTreeItemValue()).toBe('grains');
      });

      it('should not expand a non-expandable item with expand key', async () => {
        const grainsEl = getTreeItemElementByValue('grains')!;
        await down();
        await down();
        expect(getFocusedTreeItemValue()).toBe('grains');

        await right();
        expect(grainsEl.hasAttribute('aria-expanded')).toBe(false);
        expect(getFocusedTreeItemValue()).toBe('grains');
      });

      it('should not expand/collapse if item is disabled', async () => {
        await updateTreeItemByValue('fruits', {disabled: true});
        const fruitsEl = getTreeItemElementByValue('fruits')!;

        await click(fruitsEl);
        expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');

        await right();
        expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');
      });

      it('should not expand/collapse if tree is disabled', async () => {
        await updateTree({disabled: true});
        const fruitsEl = getTreeItemElementByValue('fruits')!;

        await click(fruitsEl);
        expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');

        await right();
        expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');
      });

      it('should do nothing on collapseKey if item is collapsed and is a root item', async () => {
        const fruitsEl = getTreeItemElementByValue('fruits')!;
        expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');
        expect(getFocusedTreeItemValue()).toBe('fruits');

        await left();
        expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');
        expect(getFocusedTreeItemValue()).toBe('fruits');
      });
    });

    describe('RTL', () => {
      beforeEach(async () => {
        await setupTestTree('rtl');
      });

      describe('orientation="vertical"', () => {
        it('should expand a collapsed item with ArrowLeft', async () => {
          const fruitsEl = getTreeItemElementByValue('fruits')!;
          expect(fruitsEl.getAttribute('aria-expanded')).toBe('false');
          await left();
          expect(fruitsEl.getAttribute('aria-expanded')).toBe('true');
        });

        it('should collapse an expanded item with ArrowRight', async () => {
          await left();
          const fruitsEl = getTreeItemElementByValue('fruits')!;
          expect(fruitsEl.getAttribute('aria-expanded')).toBe('true');

          await right();
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
          beforeEach(async () => {
            await setupTestTree('ltr');
            await updateTree({focusMode});
          });

          describe('vertical orientation', () => {
            beforeEach(async () => {
              await updateTree({orientation: 'vertical'});
            });

            it('should move focus to the next visible item on ArrowDown', async () => {
              expect(isFocused('fruits')).toBe(true);
              await right(); // Expands fruits
              await down();
              expect(isFocused('apple')).toBe(true);
              await down();
              expect(isFocused('banana')).toBe(true);
            });

            it('should move focus to the previous visible item on ArrowUp', async () => {
              expect(isFocused('fruits')).toBe(true);
              await right(); // Expands fruits
              await down();
              await down();
              expect(isFocused('banana')).toBe(true);
              await up();
              expect(isFocused('apple')).toBe(true);
              await up();
              expect(isFocused('fruits')).toBe(true);
            });

            it('should skip disabled items with ArrowDown if softDisabled=false', async () => {
              await right(); // Expands fruits
              await updateTreeItemByValue('apple', {disabled: true});
              await updateTree({softDisabled: false});

              expect(isFocused('fruits')).toBe(true);
              await down();
              expect(isFocused('banana')).toBe(true);
            });

            it('should not skip disabled items with ArrowDown if softDisabled=true', async () => {
              await right(); // Expands fruits
              await updateTreeItemByValue('apple', {disabled: true});
              await updateTree({softDisabled: true});

              expect(isFocused('fruits')).toBe(true);
              await down();
              expect(isFocused('apple')).toBe(true);
            });

            it('should wrap focus from last to first with ArrowDown when wrap is true', async () => {
              await updateTree({wrap: true});
              await end();
              expect(isFocused('dairy')).toBe(true);
              await down();
              expect(isFocused('fruits')).toBe(true);
            });

            it('should not wrap focus from last to first with ArrowDown when wrap is false', async () => {
              await updateTree({wrap: false});
              await end();
              expect(isFocused('dairy')).toBe(true);
              await down();
              expect(isFocused('dairy')).toBe(true);
            });
          });

          describe('horizontal orientation', () => {
            beforeEach(async () => {
              await updateTree({orientation: 'horizontal'});
            });

            it('should move focus to the next visible item on ArrowRight', async () => {
              expect(isFocused('fruits')).toBe(true);
              await right();
              expect(isFocused('vegetables')).toBe(true);
            });

            it('should move focus to the previous visible item on ArrowLeft', async () => {
              await right();
              expect(isFocused('vegetables')).toBe(true);
              await left();
              expect(isFocused('fruits')).toBe(true);
            });
          });

          it('should move focus to the last enabled visible item on End (softDisabled="false")', async () => {
            await updateTree({softDisabled: false});
            await right(); // Expands fruits
            await updateTreeItemByValue('dairy', {disabled: true});
            await updateTreeItemByValue('grains', {disabled: true});
            await updateTreeItemByValue('vegetables', {disabled: true});
            await end();
            expect(isFocused('berries')).toBe(true);
          });

          it('should move focus to the first enabled visible item on Home (softDisabled="false")', async () => {
            await updateTree({softDisabled: false});
            await end();
            await updateTreeItemByValue('fruits', {disabled: true});
            await home();
            expect(isFocused('vegetables')).toBe(true);
          });
        });

        describe('RTL', () => {
          beforeEach(async () => {
            await setupTestTree('rtl');
            await updateTree({focusMode});
          });

          describe('vertical orientation', () => {
            beforeEach(async () => {
              await updateTree({orientation: 'vertical'});
            });

            it('should move focus to the next visible item on ArrowDown', async () => {
              expect(isFocused('fruits')).toBe(true);
              await down();
              expect(isFocused('vegetables')).toBe(true);
            });

            it('should move focus to the previous visible item on ArrowUp', async () => {
              await down();
              expect(isFocused('vegetables')).toBe(true);
              await up();
              expect(isFocused('fruits')).toBe(true);
            });
          });

          describe('horizontal orientation', () => {
            beforeEach(async () => {
              await updateTree({orientation: 'horizontal'});
            });

            it('should move focus to the next visible item on ArrowLeft', async () => {
              expect(isFocused('fruits')).toBe(true);
              await left();
              expect(isFocused('vegetables')).toBe(true);
            });

            it('should move focus to the previous visible item on ArrowRight', async () => {
              await left();
              expect(isFocused('vegetables')).toBe(true);
              await right();
              expect(isFocused('fruits')).toBe(true);
            });
          });
        });

        describe('pointer navigation', () => {
          beforeEach(async () => await setupTestTree());

          it('should move focus to the clicked item', async () => {
            const vegetablesEl = getTreeItemElementByValue('vegetables')!;
            await click(vegetablesEl);
            expect(isFocused('vegetables')).toBe(true);
          });

          it('should move focus to the clicked disabled item if softDisabled=true', async () => {
            await updateTreeItemByValue('vegetables', {disabled: true});
            await updateTree({softDisabled: true});
            const vegetablesEl = getTreeItemElementByValue('vegetables')!;
            await click(vegetablesEl);
            expect(isFocused('vegetables')).toBe(true);
          });
        });

        describe('typeahead functionality', () => {
          beforeEach(async () => await setupTestTree()); // LTR by default

          it('should focus the first matching visible item when typing characters', async () => {
            await right(); // Expands fruits
            await type('Ba');
            expect(isFocused('banana')).toBe(true);
          });

          it('should select the focused item if selectionMode is "follow"', async () => {
            await updateTree({selectionMode: 'follow'});
            await type('Gr');
            expect(isFocused('grains')).toBe(true);
            expect(treeInstance.value()).toEqual(['grains']);
          });

          it('should not select the focused item if selectionMode is "explicit"', async () => {
            await updateTree({selectionMode: 'explicit'});
            await type('Gr');
            expect(isFocused('grains')).toBe(true);
            expect(treeInstance.value()).toEqual([]);
          });

          it('should skip disabled items with typeahead if softDisabled=false', async () => {
            await right(); // Expands fruits
            await updateTreeItemByValue('banana', {disabled: true});
            await updateTree({softDisabled: false});
            await type('B');
            expect(isFocused('berries')).toBe(true);
          });

          it('should focus disabled items with typeahead if softDisabled=true', async () => {
            await updateTreeItemByValue('vegetables', {disabled: true});
            await updateTree({softDisabled: true});
            await type('V');
            expect(isFocused('vegetables')).toBe(true);
          });
        });
      });
    }
  });

  describe('item mutations and focus stability', () => {
    it('should recover focus by shifting to the default state if the active item is removed', async () => {
      await setupTestTree();
      await updateTree({focusMode: 'activedescendant'});

      const vegetablesEl = getTreeItemElementByValue('vegetables')!;
      await click(vegetablesEl);
      expect(getFocusedTreeItemValue()).toBe('vegetables');

      const updatedNodes = testComponent.nodes().filter(n => n.value !== 'vegetables');
      testComponent.nodes.set(updatedNodes);
      await fixture.whenStable();
      await waitForMicrotasks();
      defineTestVariables();

      expect(getFocusedTreeItemValue()).toBe('fruits');
    });
  });
});

interface TestTreeNode<V = string> {
  value: V;
  label: string;
  disabled?: boolean;
  selectable?: boolean;
  expanded?: boolean;
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
      [(value)]="value"
      [nav]="nav()"
      [currentType]="currentType()"
      [tabIndex]="tabIndex()"
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
        [expanded]="node.expanded ?? false"
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
  changeDetection: ChangeDetectionStrategy.Eager,
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
  softDisabled = signal(true);
  focusMode = signal<'roving' | 'activedescendant'>('roving');
  selectionMode = signal<'explicit' | 'follow'>('explicit');
  nav = signal(false);
  currentType = signal('page' as 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false');
  tabIndex = signal<number | undefined>(undefined);
}

@Component({
  template: `
    <ul ngTree #tree="ngTree">
      <li ngTreeItem [parent]="tree" value="item0">Item 0</li>
      <li ngTreeItem [parent]="tree" value="item0">Item 0 Copy</li>
    </ul>
  `,
  imports: [Tree, TreeItem],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class TreeWithDuplicateValues {}

@Component({
  template: `
    <ul ngTree [multi]="false" [value]="['item0', 'item1']" #tree="ngTree">
      <li ngTreeItem [parent]="tree" value="item0">Item 0</li>
      <li ngTreeItem [parent]="tree" value="item1">Item 1</li>
    </ul>
  `,
  imports: [Tree, TreeItem],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class SingleSelectTreeWithMultipleValues {}
