import {
  Component,
  computed,
  DebugElement,
  signal,
  ChangeDetectionStrategy,
  untracked,
  viewChild,
  afterRenderEffect,
} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Combobox, ComboboxPopup, ComboboxWidget} from './simple-combobox';
import {Listbox, Option} from '../listbox';
import {runAccessibilityChecks} from '@angular/cdk/testing/private';
import {Tree, TreeItem, TreeItemGroup} from '../tree';
import {NgTemplateOutlet} from '@angular/common';
import {Grid, GridRow, GridCell, GridCellWidget} from '../grid';
import {MutationObserverFactory} from '@angular/cdk/observers';

describe('Combobox', () => {
  let currentFixture: ComponentFixture<any> | null = null;

  const resetMutationState = () => {
    // No-op, kept to avoid changing setup helpers
  };

  const waitForMutation = (ms = 50) => {
    const factory = TestBed.inject(MutationObserverFactory);
    return new Promise<void>(resolve => {
      let resolved = false;
      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          observer?.disconnect();
          currentFixture?.detectChanges();
          resolve();
        }
      }, ms);

      const observer = factory.create(() => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          observer?.disconnect();
          currentFixture?.detectChanges();
          resolve();
        }
      });
      observer?.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    });
  };

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
      element.dispatchEvent(new PointerEvent('click', {bubbles: true, ...eventInit}));
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

    function setupCombobox(
      componentType: any = ComboboxListboxExample,
      opts: {readonly?: boolean} = {},
    ) {
      fixture = TestBed.createComponent(componentType);
      const testComponent = fixture.componentInstance;

      if (opts.readonly) {
        testComponent.readonly.set(true);
      }

      fixture.detectChanges();
      defineTestVariables();
      currentFixture = fixture;
      resetMutationState();
    }

    function defineTestVariables() {
      const inputDebugElement = fixture.debugElement.query(By.directive(Combobox));
      inputElement = inputDebugElement.nativeElement as HTMLInputElement;
    }

    function getOption(text: string): HTMLElement | null {
      const options = Array.from(document.querySelectorAll('[ngoption]')) as HTMLElement[];
      return options.find(option => option.textContent?.trim() === text) || null;
    }

    function getOptions(): HTMLElement[] {
      return Array.from(document.querySelectorAll('[ngoption]')) as HTMLElement[];
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
        down(); // Focus on Alabama
        const listbox = fixture.debugElement.query(By.directive(Listbox)).nativeElement;
        expect(inputElement.getAttribute('aria-controls')).toBe(listbox.id);
      });

      it('should set aria-multiselectable to false on the listbox', () => {
        down(); // Focus on Alabama
        const listbox = fixture.debugElement.query(By.directive(Listbox)).nativeElement;
        expect(listbox.getAttribute('aria-multiselectable')).toBe('false');
      });

      it('should set aria-selected on the selected option', async () => {
        down(); // Focus on Alabama
        expect(getOption('Alabama')!.getAttribute('aria-selected')).toBe('false');
        enter(); // Select Alabama

        down(); // Reopen popup and focus on Alabama

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

      it('should set aria-activedescendant to the active option id', async () => {
        down();
        const option = getOption('Alabama')!;

        await waitForMutation();
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(option.id);
      });
    });

    describe('Navigation', () => {
      beforeEach(() => setupCombobox());

      it('should navigate to the first item on ArrowDown', async () => {
        down();
        const options = getOptions();

        await waitForMutation();
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(options[0].id);
      });

      it('should navigate to the last item on ArrowUp', async () => {
        down(); // Opens the focus on Alabama
        up();
        const options = getOptions();

        await waitForMutation();
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(
          options[options.length - 1].id,
        );
      });

      it('should navigate to the next item on ArrowDown when open', async () => {
        down(); // Open popup
        down(); // Move to next item
        const options = getOptions();
        await waitForMutation();
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(options[1].id);
      });

      it('should navigate to the previous item on ArrowUp when open', async () => {
        down(); // Open
        down(); // Move to next item
        up(); // Move back to first item
        const options = getOptions();
        await waitForMutation();
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(options[0].id);
      });

      it('should navigate to the first item on Home when open', async () => {
        down(); // Open
        down(); // Move to next item
        keydown('Home');
        const options = getOptions();
        await waitForMutation();
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(options[0].id);
      });

      it('should navigate to the last item on End when open', async () => {
        down(); // Open
        keydown('End');
        const options = getOptions();
        await waitForMutation();
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(
          options[options.length - 1].id,
        );
      });
    });

    describe('Expansion', () => {
      beforeEach(() => setupCombobox());

      it('should open on ArrowDown', () => {
        focus();
        keydown('ArrowDown');
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

      it('should close on escape and maintain the current input value', async () => {
        setupCombobox(ComboboxListboxHighlightExample);

        down(); // Use down() instead of focus()
        input('Ala');
        expect(inputElement.value).toBe('Alabama');
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');

        escape();
        expect(inputElement.value).toBe('Alabama');
        expect(inputElement.selectionEnd).toBe(7);
        expect(inputElement.selectionStart).toBe(3);
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
      describe('with manual filtering', () => {
        beforeEach(() => setupCombobox(ComboboxListboxExample));

        it('should select and commit on click', async () => {
          down(); // Use down() to open

          const options = getOptions();
          click(options[0]);

          expect(fixture.componentInstance.value()).toEqual(['Alabama']);
          expect(inputElement.value).toBe('Alabama');
        });

        it('should select and commit to input on Enter', async () => {
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

      describe('with auto-select behavior', () => {
        beforeEach(() => setupCombobox(ComboboxListboxAutoSelectExample));

        it('should select and commit on click', async () => {
          down(); // Use down() to open

          const options = getOptions();
          click(options[1]);

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

        it('should select on navigation in auto-select', async () => {
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

      describe('with highlight behavior', () => {
        beforeEach(() => setupCombobox(ComboboxListboxHighlightExample));

        it('should select and commit on click', async () => {
          down(); // Use down() to open

          const options = getOptions();
          click(options[2]);

          expect(fixture.componentInstance.value()).toEqual(['Arizona']);
          expect(inputElement.value).toBe('Arizona');
        });

        it('should select and commit on Enter', async () => {
          down();

          down();
          down();
          enter();

          expect(fixture.componentInstance.value()).toEqual(['Arizona']);
          expect(inputElement.value).toBe('Arizona');
        });

        it('should select on navigation', async () => {
          down();

          // Should auto-select the first option on open
          expect(fixture.componentInstance.value()).toEqual(['Alabama']);

          down();

          // Should update selection on navigation
          expect(fixture.componentInstance.value()).toEqual(['Alaska']);
        });

        it('should update input value on navigation', async () => {
          down();

          expect(inputElement.value).toBe('Alabama');

          down();

          expect(inputElement.value).toBe('Alaska');
        });

        it('should select the first option on input', async () => {
          down(); // Use down() instead of focus()

          input('Cali');

          expect(fixture.componentInstance.value()).toEqual(['California']);
        });

        it('should insert a highlighted completion string on input', async () => {
          down(); // Use down() instead of focus()

          input('A');

          expect(inputElement.value).toBe('Alabama');
          expect(inputElement.selectionStart).toBe(1);
          expect(inputElement.selectionEnd).toBe(7);
        });

        it('should not insert a completion string on backspace', async () => {
          down(); // Use down() instead of focus()

          input('New');

          expect(inputElement.value).toBe('New Hampshire');
          expect(inputElement.selectionStart).toBe(3);
          expect(inputElement.selectionEnd).toBe(13);
        });

        it('should insert a completion string even if the items are not changed', async () => {
          down(); // Use down() instead of focus()

          input('New');
          await fixture.whenStable();
          fixture.detectChanges();

          input('New ');

          expect(inputElement.value).toBe('New Hampshire');
          expect(inputElement.selectionStart).toBe(4);
          expect(inputElement.selectionEnd).toBe(13);
        });

        it('should commit the selected option on focusout', async () => {
          down(); // Use down() instead of focus()

          input('Cali');

          blur();

          expect(inputElement.value).toBe('California');
          expect(fixture.componentInstance.value()).toEqual(['California']);
        });
      });
    });

    describe('Filtering', () => {
      it('should lazily render options', async () => {
        setupCombobox();
        expect(getOptions().length).toBe(0);

        down();

        expect(getOptions().length).toBe(50);
      });

      it('should filter the options based on the input value', () => {
        setupCombobox();
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
        setupCombobox();
        focus();
        input('xyz');
        const options = getOptions();
        expect(options.length).toBe(0);
      });

      it('should show all options when the input is cleared', () => {
        setupCombobox();
        focus();
        input('Alabama');
        expect(getOptions().length).toBe(1);

        input('');
        expect(getOptions().length).toBe(50);
      });
    });

    describe('Readonly', () => {
      beforeEach(() => setupCombobox(ComboboxListboxExample, {readonly: true}));

      it('should close on selection', () => {
        focus();
        down();
        click(getOption('Alabama')!);
        expect(inputElement.value).toBe('Alabama');
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should close on escape', () => {
        focus();
        down();
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
        escape();
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });
    });

    describe('Always Expanded', () => {
      beforeEach(() => setupCombobox());

      it('should not close on escape when alwaysExpanded is true', () => {
        fixture.componentInstance.alwaysExpanded.set(true);
        fixture.detectChanges();

        focus();
        // Manually open since alwaysExpanded was set after init
        fixture.componentInstance.popupExpanded.set(true);
        fixture.detectChanges();

        expect(inputElement.getAttribute('aria-expanded')).toBe('true');

        escape();
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
      });
    });
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

    const input = (value: string) => {
      focus();
      inputElement.value = value;
      inputElement.dispatchEvent(new Event('input', {bubbles: true}));
      fixture.detectChanges();
    };

    const click = (element: HTMLElement, eventInit?: PointerEventInit) => {
      focus();
      element.dispatchEvent(new PointerEvent('click', {bubbles: true, ...eventInit}));
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

    function setupCombobox(opts: {readonly?: boolean} = {}) {
      fixture = TestBed.createComponent(ComboboxTreeExample);
      const testComponent = fixture.componentInstance;

      if (opts.readonly) {
        testComponent.readonly.set(true);
      }

      fixture.detectChanges();
      defineTestVariables();
      currentFixture = fixture;
      resetMutationState();
    }

    function defineTestVariables() {
      const inputDebugElement = fixture.debugElement.query(By.directive(Combobox));
      inputElement = inputDebugElement.nativeElement as HTMLInputElement;
    }

    function getTreeItem(text: string): HTMLElement | null {
      const items = Array.from(
        fixture.nativeElement.querySelectorAll('[ngTreeItem]'),
      ) as HTMLElement[];
      return items.find(item => item.textContent?.trim().startsWith(text)) || null;
    }

    function getTreeItems(): HTMLElement[] {
      return Array.from(fixture.nativeElement.querySelectorAll('[ngTreeItem]')) as HTMLElement[];
    }

    function getVisibleTreeItems(): HTMLElement[] {
      return fixture.debugElement
        .queryAll(By.directive(TreeItem))
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

    afterEach(async () => {
      await runAccessibilityChecks(fixture.nativeElement);
    });

    describe('ARIA attributes and roles', () => {
      beforeEach(() => setupCombobox());

      it('should have aria-haspopup set to tree', () => {
        focus();
        expect(inputElement.getAttribute('aria-haspopup')).toBe('tree');
      });

      it('should set aria-controls to the tree id', () => {
        down();
        const tree = fixture.debugElement.query(By.directive(Tree)).nativeElement;
        expect(inputElement.getAttribute('aria-controls')).toBe(tree.id);
      });

      it('should set aria-selected on the selected tree item', async () => {
        down();
        const item = getTreeItem('Winter')!;
        enter();
        expect(item.getAttribute('aria-selected')).toBe('true');
      });

      it('should toggle aria-expanded on parent nodes', async () => {
        down();
        await waitForMutation(20);
        const item = getTreeItem('Winter')!;
        expect(item.getAttribute('aria-expanded')).toBe('false');

        right(); // Opens Winter
        await waitForMutation(20);
        expect(item.getAttribute('aria-expanded')).toBe('true');

        left(); // Closes Winter
        await waitForMutation(20);
        expect(item.getAttribute('aria-expanded')).toBe('false');
      });
    });

    describe('Navigation', () => {
      beforeEach(() => setupCombobox());

      it('should navigate to the first focusable item on ArrowDown', async () => {
        down(); // Winter
        await waitForMutation(10);
        const item = getTreeItem('Winter')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item.id);
      });

      it('should navigate to the last focusable item on ArrowUp', async () => {
        down(); // Winter
        up(); // Fall
        await waitForMutation(10);
        const item = getTreeItem('Fall')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item.id);
      });

      it('should navigate to the next focusable item on ArrowDown when open', async () => {
        down(); // Winter
        down(); // Spring
        await waitForMutation(10);
        const item = getTreeItem('Spring')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item.id);
      });

      it('should navigate to the previous item on ArrowUp when open', async () => {
        down(); // Winter
        down(); // Spring
        down(); // Summer
        down(); // Fall
        up(); // Summer
        await waitForMutation(10);
        const item = getTreeItem('Summer')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item.id);
      });

      it('should expand a closed node on ArrowRight', async () => {
        down(); // Winter
        expect(getVisibleTreeItems().length).toBe(4);
        right(); // Expand Winter
        expect(getVisibleTreeItems().length).toBe(7);
        expect(getTreeItem('January')).not.toBeNull();
      });

      it('should navigate to the next item on ArrowRight when already expanded', async () => {
        down(); // Winter
        right(); // Expand Winter
        right(); // December

        const item = getTreeItem('December')!;
        await waitForMutation(10);
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item.id);
      });

      it('should collapse an open node on ArrowLeft', async () => {
        down(); // Winter
        right(); // Winter Expanded
        expect(getVisibleTreeItems().length).toBe(7);
        left(); // Winter Collapsed
        expect(getVisibleTreeItems().length).toBe(4);
        await waitForMutation(10);
        const item = getTreeItem('Winter')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item.id);
      });

      it('should navigate to the parent node on ArrowLeft when in a child node', async () => {
        down(); // Winter
        right(); // Expand Winter
        right(); // December
        await waitForMutation(10);

        const item1 = getTreeItem('December')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item1.id);

        left();
        await waitForMutation(10);

        const item2 = getTreeItem('Winter')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item2.id);
      });

      it('should navigate to the first focusable item on Home when open', async () => {
        down();
        down();
        keydown('Home');
        await waitForMutation(10);

        const item = getTreeItem('Winter')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item.id);
      });

      it('should navigate to the last focusable item on End when open', async () => {
        down();
        down();
        keydown('End');
        await waitForMutation(10);

        const grainsItem = getTreeItem('Fall')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(grainsItem.id);
      });
    });

    describe('Expansion', () => {
      beforeEach(() => setupCombobox());

      it('should open on ArrowDown', () => {
        focus();
        keydown('ArrowDown');
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

      it('should close on escape', () => {
        focus();
        input('Mar');
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
        escape();
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

    describe('Selection', () => {
      describe('with manual filtering', () => {
        beforeEach(() => setupCombobox());

        it('should select and commit on click', () => {
          click(inputElement);

          // Iterate to the parent node and expand it so the child is visible
          down(); // Winter
          down(); // Spring
          right(); // Expand Spring

          const item = getTreeItem('April')!;
          click(item);

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
    });

    describe('Filtering', () => {
      beforeEach(() => setupCombobox());

      it('should lazily render options', async () => {
        expect(getTreeItems().length).toBe(0);

        focus();
        down();
        // Mutate dataSource to expand all
        fixture.componentInstance.dataSource().forEach(node => (node.expanded = true));

        // Force computed signal to re-evaluate by updating dataSource reference
        fixture.componentInstance.dataSource.set([...fixture.componentInstance.dataSource()]);
        fixture.detectChanges();
        await waitForMutation();
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

        input('');
        expect(getVisibleTreeItems().length).toBe(4);
      });

      it('should expand all nodes when filtering', () => {
        focus();
        down();

        expect(getVisibleTreeItems().length).toBe(4);

        input('J');

        expect(getTreeItem('Winter')!.getAttribute('aria-expanded')).toBe('true');
        expect(getTreeItem('Summer')!.getAttribute('aria-expanded')).toBe('true');
      });
    });
  });

  describe('with Grid', () => {
    let fixture: ComponentFixture<ComboboxGridExample>;
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
    const home = (modifierKeys?: {}) => keydown('Home', modifierKeys);
    const end = (modifierKeys?: {}) => keydown('End', modifierKeys);

    function setupCombobox() {
      fixture = TestBed.createComponent(ComboboxGridExample);
      fixture.detectChanges();
      const inputDebugElement = fixture.debugElement.query(By.directive(Combobox));
      inputElement = inputDebugElement.nativeElement as HTMLInputElement;
      currentFixture = fixture;
      resetMutationState();
    }

    beforeEach(() => setupCombobox());

    describe('ARIA attributes and roles', () => {
      beforeEach(() => setupCombobox());

      it('should have the combobox role on the input', () => {
        expect(inputElement.getAttribute('role')).toBe('combobox');
      });

      it('should have aria-haspopup set to grid', () => {
        focus();
        expect(inputElement.getAttribute('aria-haspopup')).toBe('grid');
      });

      it('should set aria-controls to the grid id', () => {
        down();
        const grid = fixture.debugElement.query(By.directive(Grid)).nativeElement;
        expect(inputElement.getAttribute('aria-controls')).toBe(grid.id);
      });

      it('should toggle aria-expanded when opening and closing', () => {
        down();
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
        escape();
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should set aria-activedescendant to the active grid cell id', async () => {
        focus();
        down(); // Open popup
        await waitForMutation(20);
        expect(inputElement.getAttribute('aria-activedescendant')).toBe('Antelope-label');
      });
    });

    it('should navigate up and down with grid navigation', async () => {
      focus();
      down(); // Open popup

      down(); // Navigate down to 'Bird-label'
      await waitForMutation(20);
      expect(inputElement.getAttribute('aria-activedescendant')).toBe('Bird-label');

      up(); // Navigate back up to 'Antelope-label'
      await waitForMutation(20);
      expect(inputElement.getAttribute('aria-activedescendant')).toBe('Antelope-label');
    });

    it('should navigate left and right with grid navigation', async () => {
      focus();
      down(); // Open popup

      right(); // Move right to 'Antelope-delete'
      await waitForMutation(20);
      expect(inputElement.getAttribute('aria-activedescendant')).toBe('Antelope-delete');

      left(); // Move back left to 'Antelope-label'
      await waitForMutation(20);
      expect(inputElement.getAttribute('aria-activedescendant')).toBe('Antelope-label');
    });

    it('should navigate to the start of the row on Home', async () => {
      focus();
      down(); // Open popup

      right(); // Move right to 'Antelope-delete'
      await waitForMutation(20);
      expect(inputElement.getAttribute('aria-activedescendant')).toBe('Antelope-delete');

      home(); // Move back to 'Antelope-label'
      await waitForMutation(20);
      expect(inputElement.getAttribute('aria-activedescendant')).toBe('Antelope-label');
    });

    it('should navigate to the end of the row on End', async () => {
      focus();
      down(); // Open popup

      end(); // Move to end of row ('Antelope-delete')
      await waitForMutation(20);
      expect(inputElement.getAttribute('aria-activedescendant')).toBe('Antelope-delete');
    });

    it('should update aria-activedescendant with grid navigation', async () => {
      focus();
      down(); // Open popup

      down(); // Navigate down
      await waitForMutation(20);

      // The active item is 'Bird' because we navigated down once more
      expect(inputElement.getAttribute('aria-activedescendant')).toBe('Bird-label');

      right(); // Move right to delete button
      await waitForMutation(20);
      expect(inputElement.getAttribute('aria-activedescendant')).toBe('Bird-delete');

      down(); // Move down to next row
      await waitForMutation(20);
      expect(inputElement.getAttribute('aria-activedescendant')).toBe('Cat-delete');
    });

    it('should remove an item when delete is pressed in the delete cell', async () => {
      down(); // On Antelope
      right(); // Move right to delete button
      enter(); // Click delete button
      expect(fixture.componentInstance.items()).not.toContain('Antelope');
    });

    it('should filter items and maintain selection', async () => {
      down(); // Antelope
      enter(); // Select active item
      await waitForMutation(20);

      expect(fixture.componentInstance.searchString()).toBe('Antelope');

      inputElement.value = '';
      inputElement.dispatchEvent(new Event('input', {bubbles: true}));
      fixture.detectChanges();

      expect(fixture.componentInstance.searchString()).toBe('');

      down(); // Go to BirdLabel
      await waitForMutation(20);
      expect(inputElement.getAttribute('aria-activedescendant')).toBe('Bird-label');
    });

    describe('Expansion', () => {
      beforeEach(() => setupCombobox());

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

      it('should close on enter', () => {
        down();
        enter();
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });
    });

    describe('Selection', () => {
      beforeEach(() => setupCombobox());

      it('should select and commit on click', async () => {
        focus();
        down(); // Open popup

        const gridCells = fixture.nativeElement.querySelectorAll('[ngGridCellWidget]');
        gridCells[0].dispatchEvent(new PointerEvent('click', {bubbles: true}));
        fixture.detectChanges();
        await waitForMutation(20);

        expect(fixture.componentInstance.selectedItem()).toBe('Antelope');
        expect(inputElement.value).toBe('Antelope');
      });

      it('should not select on navigation', async () => {
        focus();
        down(); // Open popup

        down(); // Move row down
        await waitForMutation(20);

        expect(fixture.componentInstance.selectedItem()).toBeNull();
      });
    });
  });
});

@Component({
  template: `
<div>
  <input
    ngCombobox
    #combobox="ngCombobox"
    placeholder="Search..."
    [(value)]="searchString"
    [(expanded)]="popupExpanded"
    [readonly]="readonly()"
    [alwaysExpanded]="alwaysExpanded()"
    (focusout)="onBlur()"
  />

  <ng-template ngComboboxPopup [combobox]="combobox">
    <div ngComboboxWidget ngListbox id="listbox" focusMode="activedescendant" selectionMode="explicit" [(value)]="value" (click)="onCommit()" (keydown.enter)="onCommit()">
      @for (option of options(); track option) {
        <div
          ngOption
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
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ComboboxListboxExample {
  readonly = signal(false);
  alwaysExpanded = signal(false);
  popupExpanded = signal(false);
  searchString = signal('');
  value = signal<string[]>([]);

  options = computed(() =>
    states.filter(state => state.toLowerCase().startsWith(this.searchString().toLowerCase())),
  );

  onCommit() {
    const val = this.value();
    if (val.length > 0) {
      this.searchString.set(val[0]);
    }
    this.popupExpanded.set(false);
  }

  onBlur() {
    const search = this.searchString().trim().toLowerCase();
    if (!search) return;

    const match = states.find(state => state.toLowerCase().startsWith(search));
    if (match) {
      this.value.set([match]);
      this.searchString.set(match);
    }
  }
}

interface TreeNode {
  name: string;
  children?: TreeNode[];
  expanded?: boolean;
}

function getTreeNodes(): TreeNode[] {
  return [
    {
      name: 'Winter',
      expanded: false,
      children: [{name: 'December'}, {name: 'January'}, {name: 'February'}],
    },
    {
      name: 'Spring',
      expanded: false,
      children: [{name: 'March'}, {name: 'April'}, {name: 'May'}],
    },
    {
      name: 'Summer',
      expanded: false,
      children: [{name: 'June'}, {name: 'July'}, {name: 'August'}],
    },
    {
      name: 'Fall',
      expanded: false,
      children: [{name: 'September'}, {name: 'October'}, {name: 'November'}],
    },
  ];
}

@Component({
  template: `
<div>
  <input
    ngCombobox
    #combobox="ngCombobox"
    placeholder="Search..."
    [(value)]="searchString"
    [(expanded)]="popupExpanded"
    [disabled]="readonly()"
    (focusout)="onBlur()"
  />

  <ng-template ngComboboxPopup [combobox]="combobox" popupType="tree">
    <ul ngComboboxWidget ngTree #tree="ngTree" focusMode="activedescendant" [tabbable]="false" selectionMode="explicit" [(value)]="value" (click)="onCommit()" (keydown.enter)="onCommit()">
      <ng-template
        [ngTemplateOutlet]="treeNodes"
        [ngTemplateOutletContext]="{nodes: nodes(), parent: tree}"
      />
    </ul>
  </ng-template>
</div>

<ng-template #treeNodes let-nodes="nodes" let-parent="parent">
  @for (node of nodes; track node.name) {
    <li ngTreeItem
      [parent]="parent"
      [value]="node.name"
      [label]="node.name"
      [(expanded)]="node.expanded"
      #treeItem="ngTreeItem"
    >
      {{ node.name }}
    </li>

    @if (node.children) {
      <ul role="group">
        <ng-template ngTreeItemGroup [ownedBy]="treeItem" #group="ngTreeItemGroup">
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
    Combobox,
    ComboboxPopup,
    ComboboxWidget,
    Tree,
    TreeItem,
    TreeItemGroup,
    NgTemplateOutlet,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ComboboxTreeExample {
  readonly tree = viewChild(Tree);

  readonly = signal(false);
  popupExpanded = signal(false);
  searchString = signal('');
  value = signal<string[]>([]);
  readonly dataSource = signal<TreeNode[]>(getTreeNodes());
  nodes = computed(() => {
    const res = this.filterTreeNodes(this.dataSource());
    return res;
  });

  onCommit() {
    const selected = this.value();
    if (selected.length > 0) {
      this.searchString.set(selected[0]);
    }
    this.popupExpanded.set(false);
  }

  onBlur() {
    const flatNodes = this.flattenTreeNodes(this.dataSource());
    const match = flatNodes.find(n => n.name.toLowerCase() === this.searchString().toLowerCase());
    if (match) {
      this.value.set([match.name]);
    }
  }

  firstMatch = computed<string | undefined>(() => {
    const flatNodes = this.flattenTreeNodes(this.nodes());
    const node = flatNodes.find(n => this.isMatch(n));
    return node?.name;
  });

  constructor() {
    afterRenderEffect(() => {
      const active = this.tree()?._pattern.inputs.activeItem();
      if (active) {
        untracked(() => {
          active.element()?.scrollIntoView({block: 'nearest'});
        });
      }
    });
  }

  flattenTreeNodes(nodes: TreeNode[]): TreeNode[] {
    return nodes.flatMap(node => {
      return node.children ? [node, ...this.flattenTreeNodes(node.children)] : [node];
    });
  }

  deepCopyNodes(nodes: TreeNode[]): TreeNode[] {
    return nodes.map(node => ({
      ...node,
      children: node.children ? this.deepCopyNodes(node.children) : undefined,
    }));
  }

  filterTreeNodes(nodes: TreeNode[]): TreeNode[] {
    const search = this.searchString().trim().toLowerCase();
    if (!search) {
      return nodes;
    }

    return nodes.reduce((acc, node) => {
      const children = node.children ? this.filterTreeNodes(node.children) : undefined;
      if (this.isMatch(node) || (children && children.length > 0)) {
        acc.push({
          ...node,
          children,
          expanded: children && children.length > 0 ? true : node.expanded,
        });
      }
      return acc;
    }, [] as TreeNode[]);
  }

  isMatch(node: TreeNode) {
    return node.name.toLowerCase().includes(this.searchString().toLowerCase());
  }
}

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

@Component({
  template: `
<div>
  <input
    ngCombobox
    #combobox="ngCombobox"
    placeholder="Search..."
    [(value)]="searchString"
    [(expanded)]="popupExpanded"
  />

  <ng-template ngComboboxPopup [combobox]="combobox" popupType="grid">
    <div ngComboboxWidget ngGrid focusMode="activedescendant" [tabIndex]="-1" [tabbable]="false" colWrap="continuous">
      @for (item of filteredItems(); track item; let i = $index) {
        <div ngGridRow>
          <div ngGridCell [id]="item + '-label'" [rowIndex]="i" [colIndex]="0">
            <button ngGridCellWidget (click)="selectItem(item)">
              {{item}}
            </button>
          </div>
          <div ngGridCell [id]="item + '-delete'" [rowIndex]="i" [colIndex]="1">
            <button ngGridCellWidget (click)="removeItem(item)" (pointerdown)="$event.preventDefault()">
              Delete
            </button>
          </div>
        </div>
      }
    </div>
  </ng-template>
</div>
  `,
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Grid, GridRow, GridCell, GridCellWidget],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ComboboxGridExample {
  popupExpanded = signal(false);
  searchString = signal('');
  selectedItem = signal<string | null>(null);

  items = signal(['Antelope', 'Bird', 'Cat', 'Dog']);

  filteredItems = computed(() => {
    const search = this.searchString().toLowerCase();
    return this.items().filter(item => item.toLowerCase().includes(search));
  });

  selectItem(item: string) {
    this.selectedItem.set(item);
    this.searchString.set(item);
    this.popupExpanded.set(false);
  }

  removeItem(itemToRemove: string) {
    this.items.update(items => items.filter(item => item !== itemToRemove));
  }
}

@Component({
  template: `
<div>
  <input
    ngCombobox
    #combobox="ngCombobox"
    placeholder="Search..."
    [(value)]="searchString"
    (input)="onInput()"
    [disabled]="readonly()"
    (focusout)="onBlur()"
  />

  <ng-template ngComboboxPopup [combobox]="combobox">
    <div ngComboboxWidget ngListbox id="listbox" focusMode="activedescendant" [tabbable]="false" [(value)]="value" (click)="onCommit()" (keydown.enter)="onCommit()">
      @for (option of options(); track option) {
        <div ngOption [value]="option" [label]="option">
          <span>{{option}}</span>
        </div>
      }
    </div>
  </ng-template>
</div>
  `,
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ComboboxListboxAutoSelectExample {
  readonly = signal(false);
  popupExpanded = signal(false);
  searchString = signal('');
  value = signal<string[]>([]);

  options = computed(() =>
    states.filter(state => state.toLowerCase().startsWith(this.searchString().toLowerCase())),
  );

  onInput() {
    const filtered = this.options();
    if (filtered.length > 0) {
      this.value.set([filtered[0]]);
    }
  }

  onCommit() {
    const val = this.value();
    if (val.length > 0) {
      this.searchString.set(val[0]);
    }
    this.popupExpanded.set(false);
  }

  onBlur() {
    const search = this.searchString().trim().toLowerCase();
    if (!search) return;

    const match = states.find(state => state.toLowerCase().startsWith(search));
    if (match) {
      this.value.set([match]);
      this.searchString.set(match);
    }
  }
}

@Component({
  template: `
<div>
  <input
    ngCombobox
    #combobox="ngCombobox"
    placeholder="Search..."
    [(value)]="searchString"
    [(expanded)]="popupExpanded"
    [inlineSuggestion]="value()[0] || options()[0]"
    [disabled]="readonly()"
  />

  <ng-template ngComboboxPopup [combobox]="combobox">
    <div ngComboboxWidget ngListbox focusMode="activedescendant" [tabbable]="false" [(value)]="value" (click)="onCommit()" (keydown.enter)="onCommit()">
      @for (option of options(); track option) {
        <div ngOption [value]="option" [label]="option">
          <span>{{option}}</span>
        </div>
      }
    </div>
  </ng-template>
</div>
  `,
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ComboboxListboxHighlightExample {
  readonly combobox = viewChild(Combobox);
  readonly = signal(false);
  popupExpanded = signal(false);
  searchString = signal('');
  value = signal<string[]>([]);
  readonly activeDescendantValue = signal<string | undefined>(undefined);

  options = computed(() =>
    states.filter(state => state.toLowerCase().startsWith(this.searchString().toLowerCase())),
  );

  constructor() {
    afterRenderEffect(() => {
      const id = this.combobox()?._pattern.activeDescendant();
      if (id) {
        const el = document.getElementById(id);
        this.activeDescendantValue.set(el?.textContent?.trim());
      } else {
        this.activeDescendantValue.set(undefined);
      }
    });
  }

  onCommit() {
    const val = this.value();
    if (val.length > 0) {
      this.searchString.set(val[0]);
    }
    this.popupExpanded.set(false);
  }
}
