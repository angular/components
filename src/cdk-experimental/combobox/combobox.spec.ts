import {Component, DebugElement, signal} from '@angular/core';
import {ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {
  CdkCombobox,
  CdkComboboxInput,
  CdkComboboxPopup,
  CdkComboboxPopupContainer,
} from '@angular/cdk-experimental/combobox';
import {CdkListbox, CdkOption} from '@angular/cdk-experimental/listbox';
import {runAccessibilityChecks} from '@angular/cdk/testing/private';
import {
  CdkTree,
  CdkTreeItem,
  CdkTreeItemGroup,
  CdkTreeItemGroupContent,
} from '@angular/cdk-experimental/tree';
import {NgTemplateOutlet} from '@angular/common';

describe('Combobox', () => {
  describe('with Listbox', () => {
    let fixture: ComponentFixture<ComboboxListboxExample>;
    let inputElement: HTMLInputElement;
    let comboboxInstance: CdkCombobox<string>;

    const keydown = (key: string, modifierKeys: {} = {}) => {
      focus();
      inputElement.dispatchEvent(
        new KeyboardEvent('keydown', {
          key,
          bubbles: true,
          ...modifierKeys,
        }),
      );
      fixture.detectChanges();
    };

    const input = (value: string) => {
      focus();
      inputElement.value = value;
      inputElement.dispatchEvent(new Event('input', {bubbles: true}));
      fixture.detectChanges();
    };

    const click = (element: HTMLElement, eventInit?: PointerEventInit) => {
      focus();
      element.dispatchEvent(new PointerEvent('pointerup', {bubbles: true, ...eventInit}));
      fixture.detectChanges();
    };

    const focus = () => {
      inputElement.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
      fixture.detectChanges();
    };

    const blur = (relatedTarget?: EventTarget) => {
      inputElement.dispatchEvent(new FocusEvent('focusout', {bubbles: true, relatedTarget}));
      fixture.detectChanges();
    };

    const up = (modifierKeys?: {}) => keydown('ArrowUp', modifierKeys);
    const down = (modifierKeys?: {}) => keydown('ArrowDown', modifierKeys);
    const enter = (modifierKeys?: {}) => keydown('Enter', modifierKeys);
    const escape = (modifierKeys?: {}) => keydown('Escape', modifierKeys);

    function setupCombobox(opts: {filterMode?: 'manual' | 'auto-select' | 'highlight'} = {}) {
      TestBed.configureTestingModule({});
      fixture = TestBed.createComponent(ComboboxListboxExample);
      const testComponent = fixture.componentInstance;

      if (opts.filterMode) {
        testComponent.filterMode.set(opts.filterMode);
      }

      fixture.detectChanges();
      defineTestVariables();
    }

    function defineTestVariables() {
      const comboboxDebugElement = fixture.debugElement.query(By.directive(CdkCombobox));
      comboboxInstance = comboboxDebugElement.injector.get(CdkCombobox);
      const inputDebugElement = fixture.debugElement.query(By.directive(CdkComboboxInput));
      inputElement = inputDebugElement.nativeElement as HTMLInputElement;
    }

    function getOption(text: string): HTMLElement | null {
      const options = fixture.debugElement
        .queryAll(By.directive(CdkOption))
        .map((debugEl: DebugElement) => debugEl.nativeElement as HTMLElement);
      return options.find(option => option.textContent?.trim() === text) || null;
    }

    function getOptions(): HTMLElement[] {
      return fixture.debugElement
        .queryAll(By.directive(CdkOption))
        .map((debugEl: DebugElement) => debugEl.nativeElement as HTMLElement);
    }

    afterEach(async () => await runAccessibilityChecks(fixture.nativeElement));

    describe('ARIA attributes and roles', () => {
      beforeEach(() => setupCombobox());

      it('should have the combobox role on the input', () => {
        expect(inputElement.getAttribute('role')).toBe('combobox');
      });

      it('should have aria-haspopup set to listbox', () => {
        focus();
        expect(inputElement.getAttribute('aria-haspopup')).toBe('listbox');
      });

      it('should set aria-controls to the listbox id', () => {
        focus();
        const listbox = fixture.debugElement.query(By.directive(CdkListbox)).nativeElement;
        expect(inputElement.getAttribute('aria-controls')).toBe(listbox.id);
      });

      it('should set aria-autocomplete to list for manual mode', () => {
        expect(inputElement.getAttribute('aria-autocomplete')).toBe('list');
      });

      it('should set aria-autocomplete to list for auto-select mode', () => {
        fixture.componentInstance.filterMode.set('auto-select');
        fixture.detectChanges();
        expect(inputElement.getAttribute('aria-autocomplete')).toBe('list');
      });

      it('should set aria-autocomplete to both for highlight mode', () => {
        fixture.componentInstance.filterMode.set('highlight');
        fixture.detectChanges();
        expect(inputElement.getAttribute('aria-autocomplete')).toBe('both');
      });

      it('should set aria-multiselectable to false on the listbox', () => {
        focus();
        const listbox = fixture.debugElement.query(By.directive(CdkListbox)).nativeElement;
        expect(listbox.getAttribute('aria-multiselectable')).toBe('false');
      });

      it('should set aria-selected on the selected option', () => {
        down();
        enter();

        const appleOption = getOption('Apple')!;
        const apricotOption = getOption('Apricot')!;

        expect(appleOption.getAttribute('aria-selected')).toBe('true');
        expect(apricotOption.getAttribute('aria-selected')).toBe('false');
      });

      it('should set aria-expanded to false by default', () => {
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should toggle aria-expanded when opening and closing', () => {
        down();
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
        escape();
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should not have aria-activedescendant by default', () => {
        expect(inputElement.hasAttribute('aria-activedescendant')).toBe(false);
      });

      it('should set aria-activedescendant to the active option id', () => {
        down();
        const option = getOption('Apple')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(option.id);
      });
    });

    describe('Navigation', () => {
      beforeEach(() => setupCombobox());

      it('should navigate to the first item on ArrowDown', () => {
        down();
        const options = getOptions();
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(options[0].id);
      });

      it('should navigate to the last item on ArrowUp', () => {
        up();
        const options = getOptions();
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(
          options[options.length - 1].id,
        );
      });

      it('should navigate to the next item on ArrowDown when open', () => {
        down();
        down();
        const options = getOptions();
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(options[1].id);
      });

      it('should navigate to the previous item on ArrowUp when open', () => {
        down();
        down();
        up();
        const options = getOptions();
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(options[0].id);
      });

      it('should navigate to the first item on Home when open', () => {
        down();
        down();
        keydown('Home');
        const options = getOptions();
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(options[0].id);
      });

      it('should navigate to the last item on End when open', () => {
        down();
        keydown('End');
        const options = getOptions();
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(
          options[options.length - 1].id,
        );
      });
    });

    describe('Expansion', () => {
      beforeEach(() => setupCombobox());

      it('should open on click', () => {
        focus();
        click(inputElement);
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
      });

      it('should open on ArrowDown', () => {
        focus();
        keydown('ArrowDown');
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
      });

      it('should open on ArrowUp', () => {
        focus();
        keydown('ArrowUp');
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
      });

      it('should close on Escape', () => {
        down();
        escape();
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should close on focusout', () => {
        focus();
        blur();
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should not close on focusout if focus moves to an element inside the container', () => {
        down();
        blur(getOption('Apple')!);
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
      });

      it('should clear the completion string and not close on escape when a completion is present', () => {
        fixture.componentInstance.filterMode.set('highlight');
        focus();
        input('A');
        expect(inputElement.value).toBe('Apple');
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
        escape();
        expect(inputElement.value).toBe('A');
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
        escape();
        expect(inputElement.value).toBe('A');
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should close on enter', () => {
        down();
        enter();
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should close on click to select an item', () => {
        down();
        const fruitItem = getOption('Apple')!;
        click(fruitItem);
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });
    });

    describe('Selection', () => {
      describe('when filterMode is "manual"', () => {
        beforeEach(() => setupCombobox({filterMode: 'manual'}));

        it('should select and commit on click', () => {
          click(inputElement);
          const options = getOptions();
          click(options[0]);
          fixture.detectChanges();

          expect(comboboxInstance.value()).toBe('Apple');
          expect(inputElement.value).toBe('Apple');
        });

        it('should select and commit to input on Enter', () => {
          down();
          enter();

          expect(comboboxInstance.value()).toBe('Apple');
          expect(inputElement.value).toBe('Apple');
        });

        it('should not select on navigation', () => {
          down();
          down();

          expect(comboboxInstance.value()).toBe(undefined);
        });

        it('should select on focusout if the input text exactly matches an item', () => {
          focus();
          input('Apple');
          blur();

          expect(comboboxInstance.value()).toBe('Apple');
        });

        it('should not select on focusout if the input text does not match an item', () => {
          focus();
          input('Appl');
          blur();

          expect(comboboxInstance.value()).toBe(undefined);
          expect(inputElement.value).toBe('Appl');
        });
      });

      describe('when filterMode is "auto-select"', () => {
        beforeEach(() => setupCombobox({filterMode: 'auto-select'}));

        it('should select and commit on click', () => {
          click(inputElement);
          const options = getOptions();
          click(options[1]);
          fixture.detectChanges();

          expect(comboboxInstance.value()).toBe('Apricot');
          expect(inputElement.value).toBe('Apricot');
        });

        it('should select and commit on Enter', () => {
          down();
          down();
          enter();

          expect(comboboxInstance.value()).toBe('Apricot');
          expect(inputElement.value).toBe('Apricot');
        });

        it('should select on navigation', () => {
          down();
          expect(comboboxInstance.value()).toBe('Apple');

          down();
          expect(comboboxInstance.value()).toBe('Apricot');
        });

        it('should select the first option on input', () => {
          focus();
          input('B');

          expect(comboboxInstance.value()).toBe('Banana');
        });

        it('should commit the selected option on focusout', () => {
          focus();
          input('Apr');
          blur();

          expect(inputElement.value).toBe('Apricot');
          expect(comboboxInstance.value()).toBe('Apricot');
        });
      });

      describe('when filterMode is "highlight"', () => {
        beforeEach(() => setupCombobox({filterMode: 'highlight'}));

        it('should select and commit on click', () => {
          click(inputElement);
          const options = getOptions();
          click(options[2]);
          fixture.detectChanges();

          expect(comboboxInstance.value()).toBe('Banana');
          expect(inputElement.value).toBe('Banana');
        });

        it('should select and commit on Enter', () => {
          down();
          down();
          down();
          enter();

          expect(comboboxInstance.value()).toBe('Banana');
          expect(inputElement.value).toBe('Banana');
        });

        it('should select on navigation', () => {
          down();
          expect(comboboxInstance.value()).toBe('Apple');

          down();
          expect(comboboxInstance.value()).toBe('Apricot');
        });

        it('should update input value on navigation', () => {
          down();
          expect(inputElement.value).toBe('Apple');

          down();
          expect(inputElement.value).toBe('Apricot');
        });

        it('should select the first option on input', () => {
          focus();
          input('Canta');

          expect(comboboxInstance.value()).toBe('Cantaloupe');
        });

        it('should insert a highlighted completion string on input', fakeAsync(() => {
          focus();
          input('A');
          tick();

          expect(inputElement.value).toBe('Apple');
          expect(inputElement.selectionStart).toBe(1);
          expect(inputElement.selectionEnd).toBe(5);
        }));

        it('should commit the selected option on focusout', () => {
          focus();
          input('Apr');
          blur();

          expect(inputElement.value).toBe('Apricot');
          expect(comboboxInstance.value()).toBe('Apricot');
        });
      });
    });

    describe('with disabled options', () => {
      beforeEach(() => {
        setupCombobox();
        fixture.componentInstance.options.set([
          {name: 'Apple'},
          {name: 'Apricot', disabled: true},
          {name: 'Banana'},
          {name: 'Blackberry', disabled: true},
          {name: 'Blueberry'},
        ]);
        fixture.detectChanges();
      });

      it('should not select a disabled option by clicking', () => {
        click(inputElement);
        const disabledOption = getOption('Apricot')!;
        click(disabledOption);

        expect(comboboxInstance.value()).toBeUndefined();
      });

      it('should skip disabled options during keyboard navigation', () => {
        down(); // To Apple
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(getOption('Apple')!.id);

        down(); // Should skip Apricot and go to Banana
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(getOption('Banana')!.id);

        down(); // Should skip Blackberry and go to Blueberry
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(getOption('Blueberry')!.id);

        up(); // Back to Banana
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(getOption('Banana')!.id);

        up(); // Back to Apple
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(getOption('Apple')!.id);
      });

      it('should not select disabled option with auto-select on input', () => {
        fixture.componentInstance.filterMode.set('auto-select');
        fixture.detectChanges();

        input('Apr');

        expect(comboboxInstance.value()).toBeUndefined();
      });

      it('should not select disabled option with highlight on input', () => {
        fixture.componentInstance.filterMode.set('highlight');
        fixture.detectChanges();

        input('Apr');

        expect(comboboxInstance.value()).toBeUndefined();
        expect(inputElement.value).toBe('Apr');
      });
    });

    describe('with dynamic data', () => {
      beforeEach(() => setupCombobox());

      it('should update active item if an option is removed', () => {
        down(); // -> Apple
        down(); // -> Apricot

        const apricot = getOption('Apricot')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(apricot.id);

        fixture.componentInstance.options.set(
          fixture.componentInstance.options().filter(n => n.name !== 'Apricot'),
        );
        fixture.detectChanges();
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(null);
      });

      it('should update the combobox value if the selected item is removed', () => {
        down(); // -> Apple
        enter();
        expect(comboboxInstance.value()).toBe('Apple');
        expect(inputElement.value).toBe('Apple');

        fixture.componentInstance.options.set(
          fixture.componentInstance.options().filter(n => n.name !== 'Apple'),
        );
        fixture.detectChanges();

        expect(comboboxInstance.value()).toBeUndefined();
      });

      it('should clear active item if listbox becomes empty', () => {
        down(); // -> Apple
        expect(inputElement.hasAttribute('aria-activedescendant')).toBe(true);

        fixture.componentInstance.options.set([]);
        fixture.detectChanges();

        expect(inputElement.hasAttribute('aria-activedescendant')).toBe(false);
        expect(getOptions().length).toBe(0);
      });
    });

    describe('Filtering', () => {
      const getVisibleOptions = () => getOptions().filter(o => !o.inert);

      beforeEach(() => setupCombobox());

      it('should lazily render options', () => {
        expect(getOptions().length).toBe(0);
        focus();
        expect(getOptions().length).toBe(9);
      });

      it('should filter the options based on the input value', () => {
        focus();
        input('ap');

        let options = getVisibleOptions();
        expect(options.length).toBe(2);
        expect(options[0].textContent?.trim()).toBe('Apple');
        expect(options[1].textContent?.trim()).toBe('Apricot');

        input('apple');
        options = getVisibleOptions();
        expect(options.length).toBe(1);
        expect(options[0].textContent?.trim()).toBe('Apple');
      });

      it('should show no options if nothing matches', () => {
        focus();
        input('xyz');
        const options = getVisibleOptions();
        expect(options.length).toBe(0);
      });

      it('should show all options when the input is cleared', () => {
        focus();
        input('Apple');
        expect(getVisibleOptions().length).toBe(1);

        input('');
        expect(getVisibleOptions().length).toBe(9);
      });

      it('should allow changing the filter function', () => {
        fixture.componentInstance.filterFn.set(
          (inputText, itemText) => itemText.includes(inputText), // Case sensitive filter.
        );

        focus();
        input('apple');
        expect(getVisibleOptions().length).toBe(0);

        input('Apple');
        const options = getVisibleOptions();
        expect(options.length).toBe(1);
        expect(options[0].textContent?.trim()).toBe('Apple');
      });
    });

    // TODO(wagnermaciel): Enable these tests once we have a way to set the value
    // describe('with programmatic value changes', () => {});
  });

  describe('with Tree', () => {
    let fixture: ComponentFixture<ComboboxTreeExample>;
    let inputElement: HTMLInputElement;
    let comboboxInstance: CdkCombobox<string>;

    const keydown = (key: string, modifierKeys: {} = {}) => {
      focus();
      inputElement.dispatchEvent(
        new KeyboardEvent('keydown', {
          key,
          bubbles: true,
          ...modifierKeys,
        }),
      );
      fixture.detectChanges();
    };

    const input = (value: string) => {
      focus();
      inputElement.value = value;
      inputElement.dispatchEvent(new Event('input', {bubbles: true}));
      fixture.detectChanges();
    };

    const click = (element: HTMLElement, eventInit?: PointerEventInit) => {
      focus();
      element.dispatchEvent(new PointerEvent('pointerup', {bubbles: true, ...eventInit}));
      fixture.detectChanges();
    };

    const focus = () => {
      inputElement.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
      fixture.detectChanges();
    };

    const blur = (relatedTarget?: EventTarget) => {
      inputElement.dispatchEvent(new FocusEvent('focusout', {bubbles: true, relatedTarget}));
      fixture.detectChanges();
    };

    const up = (modifierKeys?: {}) => keydown('ArrowUp', modifierKeys);
    const down = (modifierKeys?: {}) => keydown('ArrowDown', modifierKeys);
    const left = (modifierKeys?: {}) => keydown('ArrowLeft', modifierKeys);
    const right = (modifierKeys?: {}) => keydown('ArrowRight', modifierKeys);
    const enter = (modifierKeys?: {}) => keydown('Enter', modifierKeys);
    const escape = (modifierKeys?: {}) => keydown('Escape', modifierKeys);

    function setupCombobox(opts: {filterMode?: 'manual' | 'auto-select' | 'highlight'} = {}) {
      TestBed.configureTestingModule({});
      fixture = TestBed.createComponent(ComboboxTreeExample);
      const testComponent = fixture.componentInstance;

      if (opts.filterMode) {
        testComponent.filterMode.set(opts.filterMode);
      }

      fixture.detectChanges();
      defineTestVariables();
    }

    function defineTestVariables() {
      const comboboxDebugElement = fixture.debugElement.query(By.directive(CdkCombobox));
      comboboxInstance = comboboxDebugElement.injector.get(CdkCombobox);
      const inputDebugElement = fixture.debugElement.query(By.directive(CdkComboboxInput));
      inputElement = inputDebugElement.nativeElement as HTMLInputElement;
    }

    function getTreeItem(text: string): HTMLElement | null {
      const items = fixture.debugElement
        .queryAll(By.directive(CdkTreeItem))
        .map((debugEl: DebugElement) => debugEl.nativeElement as HTMLElement);
      return items.find(item => item.textContent?.trim() === text) || null;
    }

    function getTreeItems(): HTMLElement[] {
      return fixture.debugElement
        .queryAll(By.directive(CdkTreeItem))
        .map((debugEl: DebugElement) => debugEl.nativeElement as HTMLElement);
    }

    function getVisibleTreeItems(): HTMLElement[] {
      return fixture.debugElement
        .queryAll(By.directive(CdkTreeItem))
        .map((debugEl: DebugElement) => debugEl.nativeElement as HTMLElement)
        .filter(el => !el.parentElement?.hasAttribute('inert') && !el.hasAttribute('inert'));
    }

    afterEach(async () => await runAccessibilityChecks(fixture.nativeElement));

    describe('ARIA attributes and roles', () => {
      beforeEach(() => setupCombobox());

      it('should have aria-haspopup set to tree', () => {
        focus();
        expect(inputElement.getAttribute('aria-haspopup')).toBe('tree');
      });

      it('should set aria-controls to the tree id', () => {
        down();
        const tree = fixture.debugElement.query(By.directive(CdkTree)).nativeElement;
        expect(inputElement.getAttribute('aria-controls')).toBe(tree.id);
      });

      it('should set aria-selected on the selected tree item', () => {
        down(); // -> Fruit
        enter();

        const fruitItem = getTreeItem('Fruit')!;
        expect(fruitItem.getAttribute('aria-selected')).toBe('true');
      });

      it('should toggle aria-expanded on parent nodes', () => {
        down(); // -> Fruit
        const fruitItem = getTreeItem('Fruit')!;
        expect(fruitItem.getAttribute('aria-expanded')).toBe('false');

        right(); // Expand Fruit
        expect(fruitItem.getAttribute('aria-expanded')).toBe('true');

        left(); // Collapse Fruit
        expect(fruitItem.getAttribute('aria-expanded')).toBe('false');
      });
    });

    describe('Navigation', () => {
      beforeEach(() => setupCombobox());

      it('should navigate to the first focusable item on ArrowDown', () => {
        down();
        const fruitItem = getTreeItem('Fruit')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(fruitItem.id);
      });

      it('should navigate to the last focusable item on ArrowUp', () => {
        up();
        const grainsItem = getTreeItem('Grains')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(grainsItem.id);
      });

      it('should navigate to the next focusable item on ArrowDown when open', () => {
        down();
        down();
        const vegetablesItem = getTreeItem('Vegetables')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(vegetablesItem.id);
      });

      it('should navigate to the previous item on ArrowUp when open', () => {
        up();
        up();
        const vegetablesItem = getTreeItem('Vegetables')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(vegetablesItem.id);
      });

      it('should expand a closed node on ArrowRight', () => {
        down(); // To Fruit
        expect(getVisibleTreeItems().length).toBe(3);
        right();
        fixture.detectChanges();
        expect(getVisibleTreeItems().length).toBe(6);
        const appleItem = getTreeItem('Apple')!;
        expect(appleItem).not.toBeNull();
      });

      it('should navigate to the next item on ArrowRight when already expanded', () => {
        down(); // To Fruit
        right(); // Expand Fruit
        right(); // To Apple
        const appleItem = getTreeItem('Apple')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(appleItem.id);
      });

      it('should collapse an open node on ArrowLeft', () => {
        down(); // To Fruit
        right(); // Expand Fruit
        fixture.detectChanges();
        expect(getVisibleTreeItems().length).toBe(6);
        left(); // Collapse Fruit
        fixture.detectChanges();
        expect(getVisibleTreeItems().length).toBe(3);
        const fruitItem = getTreeItem('Fruit')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(fruitItem.id);
      });

      it('should navigate to the parent node on ArrowLeft when in a child node', () => {
        down(); // To Fruit
        right(); // Expand Fruit
        right(); // To Apple
        const appleItem = getTreeItem('Apple')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(appleItem.id);
        left(); // To Fruit
        const fruitItem = getTreeItem('Fruit')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(fruitItem.id);
      });

      it('should navigate to the first focusable item on Home when open', () => {
        up();
        keydown('Home');
        const fruitItem = getTreeItem('Fruit')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(fruitItem.id);
      });

      it('should navigate to the last focusable item on End when open', () => {
        down();
        keydown('End');
        const grainsItem = getTreeItem('Grains')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(grainsItem.id);
      });
    });

    describe('Selection', () => {
      describe('when filterMode is "manual"', () => {
        beforeEach(() => setupCombobox({filterMode: 'manual'}));

        it('should select and commit on click', () => {
          click(inputElement);
          const fruitItem = getTreeItem('Fruit')!;
          click(fruitItem);
          fixture.detectChanges();

          expect(comboboxInstance.value()).toBe('Fruit');
          expect(inputElement.value).toBe('Fruit');
        });

        it('should select and commit to input on Enter', () => {
          down();
          enter();

          expect(comboboxInstance.value()).toBe('Fruit');
          expect(inputElement.value).toBe('Fruit');
        });

        it('should select on focusout if the input text exactly matches an item', () => {
          focus();
          input('Apple');
          blur();

          expect(comboboxInstance.value()).toBe('Apple');
        });

        it('should not select on navigation', () => {
          down();
          down();

          expect(comboboxInstance.value()).toBe(undefined);
        });

        it('should not select on focusout if the input text does not match an item', () => {
          focus();
          input('Appl');
          blur();

          expect(comboboxInstance.value()).toBe(undefined);
          expect(inputElement.value).toBe('Appl');
        });
      });

      describe('when filterMode is "auto-select"', () => {
        beforeEach(() => setupCombobox({filterMode: 'auto-select'}));

        it('should select and commit on click', () => {
          click(inputElement);
          down();
          right();
          const appleItem = getTreeItem('Apple')!;
          click(appleItem);
          fixture.detectChanges();

          expect(comboboxInstance.value()).toBe('Apple');
          expect(inputElement.value).toBe('Apple');
        });

        it('should select and commit on Enter', () => {
          down();
          down();
          enter();

          expect(comboboxInstance.value()).toBe('Vegetables');
          expect(inputElement.value).toBe('Vegetables');
        });

        it('should select on navigation', () => {
          down();
          expect(comboboxInstance.value()).toBe('Fruit');

          down();
          expect(comboboxInstance.value()).toBe('Vegetables');
        });

        it('should select the first option on input', () => {
          focus();
          input('B');

          expect(comboboxInstance.value()).toBe('Banana');
        });

        it('should commit the selected option on focusout', () => {
          focus();
          input('App');
          blur();

          expect(inputElement.value).toBe('Apple');
          expect(comboboxInstance.value()).toBe('Apple');
        });
      });

      describe('when filterMode is "highlight"', () => {
        beforeEach(() => setupCombobox({filterMode: 'highlight'}));

        it('should select and commit on click', () => {
          click(inputElement);
          down();
          right();
          const bananaItem = getTreeItem('Banana')!;
          click(bananaItem);
          fixture.detectChanges();

          expect(comboboxInstance.value()).toBe('Banana');
          expect(inputElement.value).toBe('Banana');
        });

        it('should select and commit on Enter', () => {
          down();
          down();
          enter();

          expect(comboboxInstance.value()).toBe('Vegetables');
          expect(inputElement.value).toBe('Vegetables');
        });

        it('should select on navigation', () => {
          down();
          expect(comboboxInstance.value()).toBe('Fruit');

          down();
          expect(comboboxInstance.value()).toBe('Vegetables');
        });

        it('should update input value on navigation', () => {
          down();
          expect(inputElement.value).toBe('Fruit');

          down();
          expect(inputElement.value).toBe('Vegetables');
        });

        it('should select the first option on input', () => {
          focus();
          input('Canta');

          expect(comboboxInstance.value()).toBe('Cantaloupe');
        });

        it('should insert a highlighted completion string on input', fakeAsync(() => {
          focus();
          input('A');
          tick();

          expect(inputElement.value).toBe('Apple');
          expect(inputElement.selectionStart).toBe(1);
          expect(inputElement.selectionEnd).toBe(5);
        }));

        it('should commit the selected option on focusout', () => {
          focus();
          input('App');
          blur();

          expect(inputElement.value).toBe('Apple');
          expect(comboboxInstance.value()).toBe('Apple');
        });
      });
    });

    describe('Expansion', () => {
      beforeEach(() => setupCombobox());

      it('should open on click', () => {
        focus();
        click(inputElement);
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
      });

      it('should open on ArrowDown', () => {
        focus();
        keydown('ArrowDown');
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
      });

      it('should open on ArrowUp', () => {
        focus();
        keydown('ArrowUp');
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
      });

      it('should close on Escape', () => {
        down();
        escape();
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should close on focusout', () => {
        focus();
        blur();
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should not close on focusout if focus moves to an element inside the container', () => {
        down();
        blur(getTreeItem('Fruit')!);
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
      });

      it('should clear the completion string and not close on escape when a completion is present', () => {
        fixture.componentInstance.filterMode.set('highlight');
        focus();
        input('A');
        expect(inputElement.value).toBe('Apple');
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
        escape();
        expect(inputElement.value).toBe('A');
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
        escape();
        expect(inputElement.value).toBe('A');
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should close on enter', () => {
        down();
        enter();
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should close on click to select an item', () => {
        down();
        const fruitItem = getTreeItem('Fruit')!;
        click(fruitItem);
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });
    });

    describe('with disabled items', () => {
      beforeEach(() => {
        setupCombobox();
        fixture.componentInstance.nodes.set([
          {
            name: 'Fruit',
            value: 'Fruit',
            children: [
              {name: 'Apple', value: 'Apple'},
              {name: 'Banana', value: 'Banana', disabled: true},
              {name: 'Cantaloupe', value: 'Cantaloupe'},
            ],
          },
          {
            name: 'Vegetables',
            value: 'Vegetables',
            disabled: true,
            children: [
              {name: 'Broccoli', value: 'Broccoli'},
              {name: 'Carrot', value: 'Carrot'},
            ],
          },
          {
            name: 'Grains',
            value: 'Grains',
          },
        ]);
        fixture.detectChanges();
      });

      it('should not select a disabled item by clicking', () => {
        click(inputElement);
        const disabledItem = getTreeItem('Vegetables')!;
        click(disabledItem);

        expect(comboboxInstance.value()).toBeUndefined();
      });

      it('should skip disabled items during keyboard navigation', () => {
        down(); // To Fruit
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(getTreeItem('Fruit')!.id);

        down(); // Should skip Vegetables and go to Grains
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(getTreeItem('Grains')!.id);

        up(); // Back to Fruit
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(getTreeItem('Fruit')!.id);
      });

      it('should skip disabled child items during keyboard navigation', () => {
        down(); // To Fruit
        right(); // Expand Fruit
        down(); // To Apple
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(getTreeItem('Apple')!.id);

        down(); // Should skip Banana and go to Cantaloupe
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(
          getTreeItem('Cantaloupe')!.id,
        );
      });

      it('should not select disabled item with auto-select on input', () => {
        fixture.componentInstance.filterMode.set('auto-select');
        fixture.detectChanges();

        input('Vege'); // Matches 'Vegetables', which is disabled.

        expect(comboboxInstance.value()).toBeUndefined();
      });

      it('should not highlight disabled item with highlight on input', () => {
        fixture.componentInstance.filterMode.set('highlight');
        fixture.detectChanges();

        input('Vege'); // Matches 'Vegetables', which is disabled.

        expect(comboboxInstance.value()).toBeUndefined();
        expect(inputElement.value).toBe('Vege');
      });

      it('should not select disabled child item with auto-select on input', () => {
        fixture.componentInstance.filterMode.set('auto-select');
        fixture.detectChanges();

        input('Bana'); // Matches 'Banana', which is disabled.

        expect(comboboxInstance.value()).toBeUndefined();
      });
    });

    describe('with dynamic data', () => {
      beforeEach(() => setupCombobox());

      it('should update active item if a top-level node is removed', () => {
        down(); // -> Fruit
        down(); // -> Vegetables

        const vegetables = getTreeItem('Vegetables')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(vegetables.id);

        fixture.componentInstance.nodes.set(
          fixture.componentInstance.nodes().filter(n => n.name !== 'Vegetables'),
        );
        fixture.detectChanges();
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(null);
      });

      it('should update active item if a child node is removed', () => {
        down(); // -> Fruit
        right(); // Expand Fruit
        down(); // -> Apple
        down(); // -> Banana

        const banana = getTreeItem('Banana')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(banana.id);

        const nodes = fixture.componentInstance.nodes();
        nodes[0].children = nodes[0].children!.filter(c => c.name !== 'Banana');
        fixture.componentInstance.nodes.set([...nodes]);
        fixture.detectChanges();

        expect(inputElement.getAttribute('aria-activedescendant')).toBe(null);
      });

      it('should update the combobox value if the selected item is removed', () => {
        down(); // -> Fruit
        enter();
        expect(comboboxInstance.value()).toBe('Fruit');
        expect(inputElement.value).toBe('Fruit');

        fixture.componentInstance.nodes.set(
          fixture.componentInstance.nodes().filter(n => n.name !== 'Fruit'),
        );
        fixture.detectChanges();

        expect(comboboxInstance.value()).toBeUndefined();
      });

      it('should clear active item if tree becomes empty', () => {
        down(); // -> Fruit
        expect(inputElement.hasAttribute('aria-activedescendant')).toBe(true);

        fixture.componentInstance.nodes.set([]);
        fixture.detectChanges();

        expect(inputElement.hasAttribute('aria-activedescendant')).toBe(false);
        expect(getVisibleTreeItems().length).toBe(0);
      });
    });

    describe('Filtering', () => {
      beforeEach(() => setupCombobox());

      it('should lazily render options', () => {
        expect(getTreeItems().length).toBe(0);
        focus();
        expect(getTreeItems().length).toBe(11);
      });

      it('should filter the options based on the input value', () => {
        focus();
        input('vegetables');

        let items = getVisibleTreeItems();
        expect(items.length).toBe(1);
        expect(items[0].textContent?.trim()).toBe('Vegetables');
      });

      it('should render parents if a child matches', () => {
        focus();
        input('broccoli');

        let items = getVisibleTreeItems();
        expect(items.length).toBe(2);
        expect(items[0].textContent?.trim()).toBe('Vegetables');
        expect(items[1].textContent?.trim()).toBe('Broccoli');
      });

      it('should show no options if nothing matches', () => {
        focus();
        input('xyz');
        expect(getVisibleTreeItems().length).toBe(0);
      });

      it('should show all options when the input is cleared', () => {
        focus();
        input('Fruit');
        expect(getVisibleTreeItems().length).toBe(1);

        input('');
        expect(getVisibleTreeItems().length).toBe(3);
      });

      it('should expand all nodes when filtering', () => {
        focus();
        expect(getVisibleTreeItems().length).toBe(3);

        input('a');
        expect(getTreeItem('Fruit')!.getAttribute('aria-expanded')).toBe('true');
        expect(getTreeItem('Vegetables')!.getAttribute('aria-expanded')).toBe('true');
        expect(getTreeItem('Grains')!.getAttribute('aria-expanded')).toBe('true');
      });

      it('should allow changing the filter function', () => {
        focus();
        fixture.componentInstance.filterFn.set(
          (inputText, itemText) => itemText.includes(inputText), // Case sensitive filter.
        );
        input('fruit');
        expect(getVisibleTreeItems().length).toBe(0);

        input('Fruit');
        const options = getVisibleTreeItems();
        expect(options.length).toBe(1);
        expect(options[0].textContent?.trim()).toBe('Fruit');
      });
    });

    // TODO(wagnermaciel): Enable these tests once we have a way to set the value
    // describe('with programmatic value changes', () => {});
  });
});

@Component({
  template: `
    <div cdkCombobox [filterMode]="filterMode()" [filter]="filterFn()">
      <input cdkComboboxInput placeholder="Search..." aria-label="Fruits" />

      <ng-template cdkComboboxPopupContainer>
        <div cdkListbox aria-label="select a fruit">
          @for (option of options(); track option.name) {
            <li cdkOption [value]="option.name" [disabled]="option.disabled">{{ option.name }}</li>
          }
        </div>
      </ng-template>
    </div>
  `,
  imports: [
    CdkCombobox,
    CdkComboboxInput,
    CdkComboboxPopup,
    CdkComboboxPopupContainer,
    CdkListbox,
    CdkOption,
  ],
})
class ComboboxListboxExample {
  filterFn = signal<(inputText: string, itemText: string) => boolean>((inputText, itemText) =>
    itemText.toLowerCase().includes(inputText.toLowerCase()),
  );
  filterMode = signal<'manual' | 'auto-select' | 'highlight'>('manual');
  options = signal<{name: string; disabled?: boolean}[]>([
    {name: 'Apple'},
    {name: 'Apricot'},
    {name: 'Banana'},
    {name: 'Blackberry'},
    {name: 'Blueberry'},
    {name: 'Cantaloupe'},
    {name: 'Cherry'},
    {name: 'Clementine'},
    {name: 'Cranberry'},
  ]);
}

@Component({
  template: `
    <div cdkCombobox [filterMode]="filterMode()" [filter]="filterFn()">
      <input cdkComboboxInput class="example-combobox-input" placeholder="Search..." />

      <ng-template cdkComboboxPopupContainer>
        <ul cdkTree #tree="cdkTree">
          <ng-template
            [ngTemplateOutlet]="treeNodes"
            [ngTemplateOutletContext]="{nodes: nodes(), parent: tree}"
          />
        </ul>

        <ng-template #treeNodes let-nodes="nodes" let-parent="parent">
          @for (node of nodes; track node.value) {
            <li
              cdkTreeItem
              [parent]="parent"
              [value]="node.value"
              [label]="node.name"
              [disabled]="node.disabled"
              #treeItem="cdkTreeItem"
            >
              {{ node.name }}
            </li>

            @if (node.children) {
              <ul cdkTreeItemGroup [ownedBy]="treeItem" #group="cdkTreeItemGroup">
                <ng-template cdkTreeItemGroupContent>
                  <ng-template
                    [ngTemplateOutlet]="treeNodes"
                    [ngTemplateOutletContext]="{nodes: node.children, parent: group}"
                  />
                </ng-template>
              </ul>
            }
          }
        </ng-template>
      </ng-template>
    </div>
  `,
  imports: [
    CdkCombobox,
    CdkComboboxInput,
    CdkComboboxPopupContainer,
    CdkTree,
    CdkTreeItem,
    CdkTreeItemGroup,
    CdkTreeItemGroupContent,
    NgTemplateOutlet,
  ],
})
class ComboboxTreeExample {
  filterFn = signal<(inputText: string, itemText: string) => boolean>((inputText, itemText) =>
    itemText.toLowerCase().includes(inputText.toLowerCase()),
  );
  filterMode = signal<'manual' | 'auto-select' | 'highlight'>('manual');
  nodes = signal<
    {
      name: string;
      value: string;
      disabled?: boolean;
      children?: {name: string; value: string; disabled?: boolean}[];
    }[]
  >([
    {
      name: 'Fruit',
      value: 'Fruit',
      children: [
        {name: 'Apple', value: 'Apple'},
        {name: 'Banana', value: 'Banana'},
        {name: 'Cantaloupe', value: 'Cantaloupe'},
      ],
    },
    {
      name: 'Vegetables',
      value: 'Vegetables',
      children: [
        {name: 'Broccoli', value: 'Broccoli'},
        {name: 'Carrot', value: 'Carrot'},
        {name: 'Lettuce', value: 'Lettuce'},
      ],
    },
    {
      name: 'Grains',
      value: 'Grains',
      children: [
        {name: 'Rice', value: 'Rice'},
        {name: 'Wheat', value: 'Wheat'},
      ],
    },
  ]);
}
