import {SimpleComboboxPattern, SimpleComboboxPopupPattern} from './simple-combobox';
import {signal} from '../behaviors/signal-like/signal-like';
import {createKeyboardEvent} from '@angular/cdk/testing/private';

describe('SimpleComboboxPattern', () => {
  function setup(
    inputs: Partial<{
      disabled: boolean;
      alwaysExpanded: boolean;
      inlineSuggestion: string;
      popupType: 'listbox' | 'tree' | 'grid' | 'dialog';
    }> = {},
  ) {
    const element = document.createElement('input');
    const value = signal('');
    const expanded = signal(false);
    const alwaysExpanded = signal(inputs.alwaysExpanded ?? false);
    const disabled = signal(inputs.disabled ?? false);
    const inlineSuggestion = signal<string | undefined>(inputs.inlineSuggestion);

    // Mock a generic popup pattern
    const popupId = signal('popup-1');
    const activeDescendant = signal<string | undefined>('item-1');
    const controlTarget = document.createElement('div');
    const popupType = signal<'listbox' | 'tree' | 'grid' | 'dialog'>(inputs.popupType ?? 'listbox');

    const popup = new SimpleComboboxPopupPattern({
      popupType,
      controlTarget: signal(controlTarget),
      activeDescendant,
      popupId,
    });

    const pattern = new SimpleComboboxPattern({
      alwaysExpanded,
      value,
      element: signal(element),
      popup: signal(popup),
      inlineSuggestion,
      disabled,
      expanded,
      expandable: signal(true),
      openOnInput: signal(true),
      trigger: signal(undefined),
    });

    return {
      pattern,
      element,
      value,
      expanded,
      alwaysExpanded,
      inlineSuggestion,
      disabled,
      popup,
      controlTarget,
    };
  }

  describe('Aria-autocomplete calculation', () => {
    it('should return "list" when only popup is present', () => {
      const {pattern} = setup();
      expect(pattern.autocomplete()).toBe('list');
    });

    it('should return "both" when popup and inline suggestion are present', () => {
      const {pattern} = setup({inlineSuggestion: 'suggestion'});
      expect(pattern.autocomplete()).toBe('both');
    });

    it('should return "none" when only dialog popup is present', () => {
      const {pattern} = setup({popupType: 'dialog'});
      expect(pattern.autocomplete()).toBe('none');
    });

    it('should return "inline" when dialog popup and inline suggestion are present', () => {
      const {pattern} = setup({popupType: 'dialog', inlineSuggestion: 'suggestion'});
      expect(pattern.autocomplete()).toBe('inline');
    });
  });

  describe('Expansion via Keyboard', () => {
    it('should open on ArrowDown when collapsed', () => {
      const {pattern, expanded} = setup();
      expect(expanded()).toBe(false);

      pattern.onKeydown(createKeyboardEvent('keydown', 40, 'ArrowDown'));
      expect(expanded()).toBe(true);
    });

    it('should close on Escape when expanded', () => {
      const {pattern, expanded} = setup();
      expanded.set(true);

      pattern.onKeydown(createKeyboardEvent('keydown', 27, 'Escape'));
      expect(expanded()).toBe(false);
    });
  });

  describe('Input handling', () => {
    it('should update value and expand on input', () => {
      const {pattern, element, value, expanded} = setup();
      expect(expanded()).toBe(false);

      element.value = 'hello';
      pattern.onInput({target: element} as unknown as Event);

      expect(value()).toBe('hello');
      expect(expanded()).toBe(true);
    });
  });

  describe('Focus handling', () => {
    it('should track focus state', () => {
      const {pattern} = setup();

      pattern.onFocusin();
      expect(pattern.isFocused()).toBe(true);

      pattern.onFocusout(new FocusEvent('focusout'));
      expect(pattern.isFocused()).toBe(false);
    });
  });

  describe('Inline Suggestion / Highlighting', () => {
    it('should insert the inline suggestion into the input and select the remaining text', () => {
      const {pattern, element, value, expanded, inlineSuggestion} = setup();

      value.set('App');
      inlineSuggestion.set('Apple');
      expanded.set(true);
      pattern.isFocused.set(true);

      pattern.highlightEffect();

      expect(element.value).toBe('Apple');
      expect(element.selectionStart).toBe(3);
      expect(element.selectionEnd).toBe(5);
    });

    it('should not highlight when deleting text', () => {
      const {pattern, element, value, expanded, inlineSuggestion} = setup();

      value.set('App');
      inlineSuggestion.set('Apple');
      expanded.set(true);
      pattern.isFocused.set(true);

      const deleteEvent = new InputEvent('input', {inputType: 'deleteContentBackward'});
      Object.defineProperty(deleteEvent, 'target', {value: element});
      pattern.onInput(deleteEvent as Event);

      expect(pattern.isDeleting()).toBe(true);

      pattern.highlightEffect();

      expect(element.value).not.toBe('Apple');
    });
  });

  describe('Select-only combobox behavior', () => {
    function setupSelectOnly() {
      const selectOnlyElement = document.createElement('div');
      const {pattern, expanded, controlTarget} = setup();

      // Override element to be select-only
      pattern.inputs.element = signal(selectOnlyElement);

      return {pattern, expanded, selectOnlyElement, controlTarget};
    }

    it('should toggle expansion on click', () => {
      const {pattern, expanded} = setupSelectOnly();
      expect(expanded()).toBe(false);

      pattern.onClick(new PointerEvent('click'));
      expect(expanded()).toBe(true);

      pattern.onClick(new PointerEvent('click'));
      expect(expanded()).toBe(false);
    });

    it('should open on Enter or Space when collapsed', () => {
      const {pattern, expanded} = setupSelectOnly();

      pattern.onKeydown(createKeyboardEvent('keydown', 13, 'Enter'));
      expect(expanded()).toBe(true);

      expanded.set(false);

      pattern.onKeydown(createKeyboardEvent('keydown', 32, ' '));
      expect(expanded()).toBe(true);
    });
  });

  describe('alwaysExpanded behavior', () => {
    it('should stay open on Escape when alwaysExpanded is true', () => {
      const {pattern, expanded} = setup({alwaysExpanded: true});
      expanded.set(true);

      pattern.onKeydown(createKeyboardEvent('keydown', 27, 'Escape'));
      expect(expanded()).toBe(true);
    });
  });

  describe('Blur behavior', () => {
    it('should close when focus leaves both combobox and popup', () => {
      const {pattern, expanded} = setup();
      expanded.set(true);
      pattern.isFocused.set(false);
      pattern.inputs.popup()!.isFocused.set(false);

      pattern.closePopupOnBlurEffect();
      expect(expanded()).toBe(false);
    });

    it('should remain open if popup is focused', () => {
      const {pattern, expanded} = setup();
      expanded.set(true);
      pattern.isFocused.set(false);
      pattern.inputs.popup()!.isFocused.set(true);

      pattern.closePopupOnBlurEffect();
      expect(expanded()).toBe(true);
    });
  });

  describe('Advanced Combo Keys Relay', () => {
    it('should forward Shift + ArrowUp/ArrowDown for editable inputs', () => {
      const {pattern, expanded} = setup();
      expanded.set(true);

      const shiftUp = createKeyboardEvent('keydown', 38, 'ArrowUp');
      Object.defineProperty(shiftUp, 'shiftKey', {value: true});
      pattern.onKeydown(shiftUp);
      expect(pattern.keyboardEventRelay()).toBe(shiftUp);

      const shiftDown = createKeyboardEvent('keydown', 40, 'ArrowDown');
      Object.defineProperty(shiftDown, 'shiftKey', {value: true});
      pattern.onKeydown(shiftDown);
      expect(pattern.keyboardEventRelay()).toBe(shiftDown);
    });

    it('should NOT forward Ctrl+A or Shift+Home/End for editable inputs', () => {
      const {pattern, expanded} = setup();
      expanded.set(true);

      const ctrlA = createKeyboardEvent('keydown', 65, 'a');
      Object.defineProperty(ctrlA, 'ctrlKey', {value: true});
      pattern.onKeydown(ctrlA);
      expect(pattern.keyboardEventRelay()).toBeUndefined();

      const shiftHome = createKeyboardEvent('keydown', 36, 'Home');
      Object.defineProperty(shiftHome, 'shiftKey', {value: true});
      pattern.onKeydown(shiftHome);
      expect(pattern.keyboardEventRelay()).toBeUndefined();
    });

    it('should forward Ctrl+A and Shift+Home/End for select-only (non-editable) comboboxes', () => {
      const selectOnlyElement = document.createElement('div');
      const {pattern, expanded} = setup();
      pattern.inputs.element = signal(selectOnlyElement);
      expanded.set(true);

      const ctrlA = createKeyboardEvent('keydown', 65, 'a');
      Object.defineProperty(ctrlA, 'ctrlKey', {value: true});
      pattern.onKeydown(ctrlA);
      expect(pattern.keyboardEventRelay()).toBe(ctrlA);

      const shiftHome = createKeyboardEvent('keydown', 36, 'Home');
      Object.defineProperty(shiftHome, 'shiftKey', {value: true});
      pattern.onKeydown(shiftHome);
      expect(pattern.keyboardEventRelay()).toBe(shiftHome);
    });
  });
});
