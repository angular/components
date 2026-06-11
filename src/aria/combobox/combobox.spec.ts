import {
  Component,
  computed,
  DebugElement,
  signal,
  untracked,
  viewChild,
  afterRenderEffect,
} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Combobox} from './combobox';
import {ComboboxPopup} from './combobox-popup';
import {ComboboxWidget} from './combobox-widget';

import {Listbox, Option} from '../listbox';
import {runAccessibilityChecks} from '@angular/cdk/testing/private';
import {Tree, TreeItem, TreeItemGroup} from '../tree';
import {NgTemplateOutlet} from '@angular/common';
import {Grid, GridRow, GridCell, GridCellWidget} from '../grid';

describe('Combobox', () => {
  describe('with Listbox', () => {
    let fixture: ComponentFixture<ComboboxListboxExample>;
    let inputElement: HTMLInputElement;

    const keydown = async (key: string, modifierKeys: {} = {}) => {
      await focus();
      inputElement.dispatchEvent(
        new KeyboardEvent('keydown', {
          key,
          bubbles: true,
          ...modifierKeys,
        }),
      );
      await fixture.whenStable();
    };

    const input = async (value: string) => {
      await focus();
      inputElement.value = value;
      inputElement.dispatchEvent(new Event('input', {bubbles: true}));
      await fixture.whenStable();
    };

    const click = async (element: HTMLElement, eventInit?: PointerEventInit) => {
      await focus();
      element.dispatchEvent(new PointerEvent('click', {bubbles: true, ...eventInit}));
      await fixture.whenStable();
    };

    const focus = async () => {
      inputElement.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
      await fixture.whenStable();
    };

    const blur = async (relatedTarget?: EventTarget) => {
      inputElement.dispatchEvent(new FocusEvent('focusout', {bubbles: true, relatedTarget}));
      await fixture.whenStable();
    };

    const up = async (modifierKeys?: {}) => await keydown('ArrowUp', modifierKeys);
    const down = async (modifierKeys?: {}) => await keydown('ArrowDown', modifierKeys);
    const enter = async (modifierKeys?: {}) => await keydown('Enter', modifierKeys);
    const escape = async (modifierKeys?: {}) => await keydown('Escape', modifierKeys);

    async function setupCombobox(
      componentType: any = ComboboxListboxExample,
      opts: {readonly?: boolean} = {},
    ) {
      fixture = TestBed.createComponent(componentType);
      const testComponent = fixture.componentInstance;

      if (opts.readonly) {
        testComponent.readonly.set(true);
      }

      await fixture.whenStable();
      defineTestVariables();
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
      beforeEach(async () => await setupCombobox());

      it('should have the combobox role on the input', () => {
        expect(inputElement.getAttribute('role')).toBe('combobox');
      });

      it('should have aria-haspopup set to listbox', async () => {
        await focus();
        expect(inputElement.getAttribute('aria-haspopup')).toBe('listbox');
      });

      it('should set aria-controls to the listbox id', async () => {
        await down(); // Focus on Alabama
        const listbox = fixture.debugElement.query(By.directive(Listbox)).nativeElement;
        expect(inputElement.getAttribute('aria-controls')).toBe(listbox.id);
      });

      it('should set aria-multiselectable to false on the listbox', async () => {
        await down(); // Focus on Alabama
        const listbox = fixture.debugElement.query(By.directive(Listbox)).nativeElement;
        expect(listbox.getAttribute('aria-multiselectable')).toBe('false');
      });

      it('should set aria-selected on the selected option', async () => {
        await down(); // Focus on Alabama
        expect(getOption('Alabama')!.getAttribute('aria-selected')).toBe('false');
        await enter(); // Select Alabama

        await down(); // Reopen popup and focus on Alabama

        expect(getOption('Alabama')!.getAttribute('aria-selected')).toBe('true');
      });

      it('should set aria-expanded to false by default', () => {
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should toggle aria-expanded when opening and closing', async () => {
        await down();
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
        await escape();
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should not have aria-activedescendant by default', () => {
        expect(inputElement.hasAttribute('aria-activedescendant')).toBe(false);
      });

      it('should set aria-activedescendant to the active option id', async () => {
        await down();
        const option = getOption('Alabama')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(option.id);
      });
    });

    describe('Navigation', () => {
      beforeEach(async () => await setupCombobox());

      it('should navigate to the first item on ArrowDown', async () => {
        await down();
        const options = getOptions();

        expect(inputElement.getAttribute('aria-activedescendant')).toBe(options[0].id);
      });

      it('should navigate to the last item on ArrowUp', async () => {
        await down(); // Opens the focus on Alabama
        await up();
        const options = getOptions();
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(
          options[options.length - 1].id,
        );
      });

      it('should navigate to the next item on ArrowDown when open', async () => {
        await down(); // Open popup
        await down(); // Move to next item
        const options = getOptions();
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(options[1].id);
      });

      it('should navigate to the previous item on ArrowUp when open', async () => {
        await down(); // Open
        await down(); // Move to next item
        await up(); // Move back to first item
        const options = getOptions();
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(options[0].id);
      });

      it('should navigate to the first item on Home when open', async () => {
        await down(); // Open
        await down(); // Move to next item
        await keydown('Home');
        const options = getOptions();
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(options[0].id);
      });

      it('should navigate to the last item on End when open', async () => {
        await down(); // Open
        await keydown('End');
        const options = getOptions();
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(
          options[options.length - 1].id,
        );
      });
    });

    describe('Expansion', () => {
      beforeEach(async () => await setupCombobox());

      it('should open on ArrowDown', async () => {
        await focus();
        await keydown('ArrowDown');
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
      });

      it('should close on Escape', async () => {
        await down();
        await escape();
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should close on focusout', async () => {
        await focus();
        await blur();
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should close on escape and maintain the current input value', async () => {
        await setupCombobox(ComboboxListboxHighlightExample);

        await down(); // Use await down() instead of await focus()
        await input('Ala');
        expect(inputElement.value).toBe('Alabama');
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');

        await escape();
        expect(inputElement.value).toBe('Alabama');
        expect(inputElement.selectionEnd).toBe(7);
        expect(inputElement.selectionStart).toBe(3);
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should close on enter', async () => {
        await down();
        await enter();
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should close on click to select an item', async () => {
        await down();
        const fruitItem = getOption('Alabama')!;
        await click(fruitItem);
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });
    });
    describe('Selection', () => {
      describe('with manual filtering', () => {
        beforeEach(async () => await setupCombobox(ComboboxListboxExample));

        it('should select and commit on click', async () => {
          await down(); // Use await down() to open

          const options = getOptions();
          await click(options[0]);

          expect(fixture.componentInstance.value()).toEqual(['Alabama']);
          expect(inputElement.value).toBe('Alabama');
        });

        it('should select and commit to input on Enter', async () => {
          await focus();
          await down();

          await enter();

          expect(fixture.componentInstance.value()).toEqual(['Alabama']);
          expect(inputElement.value).toBe('Alabama');
        });

        it('should not select on navigation', async () => {
          await down();
          await down();

          expect(fixture.componentInstance.value()).toEqual([]);
        });

        it('should select on focusout if the input text exactly matches an item', async () => {
          await focus();
          await input('Alabama');
          await blur();

          expect(fixture.componentInstance.value()).toEqual(['Alabama']);
        });

        it('should not select on focusout if the input text does not match an item', async () => {
          await focus();
          await input('Appl');
          await blur();

          expect(fixture.componentInstance.value()).toEqual([]);
          expect(inputElement.value).toBe('Appl');
        });
      });

      describe('with auto-select behavior', () => {
        beforeEach(async () => await setupCombobox(ComboboxListboxAutoSelectExample));

        it('should select and commit on click', async () => {
          await down(); // Use await down() to open

          const options = getOptions();
          await click(options[1]);

          expect(fixture.componentInstance.value()).toEqual(['Alaska']);
          expect(inputElement.value).toBe('Alaska');
        });

        it('should select and commit on Enter', async () => {
          await down();
          await down();
          await enter();

          expect(fixture.componentInstance.value()).toEqual(['Alaska']);
          expect(inputElement.value).toBe('Alaska');
        });

        it('should select on navigation in auto-select', async () => {
          await down();

          expect(fixture.componentInstance.value()).toEqual(['Alabama']);

          await down();

          expect(fixture.componentInstance.value()).toEqual(['Alaska']);

          await down();

          expect(fixture.componentInstance.value()).toEqual(['Arizona']);
        });
        it('should select the first option on input', async () => {
          await focus();
          await input('W');

          expect(fixture.componentInstance.value()).toEqual(['Washington']);
        });

        it('should commit the selected option on focusout', async () => {
          await focus();
          await input('G');
          await blur();

          expect(inputElement.value).toBe('Georgia');
          expect(fixture.componentInstance.value()).toEqual(['Georgia']);
        });
      });

      describe('with highlight behavior', () => {
        beforeEach(async () => await setupCombobox(ComboboxListboxHighlightExample));

        it('should select and commit on click', async () => {
          await down(); // Use await down() to open

          const options = getOptions();
          await click(options[2]);

          expect(fixture.componentInstance.value()).toEqual(['Arizona']);
          expect(inputElement.value).toBe('Arizona');
        });

        it('should select and commit on Enter', async () => {
          await down();

          await down();
          await down();
          await enter();

          expect(fixture.componentInstance.value()).toEqual(['Arizona']);
          expect(inputElement.value).toBe('Arizona');
        });

        it('should select on navigation', async () => {
          await down();

          // Should auto-select the first option on open
          expect(fixture.componentInstance.value()).toEqual(['Alabama']);

          await down();

          // Should update selection on navigation
          expect(fixture.componentInstance.value()).toEqual(['Alaska']);
        });

        it('should update input value on navigation', async () => {
          await down();

          expect(inputElement.value).toBe('Alabama');

          await down();

          expect(inputElement.value).toBe('Alaska');
        });

        it('should select the first option on input', async () => {
          await down(); // Use await down() instead of await focus()

          await input('Cali');

          expect(fixture.componentInstance.value()).toEqual(['California']);
        });

        it('should insert a highlighted completion string on input', async () => {
          await down(); // Use await down() instead of await focus()

          await input('A');

          expect(inputElement.value).toBe('Alabama');
          expect(inputElement.selectionStart).toBe(1);
          expect(inputElement.selectionEnd).toBe(7);
        });

        it('should not insert a completion string on backspace', async () => {
          await down(); // Use await down() instead of await focus()

          await input('New');

          expect(inputElement.value).toBe('New Hampshire');
          expect(inputElement.selectionStart).toBe(3);
          expect(inputElement.selectionEnd).toBe(13);
        });

        it('should insert a completion string even if the items are not changed', async () => {
          await down(); // Use await down() instead of await focus()

          await input('New');
          await fixture.whenStable();
          await fixture.whenStable();

          await input('New ');

          expect(inputElement.value).toBe('New Hampshire');
          expect(inputElement.selectionStart).toBe(4);
          expect(inputElement.selectionEnd).toBe(13);
        });

        it('should commit the selected option on focusout', async () => {
          await down(); // Use await down() instead of await focus()

          await input('Cali');

          await blur();

          expect(inputElement.value).toBe('California');
          expect(fixture.componentInstance.value()).toEqual(['California']);
        });

        it('should resume inserting completion strings on navigation after a backspace deletion', async () => {
          await down(); // Open popup

          // 1. Type 'A', completion should pop up 'Alabama'
          await input('A');
          expect(inputElement.value).toBe('Alabama');

          // 2. Simulate Backspace deletion (dispatch InputEvent with deleteContentBackward)
          inputElement.value = '';
          inputElement.dispatchEvent(
            new InputEvent('input', {
              bubbles: true,
              inputType: 'deleteContentBackward',
            }),
          );
          await fixture.whenStable();

          // Confirm no completion gets inserted during deletion
          expect(inputElement.value).toBe('');

          // 3. Press ArrowDown key to navigate to the next option (Alaska)
          await down();

          // Active descendant navigation resets `isDeleting`, so highlight/completion should successfully populate the current active match!
          const options = getOptions();
          expect(inputElement.getAttribute('aria-activedescendant')).toBe(options[1].id);
          expect(inputElement.value).toBe('Alaska');
        });
      });
    });

    describe('Filtering', () => {
      it('should lazily render options', async () => {
        await setupCombobox();
        expect(getOptions().length).toBe(0);

        await down();

        expect(getOptions().length).toBe(50);
      });

      it('should filter the options based on the input value', async () => {
        await setupCombobox();
        await focus();
        await input('New');

        const options = getOptions();
        expect(options.length).toBe(4);
        expect(options[0].textContent?.trim()).toBe('New Hampshire');
        expect(options[1].textContent?.trim()).toBe('New Jersey');
        expect(options[2].textContent?.trim()).toBe('New Mexico');
        expect(options[3].textContent?.trim()).toBe('New York');
      });

      it('should show no options if nothing matches', async () => {
        await setupCombobox();
        await focus();
        await input('xyz');
        const options = getOptions();
        expect(options.length).toBe(0);
      });

      it('should show all options when the input is cleared', async () => {
        await setupCombobox();
        await focus();
        await input('Alabama');
        expect(getOptions().length).toBe(1);

        await input('');
        expect(getOptions().length).toBe(50);
      });
    });

    describe('Readonly', () => {
      beforeEach(async () => await setupCombobox(ComboboxListboxExample, {readonly: true}));

      it('should close on selection', async () => {
        await focus();
        await down();
        await click(getOption('Alabama')!);
        expect(inputElement.value).toBe('Alabama');
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should close on escape', async () => {
        await focus();
        await down();
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
        await escape();
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });
    });

    describe('Always Expanded', () => {
      beforeEach(async () => await setupCombobox());

      it('should not close on escape when alwaysExpanded is true', async () => {
        fixture.componentInstance.alwaysExpanded.set(true);
        await fixture.whenStable();
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');

        await escape();
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
      });

      it('should automatically report as expanded when alwaysExpanded is true', async () => {
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
        fixture.componentInstance.alwaysExpanded.set(true);
        await fixture.whenStable();
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
      });
    });

    describe('Disabled', () => {
      beforeEach(async () => await setupCombobox());

      it('should keep the input focusable by default when disabled', async () => {
        fixture.componentInstance.disabled.set(true);
        await fixture.whenStable();

        expect(inputElement.disabled).toBe(false);
        expect(inputElement.getAttribute('disabled')).toBeNull();
        expect(inputElement.getAttribute('aria-disabled')).toBe('true');
      });

      it('should make the input read-only when disabled and softDisabled is true', async () => {
        fixture.componentInstance.disabled.set(true);
        await fixture.whenStable();

        expect(inputElement.getAttribute('readonly')).toBe('');
      });

      it('should block interactions when disabled', async () => {
        fixture.componentInstance.disabled.set(true);
        await fixture.whenStable();

        await focus();
        await keydown('ArrowDown');
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should make the input unfocusable when softDisabled is false', async () => {
        fixture.componentInstance.disabled.set(true);
        fixture.componentInstance.softDisabled.set(false);
        await fixture.whenStable();

        expect(inputElement.disabled).toBe(true);
        expect(inputElement.getAttribute('disabled')).toBe('');
        expect(inputElement.getAttribute('aria-disabled')).toBe('true');
      });

      it('should respect user-defined tabindex when softDisabled is true', async () => {
        fixture.componentInstance.disabled.set(true);
        fixture.componentInstance.tabIndex.set(0);
        await fixture.whenStable();

        expect(inputElement.getAttribute('tabindex')).toBe('0');
      });

      it('should respect user-defined tabindex when not disabled', async () => {
        fixture.componentInstance.tabIndex.set(0);
        await fixture.whenStable();

        expect(inputElement.getAttribute('tabindex')).toBe('0');
      });

      it('should default to tabindex 0 when not disabled', async () => {
        await fixture.whenStable();
        expect(inputElement.getAttribute('tabindex')).toBe('0');
      });

      it('should force tabindex to -1 when hard-disabled, ignoring user-defined tabindex', async () => {
        fixture.componentInstance.disabled.set(true);
        fixture.componentInstance.softDisabled.set(false);
        fixture.componentInstance.tabIndex.set(0);
        await fixture.whenStable();

        expect(inputElement.getAttribute('tabindex')).toBe('-1');
      });
    });
  });

  describe('with Tree', () => {
    let fixture: ComponentFixture<ComboboxTreeExample>;
    let inputElement: HTMLInputElement;

    const keydown = async (key: string, modifierKeys: {} = {}) => {
      await focus();
      inputElement.dispatchEvent(
        new KeyboardEvent('keydown', {
          key,
          bubbles: true,
          ...modifierKeys,
        }),
      );
      await fixture.whenStable();
    };

    const input = async (value: string) => {
      await focus();
      inputElement.value = value;
      inputElement.dispatchEvent(new Event('input', {bubbles: true}));
      await fixture.whenStable();
    };

    const click = async (element: HTMLElement, eventInit?: PointerEventInit) => {
      await focus();
      element.dispatchEvent(new PointerEvent('click', {bubbles: true, ...eventInit}));
      await fixture.whenStable();
    };

    const focus = async () => {
      inputElement.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
      await fixture.whenStable();
    };

    const blur = async (relatedTarget?: EventTarget) => {
      inputElement.dispatchEvent(new FocusEvent('focusout', {bubbles: true, relatedTarget}));
      await fixture.whenStable();
    };

    const up = async (modifierKeys?: {}) => await keydown('ArrowUp', modifierKeys);
    const down = async (modifierKeys?: {}) => await keydown('ArrowDown', modifierKeys);
    const left = async (modifierKeys?: {}) => await keydown('ArrowLeft', modifierKeys);
    const right = async (modifierKeys?: {}) => await keydown('ArrowRight', modifierKeys);
    const enter = async (modifierKeys?: {}) => await keydown('Enter', modifierKeys);
    const escape = async (modifierKeys?: {}) => await keydown('Escape', modifierKeys);

    async function setupCombobox(opts: {readonly?: boolean} = {}) {
      fixture = TestBed.createComponent(ComboboxTreeExample);
      const testComponent = fixture.componentInstance;

      if (opts.readonly) {
        testComponent.readonly.set(true);
      }

      await fixture.whenStable();
      defineTestVariables();
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
      beforeEach(async () => await setupCombobox());

      it('should have aria-haspopup set to tree', async () => {
        await focus();
        expect(inputElement.getAttribute('aria-haspopup')).toBe('tree');
      });

      it('should set aria-controls to the tree id', async () => {
        await down();
        const tree = fixture.debugElement.query(By.directive(Tree)).nativeElement;
        expect(inputElement.getAttribute('aria-controls')).toBe(tree.id);
      });

      it('should set aria-selected on the selected tree item', async () => {
        await down();
        const item = getTreeItem('Winter')!;
        await enter();
        expect(item.getAttribute('aria-selected')).toBe('true');
      });

      it('should toggle aria-expanded on parent nodes', async () => {
        await down();
        const item = getTreeItem('Winter')!;
        expect(item.getAttribute('aria-expanded')).toBe('false');

        await right(); // Opens Winter
        expect(item.getAttribute('aria-expanded')).toBe('true');

        await left(); // Closes Winter
        expect(item.getAttribute('aria-expanded')).toBe('false');
      });
    });

    describe('Navigation', () => {
      beforeEach(async () => await setupCombobox());

      it('should navigate to the first focusable item on ArrowDown', async () => {
        await down(); // Winter
        const item = getTreeItem('Winter')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item.id);
      });

      it('should navigate to the last focusable item on ArrowUp', async () => {
        await down(); // Winter
        await up(); // Fall
        const item = getTreeItem('Fall')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item.id);
      });

      it('should navigate to the next focusable item on ArrowDown when open', async () => {
        await down(); // Winter
        await down(); // Spring
        const item = getTreeItem('Spring')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item.id);
      });

      it('should navigate to the previous item on ArrowUp when open', async () => {
        await down(); // Winter
        await down(); // Spring
        await down(); // Summer
        await down(); // Fall
        await up(); // Summer
        const item = getTreeItem('Summer')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item.id);
      });

      it('should expand a closed node on ArrowRight', async () => {
        await down(); // Winter
        expect(getVisibleTreeItems().length).toBe(4);
        await right(); // Expand Winter
        expect(getVisibleTreeItems().length).toBe(7);
        expect(getTreeItem('January')).not.toBeNull();
      });

      it('should navigate to the next item on ArrowRight when already expanded', async () => {
        await down(); // Winter
        await right(); // Expand Winter
        await right(); // December

        const item = getTreeItem('December')!;

        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item.id);
      });

      it('should collapse an open node on ArrowLeft', async () => {
        await down(); // Winter
        await right(); // Winter Expanded
        expect(getVisibleTreeItems().length).toBe(7);
        await left(); // Winter Collapsed
        expect(getVisibleTreeItems().length).toBe(4);

        const item = getTreeItem('Winter')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item.id);
      });

      it('should navigate to the parent node on ArrowLeft when in a child node', async () => {
        await down(); // Winter
        await right(); // Expand Winter
        await right(); // December

        const item1 = getTreeItem('December')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item1.id);

        await left();

        const item2 = getTreeItem('Winter')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item2.id);
      });

      it('should navigate to the first focusable item on Home when open', async () => {
        await down();
        await down();
        await keydown('Home');

        const item = getTreeItem('Winter')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(item.id);
      });

      it('should navigate to the last focusable item on End when open', async () => {
        await down();
        await down();
        await keydown('End');

        const grainsItem = getTreeItem('Fall')!;
        expect(inputElement.getAttribute('aria-activedescendant')).toBe(grainsItem.id);
      });
    });

    describe('Expansion', () => {
      beforeEach(async () => await setupCombobox());

      it('should open on ArrowDown', async () => {
        await focus();
        await keydown('ArrowDown');
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
      });

      it('should close on Escape', async () => {
        await down();
        await escape();
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should close on focusout', async () => {
        await focus();
        await blur();
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should close on escape', async () => {
        await focus();
        await input('Mar');
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
        await escape();
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should close on enter', async () => {
        await down();
        await enter();
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should close on click to select an item', async () => {
        await down();
        await click(getTreeItem('Spring')!);
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });
    });

    describe('Selection', () => {
      describe('with manual filtering', () => {
        beforeEach(async () => await setupCombobox());

        it('should select and commit on click', async () => {
          await click(inputElement);

          // Iterate to the parent node and expand it so the child is visible
          await down(); // Winter
          await down(); // Spring
          await right(); // Expand Spring

          const item = getTreeItem('April')!;
          await click(item);

          expect(fixture.componentInstance.value()).toEqual(['April']);
          expect(inputElement.value).toBe('April');
        });

        it('should select and commit to input on Enter', async () => {
          await down();
          await enter();

          expect(fixture.componentInstance.value()).toEqual(['Winter']);
          expect(inputElement.value).toBe('Winter');
        });

        it('should select on focusout if the input text exactly matches an item', async () => {
          await focus();
          await input('November');
          await blur();

          expect(fixture.componentInstance.value()).toEqual(['November']);
        });

        it('should not select on navigation', async () => {
          await down();
          await down();

          expect(fixture.componentInstance.value()).toEqual([]);
        });

        it('should not select on focusout if the input text does not match an item', async () => {
          await focus();
          await input('Appl');
          await blur();

          expect(fixture.componentInstance.value()).toEqual([]);
          expect(inputElement.value).toBe('Appl');
        });
      });
    });

    describe('Filtering', () => {
      beforeEach(async () => await setupCombobox());

      it('should lazily render options', async () => {
        expect(getTreeItems().length).toBe(0);

        await focus();
        await down();
        // Mutate dataSource to expand all
        fixture.componentInstance.dataSource().forEach(node => (node.expanded = true));

        // Force computed signal to re-evaluate by updating dataSource reference
        fixture.componentInstance.dataSource.set([...fixture.componentInstance.dataSource()]);
        await fixture.whenStable();

        expect(getTreeItems().length).toBe(16);
      });

      it('should filter the options based on the input value', async () => {
        await focus();
        await input('Summer');

        let items = getVisibleTreeItems();
        expect(items.length).toBe(1);
        expect(items[0].textContent?.trim()).toBe('Summer');
      });

      it('should render parents if a child matches', async () => {
        await focus();
        await input('January');

        let items = getVisibleTreeItems();
        expect(items.length).toBe(2);
        expect(items[0].textContent?.trim()).toBe('Winter');
        expect(items[1].textContent?.trim()).toBe('January');
      });

      it('should show no options if nothing matches', async () => {
        await focus();
        await input('xyz');
        expect(getVisibleTreeItems().length).toBe(0);
      });

      it('should show all options when the input is cleared', async () => {
        await focus();
        await input('Winter');
        expect(getVisibleTreeItems().length).toBe(1);

        await input('');
        expect(getVisibleTreeItems().length).toBe(4);
      });

      it('should expand all nodes when filtering', async () => {
        await focus();
        await down();

        expect(getVisibleTreeItems().length).toBe(4);

        await input('J');

        expect(getTreeItem('Winter')!.getAttribute('aria-expanded')).toBe('true');
        expect(getTreeItem('Summer')!.getAttribute('aria-expanded')).toBe('true');
      });
    });
  });

  describe('with Grid', () => {
    let fixture: ComponentFixture<ComboboxGridExample>;
    let inputElement: HTMLInputElement;

    const keydown = async (key: string, modifierKeys: {} = {}) => {
      await focus();
      inputElement.dispatchEvent(
        new KeyboardEvent('keydown', {
          key,
          bubbles: true,
          ...modifierKeys,
        }),
      );
      await fixture.whenStable();
    };

    const focus = async () => {
      inputElement.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
      await fixture.whenStable();
    };

    const blur = async (relatedTarget?: EventTarget) => {
      inputElement.dispatchEvent(new FocusEvent('focusout', {bubbles: true, relatedTarget}));
      await fixture.whenStable();
    };

    const up = async (modifierKeys?: {}) => await keydown('ArrowUp', modifierKeys);
    const down = async (modifierKeys?: {}) => await keydown('ArrowDown', modifierKeys);
    const left = async (modifierKeys?: {}) => await keydown('ArrowLeft', modifierKeys);
    const right = async (modifierKeys?: {}) => await keydown('ArrowRight', modifierKeys);
    const enter = async (modifierKeys?: {}) => await keydown('Enter', modifierKeys);
    const escape = async (modifierKeys?: {}) => await keydown('Escape', modifierKeys);
    const home = async (modifierKeys?: {}) => await keydown('Home', modifierKeys);
    const end = async (modifierKeys?: {}) => await keydown('End', modifierKeys);

    async function setupCombobox() {
      fixture = TestBed.createComponent(ComboboxGridExample);
      await fixture.whenStable();
      const inputDebugElement = fixture.debugElement.query(By.directive(Combobox));
      inputElement = inputDebugElement.nativeElement as HTMLInputElement;
    }

    beforeEach(async () => await setupCombobox());

    describe('ARIA attributes and roles', () => {
      beforeEach(async () => await setupCombobox());

      it('should have the combobox role on the input', () => {
        expect(inputElement.getAttribute('role')).toBe('combobox');
      });

      it('should have aria-haspopup set to grid', async () => {
        await focus();
        expect(inputElement.getAttribute('aria-haspopup')).toBe('grid');
      });

      it('should set aria-controls to the grid id', async () => {
        await down();
        const grid = fixture.debugElement.query(By.directive(Grid)).nativeElement;
        expect(inputElement.getAttribute('aria-controls')).toBe(grid.id);
      });

      it('should toggle aria-expanded when opening and closing', async () => {
        await down();
        expect(inputElement.getAttribute('aria-expanded')).toBe('true');
        await escape();
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should set aria-activedescendant to the active grid cell id', async () => {
        await focus();
        await down(); // Open popup

        expect(inputElement.getAttribute('aria-activedescendant')).toBe('Antelope-label');
      });
    });

    it('should navigate up and down with grid navigation', async () => {
      await focus();
      await down(); // Open popup

      await down(); // Navigate down to 'Bird-label'

      expect(inputElement.getAttribute('aria-activedescendant')).toBe('Bird-label');

      await up(); // Navigate back up to 'Antelope-label'

      expect(inputElement.getAttribute('aria-activedescendant')).toBe('Antelope-label');
    });

    it('should navigate left and right with grid navigation', async () => {
      await focus();
      await down(); // Open popup

      await right(); // Move right to 'Antelope-delete'

      expect(inputElement.getAttribute('aria-activedescendant')).toBe('Antelope-delete');

      await left(); // Move back left to 'Antelope-label'

      expect(inputElement.getAttribute('aria-activedescendant')).toBe('Antelope-label');
    });

    it('should navigate to the start of the row on Home', async () => {
      await focus();
      await down(); // Open popup

      await right(); // Move right to 'Antelope-delete'

      expect(inputElement.getAttribute('aria-activedescendant')).toBe('Antelope-delete');

      await home(); // Move back to 'Antelope-label'

      expect(inputElement.getAttribute('aria-activedescendant')).toBe('Antelope-label');
    });

    it('should navigate to the end of the row on End', async () => {
      await focus();
      await down(); // Open popup

      await end(); // Move to end of row ('Antelope-delete')

      expect(inputElement.getAttribute('aria-activedescendant')).toBe('Antelope-delete');
    });

    it('should update aria-activedescendant with grid navigation', async () => {
      await focus();
      await down(); // Open popup

      await down(); // Navigate down

      // The active item is 'Bird' because we navigated down once more
      expect(inputElement.getAttribute('aria-activedescendant')).toBe('Bird-label');

      await right(); // Move right to delete button

      expect(inputElement.getAttribute('aria-activedescendant')).toBe('Bird-delete');

      await down(); // Move down to next row

      expect(inputElement.getAttribute('aria-activedescendant')).toBe('Cat-delete');
    });

    it('should remove an item when delete is pressed in the delete cell', async () => {
      await down(); // On Antelope
      await right(); // Move right to delete button
      await enter(); // Click delete button
      expect(fixture.componentInstance.items()).not.toContain('Antelope');
    });

    it('should filter items and maintain selection', async () => {
      await down(); // Antelope
      await enter(); // Select active item

      expect(fixture.componentInstance.searchString()).toBe('Antelope');

      inputElement.value = '';
      inputElement.dispatchEvent(new Event('input', {bubbles: true}));
      await fixture.whenStable();

      expect(fixture.componentInstance.searchString()).toBe('');

      await down(); // Go to BirdLabel

      expect(inputElement.getAttribute('aria-activedescendant')).toBe('Bird-label');
    });

    describe('Expansion', () => {
      beforeEach(async () => await setupCombobox());

      it('should close on Escape', async () => {
        await down();
        await escape();
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should close on focusout', async () => {
        await focus();
        await blur();
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should close on enter', async () => {
        await down();
        await enter();
        expect(inputElement.getAttribute('aria-expanded')).toBe('false');
      });
    });

    describe('Selection', () => {
      beforeEach(async () => await setupCombobox());

      it('should select and commit on click', async () => {
        await focus();
        await down(); // Open popup

        const gridCells = fixture.nativeElement.querySelectorAll('[ngGridCellWidget]');
        gridCells[0].dispatchEvent(new PointerEvent('click', {bubbles: true}));
        await fixture.whenStable();

        expect(fixture.componentInstance.selectedItem()).toBe('Antelope');
        expect(inputElement.value).toBe('Antelope');
      });

      it('should not select on navigation', async () => {
        await focus();
        await down(); // Open popup

        await down(); // Move row down

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
    [disabled]="disabled()"
    [softDisabled]="softDisabled()"
    [alwaysExpanded]="alwaysExpanded()"
    [tabindex]="tabIndex()"
    (focusout)="onBlur()"
    (click)="popupExpanded.set(true)"
  />

  <ng-template ngComboboxPopup [combobox]="combobox">
    <div ngComboboxWidget #listbox="ngListbox" ngListbox id="listbox" focusMode="activedescendant" selectionMode="explicit" [(value)]="value" (click)="onCommit()" (keydown.enter)="onCommit()" [activeDescendant]="listbox.activeDescendant()">
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
})
class ComboboxListboxExample {
  readonly = signal(false);
  disabled = signal(false);
  softDisabled = signal(true);
  alwaysExpanded = signal(false);
  tabIndex = signal<number | undefined>(undefined);
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
    <ul ngComboboxWidget ngTree #tree="ngTree" id="tree" focusMode="activedescendant" [tabIndex]="-1" selectionMode="explicit" [(value)]="value" (click)="onCommit()" (keydown.enter)="onCommit()" [activeDescendant]="tree.activeDescendant()">
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
    <div ngComboboxWidget #grid="ngGrid" ngGrid id="grid" focusMode="activedescendant" [tabIndex]="-1" colWrap="continuous" [activeDescendant]="grid.activeDescendant()">
      @for (item of filteredItems(); track item; let i = $index) {
        <div ngGridRow>
          <div ngGridCell [id]="item + '-label'" [rowIndex]="i" [colIndex]="0">
            <button ngGridCellWidget (activated)="selectItem(item)" (click)="selectItem(item)">
              {{item}}
            </button>
          </div>
          <div ngGridCell [id]="item + '-delete'" [rowIndex]="i" [colIndex]="1">
            <button ngGridCellWidget (activated)="removeItem(item)" (click)="removeItem(item)" (pointerdown)="$event.preventDefault()">
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
    (click)="combobox.expanded.set(true)"
  />

  <ng-template ngComboboxPopup [combobox]="combobox">
    <div ngComboboxWidget #listbox="ngListbox" ngListbox id="listbox" focusMode="activedescendant" [tabIndex]="-1" [(value)]="value" (click)="onCommit()" (keydown.enter)="onCommit()" [activeDescendant]="listbox.activeDescendant()">
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
    (click)="popupExpanded.set(true)"
  />

  <ng-template ngComboboxPopup [combobox]="combobox">
    <div ngComboboxWidget #listbox="ngListbox" ngListbox id="listbox" focusMode="activedescendant" [tabIndex]="-1" [(value)]="value" (click)="onCommit()" (keydown.enter)="onCommit()" [activeDescendant]="listbox.activeDescendant()">
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
