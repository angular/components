import {Component, DebugElement, signal, ChangeDetectionStrategy} from '@angular/core';
import {Listbox} from './listbox';
import {Option} from './option';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Direction} from '@angular/cdk/bidi';
import {provideFakeDirectionality, runAccessibilityChecks} from '@angular/cdk/testing/private';
import {waitForMicrotasks} from '../private/testing/test-helpers';

interface ModifierKeys {
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

describe('Listbox', () => {
  let fixture: ComponentFixture<ListboxExample | DefaultListboxExample>;
  let listboxDebugElement: DebugElement;
  let optionDebugElements: DebugElement[];
  let listboxInstance: Listbox<unknown>;
  let listboxElement: HTMLElement;
  let optionElements: HTMLElement[];

  const keydown = async (key: string, modifierKeys: ModifierKeys = {}) => {
    listboxElement.dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        ...modifierKeys,
      }),
    );
    await fixture.whenStable();
  };

  const click = async (index: number, eventInit?: PointerEventInit, targets?: HTMLElement[]) => {
    (targets || optionElements)[index].dispatchEvent(
      new PointerEvent('click', {
        bubbles: true,
        ...eventInit,
      }),
    );
    await fixture.whenStable();
  };

  const space = async (modifierKeys?: ModifierKeys) => await keydown(' ', modifierKeys);
  const enter = async (modifierKeys?: ModifierKeys) => await keydown('Enter', modifierKeys);
  const up = async (modifierKeys?: ModifierKeys) => await keydown('ArrowUp', modifierKeys);
  const down = async (modifierKeys?: ModifierKeys) => await keydown('ArrowDown', modifierKeys);
  const left = async (modifierKeys?: ModifierKeys) => await keydown('ArrowLeft', modifierKeys);
  const right = async (modifierKeys?: ModifierKeys) => await keydown('ArrowRight', modifierKeys);
  const home = async (modifierKeys?: ModifierKeys) => await keydown('Home', modifierKeys);
  const end = async (modifierKeys?: ModifierKeys) => await keydown('End', modifierKeys);
  const type = async (char: string) => await keydown(char);

  async function setupListbox(opts?: {
    orientation?: 'horizontal' | 'vertical';
    disabled?: boolean;
    readonly?: boolean;
    value?: number[];
    softDisabled?: boolean;
    focusMode?: 'roving' | 'activedescendant';
    multi?: boolean;
    wrap?: boolean;
    selectionMode?: 'follow' | 'explicit';
    typeaheadDelay?: number;
    disabledOptions?: number[];
    options?: TestOption[];
    textDirection?: Direction;
    tabIndex?: number;
  }) {
    TestBed.configureTestingModule({
      providers: [provideFakeDirectionality(opts?.textDirection ?? 'ltr')],
    });

    fixture = TestBed.createComponent(ListboxExample);
    const testComponent = fixture.componentInstance as ListboxExample;

    if (opts?.orientation !== undefined) testComponent.orientation = opts.orientation;
    if (opts?.disabled !== undefined) testComponent.disabled = opts.disabled;
    if (opts?.readonly !== undefined) testComponent.readonly = opts.readonly;
    if (opts?.value !== undefined) testComponent.value = opts.value;
    if (opts?.softDisabled !== undefined) testComponent.softDisabled = opts.softDisabled;
    if (opts?.focusMode !== undefined) testComponent.focusMode = opts.focusMode;
    if (opts?.multi !== undefined) testComponent.multi = opts.multi;
    if (opts?.wrap !== undefined) testComponent.wrap = opts.wrap;
    if (opts?.selectionMode !== undefined) testComponent.selectionMode = opts.selectionMode;
    if (opts?.typeaheadDelay !== undefined) testComponent.typeaheadDelay = opts.typeaheadDelay;
    if (opts?.options !== undefined) testComponent.options.set(opts.options);
    if (opts?.tabIndex !== undefined) testComponent.tabIndex = opts.tabIndex;

    if (opts?.disabledOptions !== undefined) {
      const currentOptions = testComponent.options();
      opts.disabledOptions.forEach(index => {
        if (currentOptions[index]) currentOptions[index].disabled = true;
      });
      testComponent.options.set([...currentOptions]);
    }

    await fixture.whenStable();
    defineTestVariables(fixture);
  }

  async function setupDefaultListbox() {
    TestBed.configureTestingModule({
      providers: [provideFakeDirectionality('ltr')],
    });

    const defaultFixture = TestBed.createComponent(DefaultListboxExample);
    defaultFixture.detectChanges();
    defineTestVariables(defaultFixture);
  }

  function defineTestVariables(fixture: ComponentFixture<unknown>) {
    listboxDebugElement = fixture.debugElement.query(By.directive(Listbox));
    optionDebugElements = fixture.debugElement.queryAll(By.directive(Option));
    listboxInstance = listboxDebugElement.injector.get<Listbox<unknown>>(Listbox);
    listboxElement = listboxDebugElement.nativeElement;
    optionElements = optionDebugElements.map(option => option.nativeElement);
  }

  afterEach(async () => await runAccessibilityChecks(listboxElement));

  describe('ARIA attributes and roles', () => {
    describe('default configuration', () => {
      beforeEach(async () => await setupDefaultListbox());

      it('should correctly set the role attribute to "listbox"', () => {
        expect(listboxElement.getAttribute('role')).toBe('listbox');
      });

      it('should correctly set the role attribute to "option" for the listbox options', () => {
        optionElements.forEach(optionElement => {
          expect(optionElement.getAttribute('role')).toBe('option');
        });
      });

      it('should set aria-orientation to "vertical"', () => {
        expect(listboxElement.getAttribute('aria-orientation')).toBe('vertical');
      });

      it('should set aria-disabled to "false"', () => {
        expect(listboxElement.getAttribute('aria-disabled')).toBe('false');
      });

      it('should set aria-readonly to "false"', () => {
        expect(listboxElement.getAttribute('aria-readonly')).toBe('false');
      });

      it('should set aria-multiselectable to "false"', () => {
        expect(listboxElement.getAttribute('aria-multiselectable')).toBe('false');
      });

      it('should set aria-selected to "true" for the first option and "false" for others by default', () => {
        expect(optionElements[0].getAttribute('aria-selected')).toBe('true');
        expect(optionElements[1].getAttribute('aria-selected')).toBe('false');
        expect(optionElements[2].getAttribute('aria-selected')).toBe('false');
      });
    });

    describe('custom configuration', () => {
      it('should be able to set aria-orientation to "horizontal"', async () => {
        await setupListbox({orientation: 'horizontal'});
        expect(listboxElement.getAttribute('aria-orientation')).toBe('horizontal');
      });

      it('should be able to set aria-disabled to "true"', async () => {
        await setupListbox({disabled: true});
        expect(listboxElement.getAttribute('aria-disabled')).toBe('true');
      });

      it('should be able to set aria-readonly to "true"', async () => {
        await setupListbox({readonly: true});
        expect(listboxElement.getAttribute('aria-readonly')).toBe('true');
      });

      it('should be able to set aria-multiselectable to "true"', async () => {
        await setupListbox({multi: true});
        expect(listboxElement.getAttribute('aria-multiselectable')).toBe('true');
      });

      it('should be able to override tabindex', async () => {
        await setupListbox({tabIndex: -1});
        expect(listboxElement.getAttribute('tabindex')).toBe('-1');
      });

      it('should set aria-selected to "true" for selected options', async () => {
        await setupListbox({multi: true, value: [1, 3]});
        expect(optionElements[0].getAttribute('aria-selected')).toBe('false');
        expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
        expect(optionElements[2].getAttribute('aria-selected')).toBe('false');
        expect(optionElements[3].getAttribute('aria-selected')).toBe('true');
        expect(optionElements[4].getAttribute('aria-selected')).toBe('false');
      });

      it('should set aria-disabled to "true" for disabled options', async () => {
        await setupListbox({disabledOptions: [1]});
        expect(optionElements[0].getAttribute('aria-disabled')).toBe('false');
        expect(optionElements[1].getAttribute('aria-disabled')).toBe('true');
        expect(optionElements[2].getAttribute('aria-disabled')).toBe('false');
      });
    });

    describe('roving focus mode', () => {
      it('should have tabindex="-1" for the listbox when focusMode is "roving"', async () => {
        await setupListbox({focusMode: 'roving'});
        expect(listboxElement.getAttribute('tabindex')).toBe('-1');
      });

      it('should set tabindex="0" for the listbox when disabled and focusMode is "roving"', async () => {
        await setupListbox({disabled: true, focusMode: 'roving'});
        expect(listboxElement.getAttribute('tabindex')).toBe('0');
      });

      it('should set initial focus (tabindex="0") on the first non-disabled option if no values are set', async () => {
        await setupListbox({focusMode: 'roving'});
        expect(optionElements[0].getAttribute('tabindex')).toBe('0');
        expect(optionElements[1].getAttribute('tabindex')).toBe('-1');
        expect(optionElements[2].getAttribute('tabindex')).toBe('-1');
        expect(optionElements[3].getAttribute('tabindex')).toBe('-1');
        expect(optionElements[4].getAttribute('tabindex')).toBe('-1');
      });

      it('should set initial focus (tabindex="0") on the first selected option', async () => {
        await setupListbox({focusMode: 'roving', value: [2]});
        expect(optionElements[0].getAttribute('tabindex')).toBe('-1');
        expect(optionElements[1].getAttribute('tabindex')).toBe('-1');
        expect(optionElements[2].getAttribute('tabindex')).toBe('0');
        expect(optionElements[3].getAttribute('tabindex')).toBe('-1');
        expect(optionElements[4].getAttribute('tabindex')).toBe('-1');
      });

      it('should set initial focus (tabindex="0") on the first non-disabled option if selected option is disabled when softDisabled is false', async () => {
        await setupListbox({
          focusMode: 'roving',
          value: [1],
          disabledOptions: [0],
          softDisabled: false,
        });
        expect(optionElements[0].getAttribute('tabindex')).toBe('-1');
        expect(optionElements[1].getAttribute('tabindex')).toBe('0');
      });

      it('should set initial focus (tabindex="0") on the first option if selected option is disabled', async () => {
        await setupListbox({
          focusMode: 'roving',
          value: [0],
          disabledOptions: [0],
        });
        expect(optionElements[0].getAttribute('tabindex')).toBe('0');
        expect(optionElements[1].getAttribute('tabindex')).toBe('-1');
      });

      it('should not have aria-activedescendant when focusMode is "roving"', async () => {
        await setupListbox({focusMode: 'roving'});
        expect(listboxElement.hasAttribute('aria-activedescendant')).toBe(false);
      });
    });

    describe('activedescendant focus mode', () => {
      it('should have tabindex="0" for the listbox', async () => {
        await setupListbox({focusMode: 'activedescendant'});
        expect(listboxElement.getAttribute('tabindex')).toBe('0');
      });

      it('should set aria-activedescendant to the ID of the first non-disabled option if no value is set', async () => {
        await setupListbox({focusMode: 'activedescendant'});
        expect(listboxElement.getAttribute('aria-activedescendant')).toBe(optionElements[0].id);
      });

      it('should set aria-activedescendant to the ID of the first selected option', async () => {
        await setupListbox({focusMode: 'activedescendant', value: [2]});
        expect(listboxElement.getAttribute('aria-activedescendant')).toBe(optionElements[2].id);
      });

      it('should set aria-activedescendant to the ID of the first non-disabled option if selected option is disabled', async () => {
        await setupListbox({focusMode: 'activedescendant', value: [0], disabledOptions: [0]});
        expect(listboxElement.getAttribute('aria-activedescendant')).toBe(optionElements[0].id);
      });

      it('should set aria-activedescendant to the ID of the first non-disabled option if selected option is disabled when softDisabled is false', async () => {
        await setupListbox({
          focusMode: 'activedescendant',
          value: [1],
          disabledOptions: [0],
          softDisabled: false,
        });
        expect(listboxElement.getAttribute('aria-activedescendant')).toBe(optionElements[1].id);
      });

      it('should set tabindex="-1" for all options', async () => {
        await setupListbox({focusMode: 'activedescendant'});
        expect(optionElements[0].getAttribute('tabindex')).toBe('-1');
        expect(optionElements[1].getAttribute('tabindex')).toBe('-1');
        expect(optionElements[2].getAttribute('tabindex')).toBe('-1');
        expect(optionElements[3].getAttribute('tabindex')).toBe('-1');
        expect(optionElements[4].getAttribute('tabindex')).toBe('-1');
      });
    });
  });

  describe('value and selection', () => {
    it('should select the options corresponding to the value input', async () => {
      await setupListbox({multi: true, value: [1, 3]});
      expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
      expect(optionElements[3].getAttribute('aria-selected')).toBe('true');
      expect(listboxInstance.value()).toEqual([1, 3]);
    });

    it('should update the value model when an option is selected via UI (single select)', async () => {
      await setupListbox({multi: false});
      await click(1);
      expect(listboxInstance.value()).toEqual([1]);
      await click(2);
      expect(listboxInstance.value()).toEqual([2]);
    });

    it('should update the value model when options are selected via UI (multi select)', async () => {
      await setupListbox({multi: true});
      await click(1);
      expect(listboxInstance.value()).toEqual([1]);
      await click(3);
      expect(listboxInstance.value()).toEqual([1, 3]);
      await click(1);
      expect(listboxInstance.value()).toEqual([3]);
    });

    describe('pointer interactions', () => {
      describe('single select', () => {
        it('should select an option on click', async () => {
          await setupListbox({multi: false});
          await click(1);
          expect(listboxInstance.value()).toEqual([1]);
          expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
        });

        it('should select a new option and deselect the old one on click', async () => {
          await setupListbox({multi: false, value: [0]});
          await click(1);
          expect(listboxInstance.value()).toEqual([1]);
          expect(optionElements[0].getAttribute('aria-selected')).toBe('false');
          expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
        });
      });

      describe('multi select', () => {
        describe('selection follows focus', () => {
          it('should select only the clicked option with a simple click', async () => {
            await setupListbox({multi: true, selectionMode: 'follow', value: [0]});
            await click(1);
            expect(listboxInstance.value()).toEqual([1]);
            expect(optionElements[0].getAttribute('aria-selected')).toBe('false');
            expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
          });

          it('should toggle the selected state of an option with ctrl + click', async () => {
            await setupListbox({multi: true, selectionMode: 'follow', value: [0]});
            await click(1, {ctrlKey: true});
            expect(listboxInstance.value().sort()).toEqual([0, 1]);
            expect(optionElements[0].getAttribute('aria-selected')).toBe('true');
            expect(optionElements[1].getAttribute('aria-selected')).toBe('true');

            await click(0, {ctrlKey: true});
            expect(listboxInstance.value()).toEqual([1]);
            expect(optionElements[0].getAttribute('aria-selected')).toBe('false');
            expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
          });

          it('should select a range starting from the first option on shift + click', async () => {
            await setupListbox({multi: true, selectionMode: 'follow', value: [0]});
            await click(2, {shiftKey: true});
            expect(listboxInstance.value().sort()).toEqual([0, 1, 2]);
            expect(optionElements[0].getAttribute('aria-selected')).toBe('true');
            expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
            expect(optionElements[2].getAttribute('aria-selected')).toBe('true');
          });

          it('should select a range starting from the current active option on shift + click', async () => {
            await setupListbox({multi: true, selectionMode: 'follow'});
            await click(1);
            await click(3, {shiftKey: true});
            expect(listboxInstance.value().sort()).toEqual([1, 2, 3]);
          });

          it('should not select disabled options on shift + click', async () => {
            await setupListbox({multi: true, selectionMode: 'follow', disabledOptions: [1]});
            await click(2, {shiftKey: true});
            expect(listboxInstance.value()).toEqual([0, 2]);
          });
        });

        describe('explicit selection', () => {
          it('should toggle selection of the clicked option with a simple click', async () => {
            await setupListbox({multi: true, selectionMode: 'explicit', value: [0]});
            await click(1);
            expect(listboxInstance.value().sort()).toEqual([0, 1]);
            expect(optionElements[0].getAttribute('aria-selected')).toBe('true');
            expect(optionElements[1].getAttribute('aria-selected')).toBe('true');

            await click(0);
            expect(listboxInstance.value()).toEqual([1]);
            expect(optionElements[0].getAttribute('aria-selected')).toBe('false');
          });

          it('should select a range starting from the first option on shift + click', async () => {
            await setupListbox({multi: true, selectionMode: 'explicit', value: [0]});
            await click(2, {shiftKey: true});
            expect(listboxInstance.value().sort()).toEqual([0, 1, 2]);
          });

          it('should select a range starting from the current active option on shift + click', async () => {
            await setupListbox({multi: true, selectionMode: 'explicit'});
            await click(1);
            await click(3, {shiftKey: true});
            expect(listboxInstance.value().sort()).toEqual([1, 2, 3]);
          });

          it('should not select disabled options on shift + click', async () => {
            await setupListbox({multi: true, selectionMode: 'follow', disabledOptions: [1]});
            await click(2, {shiftKey: true});
            expect(listboxInstance.value()).toEqual([0, 2]);
          });
        });
      });
    });

    describe('with shuffled items', () => {
      it('should update collection order when items are shuffled', async () => {
        await setupListbox({
          options: [
            {value: 1, label: 'Item 1', disabled: false},
            {value: 2, label: 'Item 2', disabled: false},
            {value: 3, label: 'Item 3', disabled: false},
          ],
        });

        // Verify initial DOM order
        expect(optionElements.length).toBe(3);
        expect(optionElements[0].textContent?.trim()).toBe('Item 1');
        expect(optionElements[2].textContent?.trim()).toBe('Item 3');

        const testComponent = fixture.componentInstance as ListboxExample;
        const items = testComponent.options().reverse();
        testComponent.options.set([...items]);
        await fixture.whenStable();
        await waitForMicrotasks();

        // Re-query elements to check new DOM order
        defineTestVariables(fixture);

        expect(optionElements.length).toBe(3);
        expect(optionElements[0].textContent?.trim()).toBe('Item 3');
        expect(optionElements[2].textContent?.trim()).toBe('Item 1');
      });
    });

    describe('structural validations', () => {
      let consoleSpy: jasmine.Spy;

      beforeEach(() => {
        consoleSpy = spyOn(console, 'warn');
      });

      afterEach(async () => {
        TestBed.resetTestingModule();
        await setupListbox();
      });

      it('should warn when duplicate option values are detected inside ngListbox', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          imports: [ListboxWithDuplicateValues],
        });
        const duplicateFixture = TestBed.createComponent(ListboxWithDuplicateValues);
        duplicateFixture.detectChanges();

        expect(consoleSpy).toHaveBeenCalledWith(
          "Duplicate option value 'item0' detected inside ngListbox.",
        );
      });

      it('should warn when duplicate option IDs are detected inside ngListbox', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          imports: [ListboxWithDuplicateIds],
        });
        const duplicateFixture = TestBed.createComponent(ListboxWithDuplicateIds);
        duplicateFixture.detectChanges();

        expect(consoleSpy).toHaveBeenCalledWith(
          "Duplicate option ID 'option0' detected inside ngListbox.",
        );
      });

      it('should warn when single-select listbox has multiple selected options', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          imports: [SingleSelectListboxWithMultipleValues],
        });
        const singleSelectFixture = TestBed.createComponent(SingleSelectListboxWithMultipleValues);
        singleSelectFixture.detectChanges();

        expect(consoleSpy).toHaveBeenCalledWith(
          'A single-select listbox should not have multiple selected options. Selected options: item0, item1',
        );
      });
    });

    describe('keyboard interactions', () => {
      describe('single select', () => {
        describe('selection follows focus', () => {
          it('should select the next option on ArrowDown', async () => {
            await setupListbox({multi: false, selectionMode: 'follow'});
            await down();
            expect(listboxInstance.value()).toEqual([1]);
            expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
            await down();
            expect(listboxInstance.value()).toEqual([2]);
            expect(optionElements[2].getAttribute('aria-selected')).toBe('true');
          });

          it('should select the previous option on ArrowUp', async () => {
            await setupListbox({multi: false, selectionMode: 'follow', value: [2]});
            await up();
            expect(listboxInstance.value()).toEqual([1]);
            expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
          });

          it('should select the first option on Home', async () => {
            await setupListbox({multi: false, selectionMode: 'follow', value: [2]});
            await home();
            expect(listboxInstance.value()).toEqual([0]);
          });

          it('should select the last option on End', async () => {
            await setupListbox({multi: false, selectionMode: 'follow', value: [2]});
            await end();
            expect(listboxInstance.value()).toEqual([4]);
          });
        });

        describe('explicit selection', () => {
          it('should move focus but not select on navigation', async () => {
            await setupListbox({multi: false, selectionMode: 'explicit'});
            await down();
            await up();
            await home();
            await end();
            expect(listboxInstance.value()).toEqual([]);
            expect(optionElements[1].getAttribute('aria-selected')).toBe('false');
          });

          it('should select the focused option on Space', async () => {
            await setupListbox({multi: false, selectionMode: 'explicit'});
            await down();
            await space();
            expect(listboxInstance.value()).toEqual([1]);
            expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
            await down();
            await down();
            await space();
            expect(listboxInstance.value()).toEqual([3]);
            expect(optionElements[1].getAttribute('aria-selected')).toBe('false');
            expect(optionElements[3].getAttribute('aria-selected')).toBe('true');
          });

          it('should select the focused option on Enter', async () => {
            await setupListbox({multi: false, selectionMode: 'explicit'});
            await down();
            await enter();
            expect(listboxInstance.value()).toEqual([1]);
            expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
          });
        });
      });

      describe('multi select', () => {
        describe('selection follows focus', () => {
          it('should select only the focused option on ArrowDown (no modifier)', async () => {
            await setupListbox({multi: true, selectionMode: 'follow', value: [0]});
            await down();
            expect(listboxInstance.value()).toEqual([1]);
            expect(optionElements[0].getAttribute('aria-selected')).toBe('false');
            expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
          });

          it('should move focus but not change selection on ctrl + ArrowDown, then toggle with ctrl + Space', async () => {
            await setupListbox({multi: true, selectionMode: 'follow', value: [0]});
            await down({ctrlKey: true});
            expect(listboxInstance.value()).toEqual([0]);
            await space({ctrlKey: true});
            expect(listboxInstance.value().sort()).toEqual([0, 1]);
          });

          it('should toggle selection of the focused item on ctrl + Space', async () => {
            await setupListbox({multi: true, selectionMode: 'follow', value: [0]});
            await space({ctrlKey: true});
            expect(listboxInstance.value()).toEqual([]);
            await down();
            expect(listboxInstance.value()).toEqual([1]);
            await space({ctrlKey: true});
            expect(listboxInstance.value()).toEqual([]);
          });

          it('should extend selection on shift + ArrowDown', async () => {
            await setupListbox({multi: true, selectionMode: 'follow', value: [0]});
            await down({shiftKey: true});
            expect(listboxInstance.value().sort()).toEqual([0, 1]);
            await down({shiftKey: true});
            expect(listboxInstance.value().sort()).toEqual([0, 1, 2]);
          });

          it('should select all on Ctrl+A, then select active on second Ctrl+A', async () => {
            await setupListbox({multi: true, selectionMode: 'follow', value: [0]});
            await keydown('A', {ctrlKey: true});
            expect(listboxInstance.value().sort()).toEqual([0, 1, 2, 3, 4]);

            await keydown('A', {ctrlKey: true});
            expect(listboxInstance.value()).toEqual([0]);
          });
        });

        describe('explicit selection', () => {
          it('should move focus but not select on ArrowDown', async () => {
            await setupListbox({multi: true, selectionMode: 'explicit'});
            await down();
            expect(listboxInstance.value()).toEqual([]);
          });

          it('should toggle selection of the focused item on Space', async () => {
            await setupListbox({multi: true, selectionMode: 'explicit'});
            await down();
            await space();
            expect(listboxInstance.value()).toEqual([1]);
            await down();
            await space();
            expect(listboxInstance.value().sort()).toEqual([1, 2]);
            await space();
            expect(listboxInstance.value()).toEqual([1]);
          });

          it('should toggle selection of the focused item on Enter', async () => {
            await setupListbox({multi: true, selectionMode: 'explicit'});
            await down();
            await enter();
            expect(listboxInstance.value()).toEqual([1]);
          });

          it('should extend selection on Shift+ArrowDown', async () => {
            await setupListbox({multi: true, selectionMode: 'explicit'});
            await down({shiftKey: true});
            expect(listboxInstance.value().sort()).toEqual([0, 1]);
            await down({shiftKey: true});
            expect(listboxInstance.value().sort()).toEqual([0, 1, 2]);
          });

          it('should move selection anchor along with focus during normal non-shift navigation', async () => {
            await setupListbox({multi: true, selectionMode: 'explicit'});
            await down({shiftKey: true});
            expect(listboxInstance.value().sort()).toEqual([0, 1]);
            await down();
            await down();
            await down();
            await up({shiftKey: true});
            expect(listboxInstance.value().sort()).toEqual([0, 1, 3, 4]);
          });

          it('should toggle selection of all options on Ctrl+A', async () => {
            await setupListbox({multi: true, selectionMode: 'explicit', value: [0]});
            await keydown('A', {ctrlKey: true});
            expect(listboxInstance.value().sort()).toEqual([0, 1, 2, 3, 4]);

            await keydown('A', {ctrlKey: true});
            expect(listboxInstance.value()).toEqual([]);
          });
        });
      });
    });
  });

  function runNavigationTests(
    focusMode: 'roving' | 'activedescendant',
    isFocused: (index: number) => boolean,
  ) {
    describe(`keyboard navigation (focusMode="${focusMode}")`, () => {
      it('should move focus to the last focusable option on End', async () => {
        await setupListbox({focusMode, disabledOptions: [4]});
        await end();
        expect(isFocused(4)).toBe(true);
      });

      it('should move focus to the first focusable option on Home', async () => {
        await setupListbox({focusMode, disabledOptions: [0]});
        await end();
        await home();
        expect(isFocused(0)).toBe(true);
      });

      it('should allow keyboard navigation if the group is readonly', async () => {
        await setupListbox({focusMode, orientation: 'horizontal', readonly: true});
        await right();
        expect(isFocused(1)).toBe(true);
      });

      it('should wrap focus from last to first with ArrowDown when wrap is true (vertical)', async () => {
        await setupListbox({focusMode, orientation: 'vertical', wrap: true});
        for (let i = 0; i < optionElements.length - 1; i++) await down();
        await down();
        expect(isFocused(0)).toBe(true);
      });

      it('should not wrap focus from last to first with ArrowDown when wrap is false (vertical)', async () => {
        await setupListbox({focusMode, orientation: 'vertical', wrap: false});
        for (let i = 0; i < optionElements.length - 1; i++) await down();
        await down();
        expect(isFocused(optionElements.length - 1)).toBe(true);
      });

      describe('vertical orientation', () => {
        it('should move focus to the next option on ArrowDown', async () => {
          await setupListbox({focusMode, orientation: 'vertical'});
          await down();
          expect(isFocused(1)).toBe(true);
        });

        it('should skip disabled options with ArrowDown (softDisabled="false")', async () => {
          await setupListbox({
            focusMode,
            orientation: 'vertical',
            softDisabled: false,
            disabledOptions: [1, 2],
          });
          await down();
          expect(isFocused(3)).toBe(true);
        });

        it('should not skip disabled options with ArrowDown (softDisabled="true")', async () => {
          await setupListbox({
            focusMode,
            orientation: 'vertical',
            softDisabled: true,
            disabledOptions: [1, 2],
          });
          await down();
          expect(isFocused(1)).toBe(true);
        });

        it('should not be focusable ArrowDown when completely disabled', async () => {
          await setupListbox({
            focusMode,
            orientation: 'vertical',
            softDisabled: true,
            disabled: true,
          });

          await down();
          expect(isFocused(0)).toBe(false);
        });
      });

      describe('horizontal orientation', () => {
        it('should move focus to the next option on ArrowRight', async () => {
          await setupListbox({focusMode, orientation: 'horizontal'});
          await right();
          expect(isFocused(1)).toBe(true);
        });

        describe('text direction rtl', () => {
          it('should move focus to the next option on ArrowLeft (rtl)', async () => {
            await setupListbox({focusMode, textDirection: 'rtl', orientation: 'horizontal'});
            await left();
            expect(isFocused(1)).toBe(true);
          });
        });
      });
    });

    describe(`pointer navigation (focusMode="${focusMode}")`, () => {
      it('should move focus to the clicked option', async () => {
        await setupListbox({focusMode});
        await click(3);
        expect(isFocused(3)).toBe(true);
      });

      it('should move focus to the clicked disabled option', async () => {
        await setupListbox({focusMode, disabledOptions: [2], softDisabled: true});
        await click(2);
        expect(isFocused(2)).toBe(true);
      });

      it('should move focus if listbox is readonly', async () => {
        await setupListbox({focusMode, readonly: true});
        await click(3);
        expect(isFocused(3)).toBe(true);
      });
    });

    describe(`typeahead functionality (focusMode="${focusMode}")`, () => {
      const getOptions = () => [
        {value: 0, label: 'Apple', disabled: false},
        {value: 1, label: 'Apricot', disabled: false},
        {value: 2, label: 'Banana', disabled: false},
        {value: 3, label: 'Blueberry', disabled: false},
        {value: 4, label: 'Orange', disabled: false},
      ];

      it('should focus the first matching option when typing characters', async () => {
        await setupListbox({options: getOptions(), focusMode});
        await type('B');
        expect(isFocused(2)).toBe(true);
        await type('l');
        expect(isFocused(3)).toBe(true);
      });

      it('should select the focused option if selectionMode is "follow"', async () => {
        await setupListbox({options: getOptions(), focusMode, selectionMode: 'follow'});
        await type('O');
        expect(isFocused(4)).toBe(true);
        expect(listboxInstance.value()).toEqual([4]);
        expect(optionElements[4].getAttribute('aria-selected')).toBe('true');
      });

      it('should not select the focused option if selectionMode is "explicit"', async () => {
        await setupListbox({options: getOptions(), focusMode, selectionMode: 'explicit'});
        await type('O');
        expect(isFocused(4)).toBe(true);
        expect(listboxInstance.value()).toEqual([]);
        expect(optionElements[4].getAttribute('aria-selected')).toBe('false');
      });

      it('should reset search term after typeaheadDelay', async () => {
        await setupListbox({options: getOptions(), focusMode, typeaheadDelay: 100});

        await type('A');
        expect(isFocused(1)).toBe(true);
        await new Promise(resolve => setTimeout(resolve, 200));

        await type('A');
        expect(isFocused(0)).toBe(true);
      });

      it('should skip disabled options with typeahead (softDisabled=false)', async () => {
        await setupListbox({
          options: getOptions(),
          focusMode,
          disabledOptions: [2],
          softDisabled: false,
        });
        await type('B');
        expect(isFocused(3)).toBe(true);
      });

      it('should focus disabled options with typeahead if softDisabled=true', async () => {
        await setupListbox({
          options: getOptions(),
          focusMode,
          disabledOptions: [2],
          softDisabled: true,
        });
        await type('B');
        expect(isFocused(2)).toBe(true);
      });
    });
  }

  runNavigationTests('roving', i => {
    return optionElements[i] && optionElements[i].getAttribute('tabindex') === '0';
  });

  runNavigationTests('activedescendant', i => {
    return (
      listboxElement &&
      optionElements[i] &&
      listboxElement.getAttribute('aria-activedescendant') === optionElements[i].id
    );
  });

  describe('failure cases', () => {
    it('should handle an empty set of options gracefully', async () => {
      await setupListbox({options: []});
      expect(optionElements.length).toBe(0);
      await down();
      await space();
      expect(listboxInstance.value()).toEqual([]);
    });
  });

  describe('item mutations and focus stability', () => {
    it('should recover focus by shifting to the default state if the active option is removed', async () => {
      await setupListbox({focusMode: 'activedescendant'});
      await click(2);
      expect(listboxElement.getAttribute('aria-activedescendant')).toBe(optionElements[2].id);

      const testComponent = fixture.componentInstance as ListboxExample;
      const updatedOptions = testComponent.options().filter(o => o.value !== 2);
      testComponent.options.set(updatedOptions);
      await fixture.whenStable();
      await waitForMicrotasks();
      defineTestVariables(fixture);

      expect(listboxElement.getAttribute('aria-activedescendant')).toBe(optionElements[0].id);
    });
  });
});

interface TestOption {
  value: number;
  label: string;
  disabled: boolean;
}

@Component({
  template: `
    <ul
      ngListbox
      aria-label="Test Listbox"
      [(value)]="value"
      [disabled]="disabled"
      [readonly]="readonly"
      [focusMode]="focusMode"
      [orientation]="orientation"
      [softDisabled]="softDisabled"
      [multi]="multi"
      [wrap]="wrap"
      [selectionMode]="selectionMode"
      [typeaheadDelay]="typeaheadDelay"
      [tabIndex]="tabIndex">
      @for (option of options(); track option.value) {
        <li ngOption [value]="option.value" [disabled]="option.disabled" [label]="option.label">{{ option.label }}</li>
      }
    </ul>
  `,
  imports: [Listbox, Option],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ListboxExample {
  options = signal<TestOption[]>([
    {value: 0, label: 'Option 0', disabled: false},
    {value: 1, label: 'Option 1', disabled: false},
    {value: 2, label: 'Option 2', disabled: false},
    {value: 3, label: 'Option 3', disabled: false},
    {value: 4, label: 'Option 4', disabled: false},
  ]);

  value: number[] = [];
  disabled = false;
  readonly = false;
  softDisabled = true;
  focusMode: 'roving' | 'activedescendant' = 'roving';
  orientation: 'vertical' | 'horizontal' = 'vertical';
  multi = false;
  wrap = true;
  selectionMode: 'follow' | 'explicit' = 'explicit';
  typeaheadDelay = 500;
  tabIndex: number | undefined = undefined;
}

@Component({
  template: `
    <ul aria-label="Test Listbox" ngListbox>
      <li ngOption [value]="0">0</li>
      <li ngOption [value]="1">1</li>
      <li ngOption [value]="2">2</li>
    </ul>
  `,
  imports: [Listbox, Option],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class DefaultListboxExample {}

@Component({
  template: `
    <ul ngListbox>
      <li ngOption value="item0">Item 0</li>
      <li ngOption value="item0">Item 0 Copy</li>
    </ul>
  `,
  imports: [Listbox, Option],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ListboxWithDuplicateValues {}

@Component({
  template: `
    <ul ngListbox>
      <li ngOption value="item0" id="option0">Item 0</li>
      <li ngOption value="item1" id="option0">Item 1</li>
    </ul>
  `,
  imports: [Listbox, Option],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ListboxWithDuplicateIds {}

@Component({
  template: `
    <ul ngListbox [multi]="false" [value]="['item0', 'item1']">
      <li ngOption value="item0">Item 0</li>
      <li ngOption value="item1">Item 1</li>
    </ul>
  `,
  imports: [Listbox, Option],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class SingleSelectListboxWithMultipleValues {}
