import {
  A,
  B,
  DOWN_ARROW,
  END,
  HOME,
  LEFT_ARROW,
  RIGHT_ARROW,
  SPACE,
  UP_ARROW,
} from '@angular/cdk/keycodes';
import {CommonModule} from '@angular/common';
import {Component, Type, signal} from '@angular/core';
import {TestBed, fakeAsync, tick} from '@angular/core/testing';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {dispatchFakeEvent, dispatchKeyboardEvent, dispatchMouseEvent} from '../testing/private';
import {CdkListbox, CdkListboxModule, CdkOption, ListboxValueChangeEvent} from './index';

function setupComponent<T, O = string>(component: Type<T>, imports: any[] = []) {
  TestBed.configureTestingModule({
    imports: [CdkListboxModule, ...imports],
    declarations: [component],
  }).compileComponents();
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();

  const listboxDebugEl = fixture.debugElement.query(By.directive(CdkListbox));
  const optionDebugEls = fixture.debugElement.queryAll(By.directive(CdkOption));

  return {
    fixture,
    testComponent: fixture.componentInstance,
    listbox: listboxDebugEl.injector.get<CdkListbox<O>>(CdkListbox),
    listboxEl: listboxDebugEl.nativeElement as HTMLElement,
    options: optionDebugEls.map(el => el.injector.get<CdkOption<O>>(CdkOption)),
    optionEls: optionDebugEls.map(el => el.nativeElement as HTMLElement),
  };
}

describe('CdkOption and CdkListbox', () => {
  describe('id', () => {
    it('should generate unique ids', () => {
      const {listbox, listboxEl, options, optionEls} = setupComponent(ListboxWithOptions);
      const optionIds = new Set(optionEls.map(option => option.id));
      expect(optionIds.size).toBe(options.length);
      for (let i = 0; i < options.length; i++) {
        expect(options[i].id).toBe(optionEls[i].id);
        expect(options[i].id).toMatch(/cdk-option-\d+/);
      }
      expect(listbox.id).toEqual(listboxEl.id);
      expect(listbox.id).toMatch(/cdk-listbox-\d+/);
    });

    it('should not overwrite user given ids', () => {
      const {testComponent, fixture, listboxEl, optionEls} = setupComponent(ListboxWithOptions);
      testComponent.listboxId = 'my-listbox';
      testComponent.appleId = 'my-apple';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(listboxEl.id).toBe('my-listbox');
      expect(optionEls[0].id).toBe('my-apple');
    });
  });

  describe('tabindex', () => {
    it('should use tabindex=0 for focusable elements, tabindex=-1 for non-focusable elements', () => {
      const {fixture, listbox, listboxEl, optionEls} = setupComponent(ListboxWithOptions);
      expect(listboxEl.getAttribute('tabindex')).toBe('0');
      expect(optionEls[0].getAttribute('tabindex')).toBe('-1');

      listbox.focus();
      fixture.detectChanges();

      expect(listboxEl.getAttribute('tabindex')).toBe('-1');
      expect(optionEls[0].getAttribute('tabindex')).toBe('0');
    });

    it('should respect user given tabindex for focusable elements', () => {
      const {testComponent, fixture, listbox, listboxEl, optionEls} =
        setupComponent(ListboxWithOptions);
      testComponent.listboxTabindex = 10;
      testComponent.appleTabindex = 20;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(listboxEl.getAttribute('tabindex')).toBe('10');
      expect(optionEls[0].getAttribute('tabindex')).toBe('-1');

      listbox.focus();
      fixture.detectChanges();

      expect(listboxEl.getAttribute('tabindex')).toBe('-1');
      expect(optionEls[0].getAttribute('tabindex')).toBe('20');
    });

    it('should use listbox tabindex for focusable options', () => {
      const {testComponent, fixture, listbox, optionEls} = setupComponent(ListboxWithOptions);
      testComponent.listboxTabindex = 10;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(optionEls[0].getAttribute('tabindex')).toBe('-1');

      listbox.focus();
      fixture.detectChanges();

      expect(optionEls[0].getAttribute('tabindex')).toBe('10');
    });

    it('should reset the tabindex if the active option is destroyed', () => {
      const {fixture, listbox, listboxEl} = setupComponent(ListboxWithOptions);
      let options = fixture.nativeElement.querySelectorAll('.cdk-option');
      expect(listboxEl.getAttribute('tabindex')).toBe('0');
      expect(options[0].getAttribute('tabindex')).toBe('-1');

      listbox.focus();
      fixture.detectChanges();

      expect(listboxEl.getAttribute('tabindex')).toBe('-1');
      expect(options[0].getAttribute('tabindex')).toBe('0');

      fixture.componentInstance.appleRendered = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      options = fixture.nativeElement.querySelectorAll('.cdk-option');

      expect(listboxEl.getAttribute('tabindex')).toBe('0');
      expect(options[0].getAttribute('tabindex')).toBe('-1');
    });
  });

  describe('selection', () => {
    it('should be empty initially', () => {
      const {fixture, listbox, options, optionEls} = setupComponent(ListboxWithOptions);
      expect(listbox.value).toEqual([]);
      for (let i = 0; i < options.length; i++) {
        expect(options[i].isSelected()).toBeFalse();
        expect(optionEls[i].getAttribute('aria-selected')).toBe('false');
      }
      expect(fixture.componentInstance.changedOption).toBeUndefined();
    });

    it('should update when selection is changed programmatically', () => {
      const {fixture, listbox, options, optionEls} = setupComponent(ListboxWithOptions);
      options[1].select();
      fixture.detectChanges();

      expect(listbox.value).toEqual(['orange']);
      expect(options[1].isSelected()).toBeTrue();
      expect(optionEls[1].getAttribute('aria-selected')).toBe('true');
      expect(fixture.componentInstance.changedOption).toBeUndefined();
    });

    it('should update on option clicked', () => {
      const {fixture, listbox, options, optionEls} = setupComponent(ListboxWithOptions);
      optionEls[0].click();
      fixture.detectChanges();

      expect(listbox.value).toEqual(['apple']);
      expect(options[0].isSelected()).toBeTrue();
      expect(optionEls[0].getAttribute('aria-selected')).toBe('true');
      expect(fixture.componentInstance.changedOption?.id).toBe(options[0].id);
    });

    it('should prevent the default click action', () => {
      const {fixture, optionEls} = setupComponent(ListboxWithOptions);
      const event = dispatchFakeEvent(optionEls[1], 'click');
      fixture.detectChanges();

      expect(event.defaultPrevented).toBe(true);
    });

    it('should select and deselect range on option SHIFT + click', () => {
      const {testComponent, fixture, listbox, optionEls} = setupComponent(ListboxWithOptions);
      testComponent.isMultiselectable = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      dispatchMouseEvent(
        optionEls[1],
        'click',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        {shift: true},
      );
      fixture.detectChanges();

      expect(listbox.value).toEqual(['orange']);

      dispatchMouseEvent(
        optionEls[3],
        'click',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        {shift: true},
      );
      fixture.detectChanges();

      expect(listbox.value).toEqual(['orange', 'banana', 'peach']);

      dispatchMouseEvent(
        optionEls[2],
        'click',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        {shift: true},
      );
      fixture.detectChanges();

      expect(listbox.value).toEqual(['orange']);
    });

    it('should update on option activated via keyboard', () => {
      const {fixture, listbox, listboxEl, options, optionEls} = setupComponent(ListboxWithOptions);
      listbox.focus();
      dispatchKeyboardEvent(listboxEl, 'keydown', SPACE);
      fixture.detectChanges();

      expect(listbox.value).toEqual(['apple']);
      expect(options[0].isSelected()).toBeTrue();
      expect(optionEls[0].getAttribute('aria-selected')).toBe('true');
      expect(fixture.componentInstance.changedOption?.id).toBe(options[0].id);
    });

    it('should deselect previously selected option in single-select listbox', () => {
      const {fixture, listbox, options, optionEls} = setupComponent(ListboxWithOptions);
      dispatchMouseEvent(optionEls[0], 'click');
      fixture.detectChanges();

      expect(listbox.value).toEqual(['apple']);
      expect(options[0].isSelected()).toBeTrue();

      dispatchMouseEvent(optionEls[2], 'click');
      fixture.detectChanges();

      expect(listbox.value).toEqual(['banana']);
      expect(options[0].isSelected()).toBeFalse();
    });

    it('should select all options programmatically in multi-select listbox', () => {
      const {testComponent, fixture, listbox} = setupComponent(ListboxWithOptions);
      testComponent.isMultiselectable = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      listbox.setAllSelected(true);
      fixture.detectChanges();

      expect(listbox.value).toEqual(['apple', 'orange', 'banana', 'peach']);
    });

    it('should add to selection in multi-select listbox', () => {
      const {testComponent, fixture, listbox, options, optionEls} =
        setupComponent(ListboxWithOptions);
      testComponent.isMultiselectable = true;
      fixture.changeDetectorRef.markForCheck();
      optionEls[0].click();
      fixture.detectChanges();

      expect(listbox.value).toEqual(['apple']);
      expect(options[0].isSelected()).toBeTrue();

      optionEls[2].click();
      fixture.detectChanges();

      expect(listbox.value).toEqual(['apple', 'banana']);
      expect(options[0].isSelected()).toBeTrue();
    });

    it('should deselect all options when switching to single-selection with invalid selection', () => {
      const {testComponent, fixture, listbox} = setupComponent(ListboxWithOptions);
      testComponent.isMultiselectable = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      listbox.setAllSelected(true);
      fixture.detectChanges();

      expect(listbox.value).toEqual(['apple', 'orange', 'banana', 'peach']);

      testComponent.isMultiselectable = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(listbox.value).toEqual([]);
    });

    it('should preserve selection when switching to single-selection with valid selection', () => {
      const {testComponent, fixture, listbox, optionEls} = setupComponent(ListboxWithOptions);
      testComponent.isMultiselectable = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      optionEls[0].click();
      fixture.detectChanges();

      expect(listbox.value).toEqual(['apple']);

      testComponent.isMultiselectable = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(listbox.value).toEqual(['apple']);
    });

    it('should allow programmatically toggling options', () => {
      const {testComponent, fixture, listbox, options} = setupComponent(ListboxWithOptions);
      testComponent.isMultiselectable = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      options[0].toggle();
      listbox.toggle(options[1]);
      fixture.detectChanges();

      expect(options[0].isSelected()).toBeTrue();
      expect(options[1].isSelected()).toBeTrue();

      options[0].toggle();
      listbox.toggle(options[1]);
      fixture.detectChanges();

      expect(options[0].isSelected()).toBeFalse();
      expect(options[1].isSelected()).toBeFalse();
    });

    it('should allow programmatically selecting and deselecting options', () => {
      const {testComponent, fixture, listbox, options} = setupComponent(ListboxWithOptions);
      testComponent.isMultiselectable = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      options[0].select();
      listbox.select(options[1]);
      fixture.detectChanges();

      expect(options[0].isSelected()).toBeTrue();
      expect(options[1].isSelected()).toBeTrue();

      options[0].deselect();
      listbox.deselect(options[1]);
      fixture.detectChanges();

      expect(options[0].isSelected()).toBeFalse();
      expect(options[1].isSelected()).toBeFalse();
    });

    it('should allow binding to listbox value', () => {
      const {testComponent, fixture, listbox, options} = setupComponent(ListboxWithBoundValue);
      expect(listbox.value).toEqual(['banana']);
      expect(options[2].isSelected()).toBeTrue();

      testComponent.value = ['orange'];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(listbox.value).toEqual(['orange']);
      expect(options[1].isSelected()).toBeTrue();
    });

    it('should should handle multiple preselected values', () => {
      const {testComponent, fixture, listbox, options} = setupComponent(
        ListboxWithMultipleBoundValues,
      );
      expect(listbox.value).toEqual(['apple', 'banana']);
      expect(options.map(o => o.isSelected())).toEqual([true, false, true, false]);

      testComponent.value = ['orange', 'peach'];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(listbox.value).toEqual(['orange', 'peach']);
      expect(options.map(o => o.isSelected())).toEqual([false, true, false, true]);
    });
  });

  describe('disabled state', () => {
    it('should be able to toggle listbox disabled state', () => {
      const {fixture, testComponent, listbox, listboxEl, options, optionEls} =
        setupComponent(ListboxWithOptions);
      testComponent.isListboxDisabled.set(true);
      fixture.detectChanges();

      expect(listbox.disabled).toBeTrue();
      expect(listboxEl.getAttribute('aria-disabled')).toBe('true');

      for (let i = 0; i < options.length; i++) {
        expect(options[i].disabled).toBeTrue();
        expect(optionEls[i].getAttribute('aria-disabled')).toBe('true');
      }
    });

    it('should toggle option disabled state', () => {
      const {fixture, testComponent, options, optionEls} = setupComponent(ListboxWithOptions);
      testComponent.isAppleDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(options[0].disabled).toBeTrue();
      expect(optionEls[0].getAttribute('aria-disabled')).toBe('true');
    });

    it('should not change selection on click of a disabled option', () => {
      const {fixture, testComponent, listbox, optionEls} = setupComponent(ListboxWithOptions);
      testComponent.isAppleDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      optionEls[0].click();
      fixture.detectChanges();

      expect(listbox.value).toEqual([]);
      expect(fixture.componentInstance.changedOption).toBeUndefined();
    });

    it('should not change selection on click in a disabled listbox', () => {
      const {fixture, testComponent, listbox, optionEls} = setupComponent(ListboxWithOptions);
      testComponent.isListboxDisabled.set(true);
      fixture.detectChanges();

      optionEls[0].click();
      fixture.detectChanges();

      expect(listbox.value).toEqual([]);
      expect(fixture.componentInstance.changedOption).toBeUndefined();
    });

    it('should not change selection on keyboard activation in a disabled listbox', () => {
      const {fixture, testComponent, listbox, listboxEl} = setupComponent(ListboxWithOptions);
      listbox.focus();
      fixture.detectChanges();

      testComponent.isListboxDisabled.set(true);
      fixture.detectChanges();

      dispatchKeyboardEvent(listboxEl, 'keydown', SPACE);
      fixture.detectChanges();

      expect(listbox.value).toEqual([]);
      expect(fixture.componentInstance.changedOption).toBeUndefined();
    });

    it('should not change selection on click of a disabled option', () => {
      const {fixture, testComponent, listbox, listboxEl} = setupComponent(ListboxWithOptions);
      listbox.focus();
      fixture.detectChanges();

      testComponent.isAppleDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      dispatchKeyboardEvent(listboxEl, 'keydown', SPACE);
      fixture.detectChanges();

      expect(listbox.value).toEqual([]);
      expect(fixture.componentInstance.changedOption).toBeUndefined();
    });

    it('should not handle type ahead on a disabled listbox', async (...args: unknown[]) => {
      const {fixture, testComponent, listboxEl, options} = setupComponent(ListboxWithOptions);
      await fakeAsync(() => {
        testComponent.isListboxDisabled.set(true);
        fixture.detectChanges();

        dispatchKeyboardEvent(listboxEl, 'keydown', B);
        fixture.detectChanges();
        tick(200);

        for (let option of options) {
          expect(option.isActive()).toBeFalse();
        }
      })(args);
    });

    it('should skip disabled options when navigating with arrow keys', () => {
      const {testComponent, fixture, listbox, listboxEl, options} =
        setupComponent(ListboxWithOptions);
      testComponent.isOrangeDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      listbox.focus();
      fixture.detectChanges();

      expect(options[0].isActive()).toBeTrue();

      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(options[2].isActive()).toBeTrue();
    });

    it('should not skip disabled options when navigating with arrow keys when skipping is turned off', () => {
      const {testComponent, fixture, listbox, listboxEl, options} =
        setupComponent(ListboxWithOptions);
      testComponent.navigationSkipsDisabled = false;
      testComponent.isOrangeDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      listbox.focus();
      fixture.detectChanges();

      expect(options[0].isActive()).toBeTrue();

      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(options[1].isActive()).toBeTrue();
    });

    it('should not select disabled options with CONTROL + A', () => {
      const {testComponent, fixture, listbox, listboxEl} = setupComponent(ListboxWithOptions);
      testComponent.isMultiselectable = true;
      testComponent.isOrangeDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      listbox.focus();
      dispatchKeyboardEvent(listboxEl, 'keydown', A, undefined, {control: true});
      fixture.detectChanges();

      expect(listbox.value).toEqual(['apple', 'banana', 'peach']);
    });
  });

  describe('compare with', () => {
    it('should allow custom function to compare option values', () => {
      const {fixture, listbox, options} = setupComponent<ListboxWithObjectValues, {name: string}>(
        ListboxWithObjectValues,
        [CommonModule],
      );
      listbox.value = [{name: 'Banana'}];
      fixture.detectChanges();

      expect(options[2].isSelected()).toBeTrue();

      listbox.value = [{name: 'Orange', extraStuff: true} as any];
      fixture.detectChanges();

      expect(options[1].isSelected()).toBeTrue();
    });
  });

  describe('keyboard navigation', () => {
    it('should update active item on arrow key presses', () => {
      const {fixture, listbox, listboxEl, options} = setupComponent(ListboxWithOptions);
      listbox.focus();
      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(options[1].isActive()).toBeTrue();

      dispatchKeyboardEvent(listboxEl, 'keydown', UP_ARROW);
      fixture.detectChanges();

      expect(options[0].isActive()).toBeTrue();
    });

    it('should update active option on home and end key press', () => {
      const {fixture, listbox, listboxEl, options, optionEls} = setupComponent(ListboxWithOptions);
      listbox.focus();
      dispatchKeyboardEvent(listboxEl, 'keydown', END);
      fixture.detectChanges();

      expect(options[options.length - 1].isActive()).toBeTrue();
      expect(optionEls[options.length - 1].classList).toContain('cdk-option-active');

      dispatchKeyboardEvent(listboxEl, 'keydown', HOME);
      fixture.detectChanges();

      expect(options[0].isActive()).toBeTrue();
      expect(optionEls[0].classList).toContain('cdk-option-active');
    });

    it('should change active item using type ahead', async (...args: unknown[]) => {
      const {fixture, listbox, listboxEl, options} = setupComponent(ListboxWithOptions);
      await fakeAsync(() => {
        listbox.focus();
        fixture.detectChanges();

        dispatchKeyboardEvent(listboxEl, 'keydown', B);
        fixture.detectChanges();
        tick(200);

        expect(options[2].isActive()).toBeTrue();
      })(args);
    });

    it('should allow custom type ahead label', async (...args: unknown[]) => {
      const {fixture, listbox, listboxEl, options} = setupComponent(ListboxWithCustomTypeahead);
      await fakeAsync(() => {
        listbox.focus();
        fixture.detectChanges();

        dispatchKeyboardEvent(listboxEl, 'keydown', B);
        fixture.detectChanges();
        tick(200);

        expect(options[2].isActive()).toBeTrue();
      })(args);
    });

    it('should focus and toggle the next item when pressing SHIFT + DOWN_ARROW', () => {
      const {fixture, listbox, listboxEl, options} = setupComponent(ListboxWithOptions);
      listbox.focus();
      fixture.detectChanges();

      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW, undefined, {shift: true});
      fixture.detectChanges();

      expect(listbox.value).toEqual(['orange']);
      expect(fixture.componentInstance.changedOption?.id).toBe(options[1].id);
    });

    it('should update active item on arrow key presses in horizontal mode', () => {
      const {testComponent, fixture, listbox, listboxEl, options} =
        setupComponent(ListboxWithOptions);
      testComponent.orientation = 'horizontal';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(listboxEl.getAttribute('aria-orientation')).toBe('horizontal');

      listbox.focus();
      dispatchKeyboardEvent(listboxEl, 'keydown', RIGHT_ARROW);
      fixture.detectChanges();

      expect(options[1].isActive()).toBeTrue();

      dispatchKeyboardEvent(listboxEl, 'keydown', LEFT_ARROW);
      fixture.detectChanges();

      expect(options[0].isActive()).toBeTrue();
    });

    it('should select and deselect all option with CONTROL + A', () => {
      const {testComponent, fixture, listbox, listboxEl} = setupComponent(ListboxWithOptions);
      testComponent.isMultiselectable = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      listbox.focus();
      dispatchKeyboardEvent(listboxEl, 'keydown', A, undefined, {control: true});
      fixture.detectChanges();

      expect(listbox.value).toEqual(['apple', 'orange', 'banana', 'peach']);

      dispatchKeyboardEvent(listboxEl, 'keydown', A, undefined, {control: true});
      fixture.detectChanges();

      expect(listbox.value).toEqual([]);
    });

    it('should select and deselect range with CONTROL + SPACE', () => {
      const {testComponent, fixture, listbox, listboxEl} = setupComponent(ListboxWithOptions);
      testComponent.isMultiselectable = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      listbox.focus();
      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      dispatchKeyboardEvent(listboxEl, 'keydown', SPACE, undefined, {shift: true});
      fixture.detectChanges();

      expect(listbox.value).toEqual(['orange']);

      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      dispatchKeyboardEvent(listboxEl, 'keydown', SPACE, undefined, {shift: true});
      fixture.detectChanges();

      expect(listbox.value).toEqual(['orange', 'banana', 'peach']);

      dispatchKeyboardEvent(listboxEl, 'keydown', UP_ARROW);
      dispatchKeyboardEvent(listboxEl, 'keydown', SPACE, undefined, {shift: true});

      expect(listbox.value).toEqual(['orange']);
    });

    it('should select and deselect range with CONTROL + SHIFT + HOME', () => {
      const {testComponent, fixture, listbox, listboxEl} = setupComponent(ListboxWithOptions);
      testComponent.isMultiselectable = true;
      fixture.changeDetectorRef.markForCheck();
      listbox.focus();
      fixture.detectChanges();

      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      dispatchKeyboardEvent(listboxEl, 'keydown', HOME, undefined, {control: true, shift: true});

      expect(listbox.value).toEqual(['apple', 'orange', 'banana']);

      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      dispatchKeyboardEvent(listboxEl, 'keydown', HOME, undefined, {control: true, shift: true});

      expect(listbox.value).toEqual([]);
    });

    it('should select and deselect range with CONTROL + SHIFT + END', () => {
      const {testComponent, fixture, listbox, listboxEl} = setupComponent(ListboxWithOptions);
      testComponent.isMultiselectable = true;
      fixture.changeDetectorRef.markForCheck();
      listbox.focus();
      fixture.detectChanges();

      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      dispatchKeyboardEvent(listboxEl, 'keydown', END, undefined, {control: true, shift: true});

      expect(listbox.value).toEqual(['orange', 'banana', 'peach']);

      dispatchKeyboardEvent(listboxEl, 'keydown', UP_ARROW);
      dispatchKeyboardEvent(listboxEl, 'keydown', UP_ARROW);
      dispatchKeyboardEvent(listboxEl, 'keydown', END, undefined, {control: true, shift: true});

      expect(listbox.value).toEqual([]);
    });

    it('should wrap navigation when wrapping is enabled', () => {
      const {fixture, listbox, listboxEl, options} = setupComponent(ListboxWithOptions);
      listbox.focus();
      dispatchKeyboardEvent(listboxEl, 'keydown', END);
      fixture.detectChanges();

      expect(options[options.length - 1].isActive()).toBeTrue();

      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(options[0].isActive()).toBeTrue();
    });

    it('should not wrap navigation when wrapping is not enabled', () => {
      const {testComponent, fixture, listbox, listboxEl, options} =
        setupComponent(ListboxWithOptions);
      testComponent.navigationWraps = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      listbox.focus();
      dispatchKeyboardEvent(listboxEl, 'keydown', END);
      fixture.detectChanges();

      expect(options[options.length - 1].isActive()).toBeTrue();

      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(options[options.length - 1].isActive()).toBeTrue();
    });

    it('should focus the selected option when the listbox is focused', () => {
      const {testComponent, fixture, listbox, listboxEl, options} =
        setupComponent(ListboxWithOptions);
      testComponent.selectedValue = 'peach';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      listbox.focus();
      fixture.detectChanges();

      expect(options[3].isActive()).toBeTrue();

      dispatchKeyboardEvent(listboxEl, 'keydown', UP_ARROW);
      fixture.detectChanges();

      expect(options[2].isActive()).toBeTrue();
    });

    it('should not move focus to the selected option while the user is navigating', () => {
      const {testComponent, fixture, listbox, listboxEl, options} =
        setupComponent(ListboxWithOptions);
      listbox.focus();
      fixture.detectChanges();
      expect(options[0].isActive()).toBeTrue();

      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      fixture.detectChanges();
      expect(options[1].isActive()).toBeTrue();

      testComponent.selectedValue = 'peach';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(options[1].isActive()).toBeTrue();
    });
  });

  describe('with roving tabindex', () => {
    it('should shift focus on keyboard navigation', () => {
      const {fixture, listbox, listboxEl, optionEls} = setupComponent(ListboxWithOptions);
      listbox.focus();
      fixture.detectChanges();

      expect(document.activeElement).toBe(optionEls[0]);
      expect(listboxEl.hasAttribute('aria-activedescendant')).toBeFalse();

      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(document.activeElement).toBe(optionEls[1]);
      expect(listboxEl.hasAttribute('aria-activedescendant')).toBeFalse();
    });

    it('should focus first option on listbox focus', () => {
      const {fixture, listbox, optionEls} = setupComponent(ListboxWithOptions);
      listbox.focus();
      fixture.detectChanges();

      expect(document.activeElement).toBe(optionEls[0]);
    });

    it('should focus listbox if no focusable options available', () => {
      const {fixture, listbox, listboxEl} = setupComponent(ListboxWithNoOptions);

      listbox.focus();
      fixture.detectChanges();

      expect(document.activeElement).toBe(listboxEl);
    });
  });

  describe('with aria-activedescendant', () => {
    it('should update active descendant on keyboard navigation', () => {
      const {testComponent, fixture, listbox, listboxEl, optionEls} =
        setupComponent(ListboxWithOptions);
      testComponent.isActiveDescendant = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      listbox.focus();
      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(listboxEl.getAttribute('aria-activedescendant')).toBe(optionEls[0].id);
      expect(document.activeElement).toBe(listboxEl);

      dispatchKeyboardEvent(listboxEl, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(listboxEl.getAttribute('aria-activedescendant')).toBe(optionEls[1].id);
      expect(document.activeElement).toBe(listboxEl);
    });

    it('should not activate an option on listbox focus', () => {
      const {testComponent, fixture, listbox, options} = setupComponent(ListboxWithOptions);
      testComponent.isActiveDescendant = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      listbox.focus();
      fixture.detectChanges();

      for (let option of options) {
        expect(option.isActive()).toBeFalse();
      }
    });

    it('should focus listbox and make option active on option focus', () => {
      const {testComponent, fixture, listboxEl, options, optionEls} =
        setupComponent(ListboxWithOptions);
      testComponent.isActiveDescendant = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      optionEls[2].focus();
      fixture.detectChanges();

      expect(document.activeElement).toBe(listboxEl);
      expect(options[2].isActive()).toBeTrue();
    });
  });

  describe('with FormControl', () => {
    it('should reflect disabled state of the FormControl', () => {
      const {testComponent, fixture, listbox} = setupComponent(ListboxWithFormControl, [
        ReactiveFormsModule,
      ]);
      testComponent.formControl.disable();
      fixture.detectChanges();

      expect(listbox.disabled).toBeTrue();
    });

    it('should update when FormControl value changes', () => {
      const {testComponent, fixture, options} = setupComponent(ListboxWithFormControl, [
        ReactiveFormsModule,
      ]);
      testComponent.formControl.setValue(['banana']);
      fixture.detectChanges();

      expect(options[2].isSelected()).toBeTrue();
    });

    it('should update FormControl when selection changes', () => {
      const {testComponent, fixture, optionEls} = setupComponent(ListboxWithFormControl, [
        ReactiveFormsModule,
      ]);
      const spy = jasmine.createSpy();
      const subscription = testComponent.formControl.valueChanges.subscribe(spy);
      fixture.detectChanges();

      expect(spy).not.toHaveBeenCalled();

      optionEls[1].click();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(['orange']);
      subscription.unsubscribe();
    });

    it('should update multi-select listbox when FormControl value changes', () => {
      const {testComponent, fixture, options} = setupComponent(ListboxWithFormControl, [
        ReactiveFormsModule,
      ]);
      testComponent.isMultiselectable = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      testComponent.formControl.setValue(['orange', 'banana']);
      fixture.detectChanges();

      expect(options[1].isSelected()).toBeTrue();
      expect(options[2].isSelected()).toBeTrue();
    });

    it('should update FormControl when multi-selection listbox changes', () => {
      const {testComponent, fixture, optionEls} = setupComponent(ListboxWithFormControl, [
        ReactiveFormsModule,
      ]);
      testComponent.isMultiselectable = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      const spy = jasmine.createSpy();
      const subscription = testComponent.formControl.valueChanges.subscribe(spy);
      fixture.detectChanges();

      expect(spy).not.toHaveBeenCalled();

      optionEls[1].click();
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith(['orange']);

      optionEls[2].click();
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith(['orange', 'banana']);
      subscription.unsubscribe();
    });

    it('should throw when multiple values selected in single-select listbox', () => {
      const {testComponent, fixture} = setupComponent(ListboxWithFormControl, [
        ReactiveFormsModule,
      ]);

      expect(() => {
        testComponent.formControl.setValue(['orange', 'banana']);
        fixture.detectChanges();
      }).toThrowError('Listbox cannot have more than one selected value in multi-selection mode.');
    });

    it('should throw when an invalid value is selected', () => {
      const {testComponent, fixture} = setupComponent(ListboxWithFormControl, [
        ReactiveFormsModule,
      ]);
      testComponent.isMultiselectable = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(() => {
        testComponent.formControl.setValue(['orange', 'dragonfruit', 'mango']);
        fixture.detectChanges();
      }).toThrowError('Listbox has selected values that do not match any of its options.');
    });

    it('should not throw on init with a preselected form control and a dynamic set of options', () => {
      expect(() => {
        setupComponent(ListboxWithPreselectedFormControl, [ReactiveFormsModule]);
      }).not.toThrow();
    });

    it('should throw on init if the preselected value is invalid', () => {
      expect(() => {
        setupComponent(ListboxWithInvalidPreselectedFormControl, [ReactiveFormsModule]);
      }).toThrowError('Listbox has selected values that do not match any of its options.');
    });
  });
});

@Component({
  template: `
    <div cdkListbox
         [id]="listboxId"
         [tabindex]="listboxTabindex"
         [cdkListboxMultiple]="isMultiselectable"
         [cdkListboxDisabled]="isListboxDisabled()"
         [cdkListboxUseActiveDescendant]="isActiveDescendant"
         [cdkListboxOrientation]="orientation"
         [cdkListboxNavigationWrapDisabled]="!navigationWraps"
         [cdkListboxNavigatesDisabledOptions]="!navigationSkipsDisabled"
         [cdkListboxValue]="selectedValue"
         (cdkListboxValueChange)="onSelectionChange($event)">
      @if (appleRendered) {
        <div cdkOption="apple"
             [cdkOptionDisabled]="isAppleDisabled"
             [id]="appleId"
             [tabindex]="appleTabindex">
          Apple
        </div>
      }
      <div cdkOption="orange" [cdkOptionDisabled]="isOrangeDisabled">Orange
      </div>
      <div cdkOption="banana">Banana</div>
      <div cdkOption="peach">Peach</div>
    </div>
  `,
})
class ListboxWithOptions {
  changedOption: CdkOption | null;
  isListboxDisabled = signal(false);
  isAppleDisabled = false;
  isOrangeDisabled = false;
  isMultiselectable = false;
  isActiveDescendant = false;
  navigationWraps = true;
  navigationSkipsDisabled = true;
  appleRendered = true;
  listboxId: string;
  listboxTabindex: number;
  appleId: string;
  appleTabindex: number;
  orientation: 'horizontal' | 'vertical' = 'vertical';
  selectedValue: string;

  onSelectionChange(event: ListboxValueChangeEvent<unknown>) {
    this.changedOption = event.option;
  }
}

@Component({
  template: `<div cdkListbox></div>`,
})
class ListboxWithNoOptions {}

@Component({
  template: `
    <div cdkListbox
         [formControl]="formControl"
         [cdkListboxMultiple]="isMultiselectable"
         [cdkListboxUseActiveDescendant]="isActiveDescendant">
      <div cdkOption="apple">Apple</div>
      <div cdkOption="orange">Orange</div>
      <div cdkOption="banana">Banana</div>
      <div cdkOption="peach">Peach</div>
    </div>
  `,
})
class ListboxWithFormControl {
  formControl = new FormControl();
  isMultiselectable = false;
  isActiveDescendant = false;
}

@Component({
  template: `
    <div cdkListbox [formControl]="formControl">
      @for (option of options; track option) {
        <div [cdkOption]="option">{{option}}</div>
      }
    </div>
  `,
})
class ListboxWithPreselectedFormControl {
  options = ['a', 'b', 'c'];
  formControl = new FormControl('c');
}

@Component({
  template: `
    <div cdkListbox [formControl]="formControl">
      @for (option of options; track option) {
        <div [cdkOption]="option">{{option}}</div>
      }
    </div>
  `,
})
class ListboxWithInvalidPreselectedFormControl {
  options = ['a', 'b', 'c'];
  formControl = new FormControl('d');
}

@Component({
  template: `
    <ul cdkListbox>
      <li cdkOption="apple" cdkOptionTypeaheadLabel="apple">🍎</li>
      <li cdkOption="orange" cdkOptionTypeaheadLabel="orange">🍊</li>
      <li cdkOption="banana" cdkOptionTypeaheadLabel="banana">🍌</li>
      <li cdkOption="peach" cdkOptionTypeaheadLabel="peach">🍑</li>
    </ul>
  `,
})
class ListboxWithCustomTypeahead {}

@Component({
  template: `
    <div cdkListbox
         [cdkListboxValue]="value">
      <div cdkOption="apple">Apple</div>
      <div cdkOption="orange">Orange</div>
      <div cdkOption="banana">Banana</div>
      <div cdkOption="peach">Peach</div>
    </div>
  `,
})
class ListboxWithBoundValue {
  value = ['banana'];
}

@Component({
  template: `
    <div cdkListbox
         cdkListboxMultiple
         [cdkListboxValue]="value">
      <div cdkOption="apple">Apple</div>
      <div cdkOption="orange">Orange</div>
      <div cdkOption="banana">Banana</div>
      <div cdkOption="peach">Peach</div>
    </div>
  `,
})
class ListboxWithMultipleBoundValues {
  value = ['apple', 'banana'];
}

@Component({
  template: `
    <div cdkListbox [cdkListboxCompareWith]="fruitCompare">
      @for (fruit of fruits; track fruit) {
        <div [cdkOption]="fruit">{{fruit.name}}</div>
      }
    </div>
  `,
})
class ListboxWithObjectValues {
  fruits = [{name: 'Apple'}, {name: 'Orange'}, {name: 'Banana'}, {name: 'Peach'}];

  fruitCompare = (a: {name: string}, b: {name: string}) => a.name === b.name;
}
