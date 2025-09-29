import {Component, computed, DebugElement, signal} from '@angular/core';
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
        expect(getOption('Alabama')!.getAttribute('aria-selected')).toBe('true');
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
        const option = getOption('Alabama')!;
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
        blur(getOption('Alabama')!);
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
      });

      it('should clear the completion string and not close on escape when a completion is present', () => {
        fixture.componentInstance.filterMode.set('highlight');
        focus();
        input('A');
        expect(inputElement.value).toBe('Alabama');
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
        const fruitItem = getOption('Alabama')!;
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

          expect(fixture.componentInstance.value()).toEqual(['Alabama']);
          expect(inputElement.value).toBe('Alabama');
        });

        it('should select and commit to input on Enter', () => {
          focus();
          down();
          enter();

          expect(fixture.componentInstance.value()).toEqual(['Alabama']);
          expect(inputElement.value).toBe('Alabama');
        });

        it('should not select on navigation', () => {
          down();
          down();

          expect(fixture.componentInstance.value()).toEqual([]);
        });

        it('should select on focusout if the input text exactly matches an item', () => {
          focus();
          input('Alabama');
          blur();

          expect(fixture.componentInstance.value()).toEqual(['Alabama']);
        });

        it('should not select on focusout if the input text does not match an item', () => {
          focus();
          input('Appl');
          blur();

          expect(fixture.componentInstance.value()).toEqual([]);
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

          expect(fixture.componentInstance.value()).toEqual(['Alaska']);
          expect(inputElement.value).toBe('Alaska');
        });

        it('should select and commit on Enter', () => {
          down();
          down();
          enter();

          expect(fixture.componentInstance.value()).toEqual(['Alaska']);
          expect(inputElement.value).toBe('Alaska');
        });

        it('should select on navigation', () => {
          down();
          expect(fixture.componentInstance.value()).toEqual(['Alabama']);

          down();
          expect(fixture.componentInstance.value()).toEqual(['Alaska']);

          down();
          expect(fixture.componentInstance.value()).toEqual(['Arizona']);
        });

        it('should select the first option on input', () => {
          focus();
          input('W');

          expect(fixture.componentInstance.value()).toEqual(['Washington']);
        });

        it('should commit the selected option on focusout', () => {
          focus();
          input('G');
          blur();

          expect(inputElement.value).toBe('Georgia');
          expect(fixture.componentInstance.value()).toEqual(['Georgia']);
        });
      });

      describe('when filterMode is "highlight"', () => {
        beforeEach(() => setupCombobox({filterMode: 'highlight'}));

        it('should select and commit on click', () => {
          click(inputElement);
          const options = getOptions();
          click(options[2]);
          fixture.detectChanges();

          expect(fixture.componentInstance.value()).toEqual(['Arizona']);
          expect(inputElement.value).toBe('Arizona');
        });

        it('should select and commit on Enter', () => {
          down();
          down();
          down();
          enter();

          expect(fixture.componentInstance.value()).toEqual(['Arizona']);
          expect(inputElement.value).toBe('Arizona');
        });

        it('should select on navigation', () => {
          down();
          expect(fixture.componentInstance.value()).toEqual(['Alabama']);

          down();
          expect(fixture.componentInstance.value()).toEqual(['Alaska']);
        });

        it('should update input value on navigation', () => {
          down();
          expect(inputElement.value).toBe('Alabama');

          down();
          expect(inputElement.value).toBe('Alaska');
        });

        it('should select the first option on input', () => {
          focus();
          input('Cali');

          expect(fixture.componentInstance.value()).toEqual(['California']);
        });

        it('should insert a highlighted completion string on input', fakeAsync(() => {
          focus();
          input('A');
          tick();

          expect(inputElement.value).toBe('Alabama');
          expect(inputElement.selectionStart).toBe(1);
          expect(inputElement.selectionEnd).toBe(7);
        }));

        it('should commit the selected option on focusout', () => {
          focus();
          input('Cali');
          blur();

          expect(inputElement.value).toBe('California');
          expect(fixture.componentInstance.value()).toEqual(['California']);
        });
      });
    });

    // TODO(wagnermaciel): Add unit tests for disabled options.

    describe('Filtering', () => {
      beforeEach(() => setupCombobox());

      it('should lazily render options', () => {
        expect(getOptions().length).toBe(0);
        focus();
        expect(getOptions().length).toBe(50);
      });

      it('should filter the options based on the input value', () => {
        focus();
        input('New');

        const options = getOptions();
        expect(options.length).toBe(4);
        expect(options[0].textContent?.trim()).toBe('New Hampshire');
        expect(options[1].textContent?.trim()).toBe('New Jersey');
        expect(options[2].textContent?.trim()).toBe('New Mexico');
        expect(options[3].textContent?.trim()).toBe('New York');
      });

      it('should show no options if nothing matches', () => {
        focus();
        input('xyz');
        const options = getOptions();
        expect(options.length).toBe(0);
      });

      it('should show all options when the input is cleared', () => {
        focus();
        input('Alabama');
        expect(getOptions().length).toBe(1);

        input('');
        expect(getOptions().length).toBe(50);
      });
    });

    // describe('with programmatic value changes', () => {
    //   // TODO(wagnermaciel): Figure out if there's a way to automatically update the
    //   // input value when the popup value signal is updated programmatically.
    //   it('should update the selected item when the value is set programmatically', () => {
    //     setupCombobox();
    //     focus();
    //     fixture.componentInstance.value.set(['Banana']);
    //     fixture.detectChanges();
    //     expect(fixture.componentInstance.value()).toEqual(['Banana']);
    //     const bananaOption = getOption('Banana')!;
    //     expect(bananaOption.getAttribute('aria-selected')).toBe('true');
    //   });
    // });
  });

  describe('with Tree', () => {
    let fixture: ComponentFixture<ComboboxTreeExample>;
    let inputElement: HTMLInputElement;

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

    const input = (value: string, opts: {backspace?: boolean} = {}) => {
      focus();
      inputElement.value = value;
      const event = opts.backspace
        ? new InputEvent('input', {inputType: 'deleteContentBackward', bubbles: true})
        : new InputEvent('input', {bubbles: true});
      inputElement.dispatchEvent(event);
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
        .filter(el => {
          if (el.parentElement?.role === 'group') {
            return (
              el.parentElement.previousElementSibling?.getAttribute('aria-expanded') === 'true'
            );
          }
          return true;
        });
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
        down();
        enter();

        const item = getTreeItem('Winter')!;
        expect(item.getAttribute('aria-selected')).toBe('true');
      });

      it('should toggle aria-expanded on parent nodes', () => {
        down();
        const item = getTreeItem('Winter')!;
        expect(item.getAttribute('aria-expanded')).toBe('false');

        right();
        expect(item.getAttribute('aria-expanded')).toBe('true');

        left();
        expect(item.getAttribute('aria-expanded')).toBe('false');
      });
    });

    describe('Navigation', () => {
      beforeEach(() => setupCombobox());

      it('should navigate to the first focusable item on ArrowDown', () => {
        down();
        const item = getTreeItem('Winter')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item.id);
      });

      it('should navigate to the last focusable item on ArrowUp', () => {
        up();
        const item = getTreeItem('Fall')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item.id);
      });

      it('should navigate to the next focusable item on ArrowDown when open', () => {
        down();
        down();
        const item = getTreeItem('Spring')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item.id);
      });

      it('should navigate to the previous item on ArrowUp when open', () => {
        up();
        up();
        const item = getTreeItem('Summer')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item.id);
      });

      it('should expand a closed node on ArrowRight', () => {
        down();
        expect(getVisibleTreeItems().length).toBe(4);
        right();
        fixture.detectChanges();
        expect(getVisibleTreeItems().length).toBe(7);
        expect(getTreeItem('January')).not.toBeNull();
      });

      it('should navigate to the next item on ArrowRight when already expanded', () => {
        down();
        right();
        right();
        const item = getTreeItem('December')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item.id);
      });

      it('should collapse an open node on ArrowLeft', () => {
        down();
        right();
        fixture.detectChanges();
        expect(getVisibleTreeItems().length).toBe(7);
        left();
        fixture.detectChanges();
        expect(getVisibleTreeItems().length).toBe(4);
        const item = getTreeItem('Winter')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item.id);
      });

      it('should navigate to the parent node on ArrowLeft when in a child node', () => {
        down();
        right();
        right();
        const item1 = getTreeItem('December')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item1.id);
        left();
        const item2 = getTreeItem('Winter')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item2.id);
      });

      it('should navigate to the first focusable item on Home when open', () => {
        up();
        keydown('Home');
        const item = getTreeItem('Winter')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item.id);
      });

      it('should navigate to the last focusable item on End when open', () => {
        down();
        keydown('End');
        const grainsItem = getTreeItem('Fall')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(grainsItem.id);
      });
    });

    describe('Selection', () => {
      describe('when filterMode is "manual"', () => {
        beforeEach(() => setupCombobox({filterMode: 'manual'}));

        it('should select and commit on click', () => {
          click(inputElement);
          const item = getTreeItem('April')!;
          click(item);
          fixture.detectChanges();

          expect(fixture.componentInstance.value()).toEqual(['April']);
          expect(inputElement.value).toBe('April');
        });

        it('should select and commit to input on Enter', () => {
          down();
          enter();

          expect(fixture.componentInstance.value()).toEqual(['Winter']);
          expect(inputElement.value).toBe('Winter');
        });

        it('should select on focusout if the input text exactly matches an item', () => {
          focus();
          input('November');
          blur();

          expect(fixture.componentInstance.value()).toEqual(['November']);
        });

        it('should not select on navigation', () => {
          down();
          down();

          expect(fixture.componentInstance.value()).toEqual([]);
        });

        it('should not select on focusout if the input text does not match an item', () => {
          focus();
          input('Appl');
          blur();

          expect(fixture.componentInstance.value()).toEqual([]);
          expect(inputElement.value).toBe('Appl');
        });
      });

      describe('when filterMode is "auto-select"', () => {
        beforeEach(() => setupCombobox({filterMode: 'auto-select'}));

        it('should select and commit on click', () => {
          click(inputElement);
          down();
          right();
          const item = getTreeItem('February')!;
          click(item);
          fixture.detectChanges();

          expect(fixture.componentInstance.value()).toEqual(['February']);
          expect(inputElement.value).toBe('February');
        });

        it('should select and commit on Enter', () => {
          down();
          down();
          enter();

          expect(fixture.componentInstance.value()).toEqual(['Spring']);
          expect(inputElement.value).toBe('Spring');
        });

        it('should select on navigation', () => {
          down();
          expect(fixture.componentInstance.value()).toEqual(['Winter']);

          down();
          expect(fixture.componentInstance.value()).toEqual(['Spring']);
        });

        it('should select the first option on input', () => {
          focus();
          input('Dec');
          expect(fixture.componentInstance.value()).toEqual(['December']);
        });

        it('should commit the selected option on focusout', () => {
          focus();
          input('Jun');
          blur();

          expect(inputElement.value).toBe('June');
          expect(fixture.componentInstance.value()).toEqual(['June']);
        });
      });

      describe('when filterMode is "highlight"', () => {
        beforeEach(() => setupCombobox({filterMode: 'highlight'}));

        it('should select and commit on click', () => {
          click(inputElement);
          down();
          right();
          const item = getTreeItem('February')!;
          click(item);
          fixture.detectChanges();

          expect(fixture.componentInstance.value()).toEqual(['February']);
          expect(inputElement.value).toBe('February');
        });

        it('should select and commit on Enter', () => {
          down();
          down();
          enter();

          expect(fixture.componentInstance.value()).toEqual(['Spring']);
          expect(inputElement.value).toBe('Spring');
        });

        it('should select on navigation', () => {
          down();
          expect(fixture.componentInstance.value()).toEqual(['Winter']);

          down();
          expect(fixture.componentInstance.value()).toEqual(['Spring']);
        });

        it('should update input value on navigation', () => {
          down();
          expect(inputElement.value).toBe('Winter');

          down();
          expect(inputElement.value).toBe('Spring');
        });

        it('should select the first option on input', () => {
          focus();
          input('Sept');

          expect(fixture.componentInstance.value()).toEqual(['September']);
        });

        it('should insert a highlighted completion string on input', fakeAsync(() => {
          focus();
          input('Feb');
          tick();

          expect(inputElement.value).toBe('February');
          expect(inputElement.selectionStart).toBe(3);
          expect(inputElement.selectionEnd).toBe(8);
        }));

        it('should commit the selected option on focusout', () => {
          focus();
          input('Jan');
          blur();

          expect(inputElement.value).toBe('January');
          expect(fixture.componentInstance.value()).toEqual(['January']);
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
        blur(getTreeItem('Spring')!);
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
      });

      it('should clear the completion string and not close on escape when a completion is present', () => {
        fixture.componentInstance.filterMode.set('highlight');
        focus();
        input('Mar');
        expect(inputElement.value).toBe('March');
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
        escape();
        expect(inputElement.value).toBe('Mar');
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
        escape();
        expect(inputElement.value).toBe('Mar');
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should close on enter', () => {
        down();
        enter();
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should close on click to select an item', () => {
        down();
        click(getTreeItem('Spring')!);
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });
    });

    // TODO(wagnermaciel): Add unit tests for disabled options.

    describe('Filtering', () => {
      beforeEach(() => setupCombobox());

      it('should lazily render options', () => {
        expect(getTreeItems().length).toBe(0);
        focus();
        expect(getTreeItems().length).toBe(16);
      });

      it('should filter the options based on the input value', () => {
        focus();
        input('Summer');

        let items = getVisibleTreeItems();
        expect(items.length).toBe(1);
        expect(items[0].textContent?.trim()).toBe('Summer');
      });

      it('should render parents if a child matches', () => {
        focus();
        input('January');

        let items = getVisibleTreeItems();
        expect(items.length).toBe(2);
        expect(items[0].textContent?.trim()).toBe('Winter');
        expect(items[1].textContent?.trim()).toBe('January');
      });

      it('should show no options if nothing matches', () => {
        focus();
        input('xyz');
        expect(getVisibleTreeItems().length).toBe(0);
      });

      it('should show all options when the input is cleared', () => {
        focus();
        input('Winter');
        expect(getVisibleTreeItems().length).toBe(1);

        input('', {backspace: true});
        fixture.detectChanges();
        expect(getVisibleTreeItems().length).toBe(4);
      });

      it('should expand all nodes when filtering', () => {
        focus();
        expect(getVisibleTreeItems().length).toBe(4);

        input('J');
        expect(getTreeItem('Winter')!.getAttribute('aria-expanded')).toBe('true');
        expect(getTreeItem('Summer')!.getAttribute('aria-expanded')).toBe('true');
      });
    });

    describe('with programmatic value changes', () => {
      // TODO(wagnermaciel): Figure out if there's a way to automatically update the
      // input value when the popup value signal is updated programmatically.
      it('should update the selected item when the value is set programmatically', () => {
        setupCombobox();
        focus();
        fixture.componentInstance.value.set(['August']);
        fixture.detectChanges();
        expect(fixture.componentInstance.value()).toEqual(['August']);
        expect(getTreeItem('August')!.getAttribute('aria-selected')).toBe('true');
      });
    });
  });
});

@Component({
  template: `
<div
  cdkCombobox
  #combobox="cdkCombobox"
  [filterMode]="filterMode()"
>
  <input
    cdkComboboxInput
    placeholder="Search..."
    [(value)]="searchString"
  />

  <ng-template cdkComboboxPopupContainer>
    <div cdkListbox [(value)]="value">
      @for (option of options(); track option) {
        <div
          cdkOption
          [value]="option"
          [label]="option"
        >
          <span>{{option}}</span>
        </div>
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
  value = signal<string[]>([]);

  filterMode = signal<'manual' | 'auto-select' | 'highlight'>('manual');

  searchString = signal('');

  options = computed(() =>
    states.filter(state => state.toLowerCase().startsWith(this.searchString().toLowerCase())),
  );
}

@Component({
  template: `
<div
  #combobox="cdkCombobox"
  cdkCombobox
  [firstMatch]="firstMatch()"
  [filterMode]="filterMode()"
>
  <input
    cdkComboboxInput
    placeholder="Search..."
    [(value)]="searchString"
  />

  <ng-template cdkComboboxPopupContainer>
    <ul cdkTree #tree="cdkTree" [(value)]="value">
      <ng-template
        [ngTemplateOutlet]="treeNodes"
        [ngTemplateOutletContext]="{nodes: nodes(), parent: tree}"
      />
    </ul>
  </ng-template>
</div>

<ng-template #treeNodes let-nodes="nodes" let-parent="parent">
  @for (node of nodes; track node.name) {
    <li cdkTreeItem
      [parent]="parent"
      [value]="node.name"
      [label]="node.name"
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
  value = signal<string[]>([]);

  filterMode = signal<'manual' | 'auto-select' | 'highlight'>('manual');

  searchString = signal('');

  nodes = computed(() => this.filterTreeNodes(TREE_NODES));

  firstMatch = computed<string | undefined>(() => {
    const flatNodes = this.flattenTreeNodes(this.nodes());
    const node = flatNodes.find(n => this.isMatch(n));
    return node?.name;
  });

  flattenTreeNodes(nodes: TreeNode[]): TreeNode[] {
    return nodes.flatMap(node => {
      return node.children ? [node, ...this.flattenTreeNodes(node.children)] : [node];
    });
  }

  filterTreeNodes(nodes: TreeNode[]): TreeNode[] {
    return nodes.reduce((acc, node) => {
      const children = node.children ? this.filterTreeNodes(node.children) : undefined;
      if (this.isMatch(node) || (children && children.length > 0)) {
        acc.push({...node, children});
      }
      return acc;
    }, [] as TreeNode[]);
  }

  isMatch(node: TreeNode) {
    return node.name.toLowerCase().includes(this.searchString().toLowerCase());
  }
}

export interface TreeNode {
  name: string;
  children?: TreeNode[];
}

export const TREE_NODES = [
  {
    name: 'Winter',
    children: [{name: 'December'}, {name: 'January'}, {name: 'February'}],
  },
  {
    name: 'Spring',
    children: [{name: 'March'}, {name: 'April'}, {name: 'May'}],
  },
  {
    name: 'Summer',
    children: [{name: 'June'}, {name: 'July'}, {name: 'August'}],
  },
  {
    name: 'Fall',
    children: [{name: 'September'}, {name: 'October'}, {name: 'November'}],
  },
];

const states = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
];
