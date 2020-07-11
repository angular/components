import {emulateKeyInTextInput} from './emulate-text-input-behavior';
import {isTextInput, TextInputElement} from './text-input-element';

describe('type in text input', () => {
  describe('in general', () => {
    let input: TextInputElement;

    beforeEach(() => input = document.createElement('input'));

    it('should be a TextInput', () => {
      expect(isTextInput(input)).toBe(true);
    });

    it('should change value on character input', () => {
      emulateKeyInTextInput({}, 'a', input);
      emulateKeyInTextInput({}, 'b', input);
      emulateKeyInTextInput({}, 'c', input);

      expect(input.value).toBe('abc');
    });

    describe('simulate selection', () => {
      it('should select last character on Shift + ArrowLeft', () => {
        input.value = 'abc';

        emulateKeyInTextInput({ shift: true }, 'ArrowLeft', input);

        expect(input.selectionStart).toBe(2, 'start');
        expect(input.selectionEnd).toBe(3, 'end');
        expect(input.selectionDirection).toBe('backward', 'direction');
      });

      it('should extend selection backward', () => {
        input.value = 'abc';

        emulateKeyInTextInput({ shift: true }, 'ArrowLeft', input);
        emulateKeyInTextInput({ shift: true }, 'ArrowLeft', input);

        expect(input.selectionStart).toBe(1, 'start');
        expect(input.selectionEnd).toBe(3, 'end');
        expect(input.selectionDirection).toBe('backward', 'direction');
      });

      it('should stop extending selection backward at the beginning of the input', () => {
        input.value = 'abc';

        emulateKeyInTextInput({ shift: true }, 'ArrowLeft', input);
        emulateKeyInTextInput({ shift: true }, 'ArrowLeft', input);
        emulateKeyInTextInput({ shift: true }, 'ArrowLeft', input);
        emulateKeyInTextInput({ shift: true }, 'ArrowLeft', input);

        expect(input.selectionStart).toBe(0, 'start');
        expect(input.selectionEnd).toBe(3, 'end');
        expect(input.selectionDirection).toBe('backward', 'direction');
      });

      it('should reduce selection backward', () => {
        input.value = 'abc';

        emulateKeyInTextInput({ shift: true }, 'ArrowLeft', input);
        emulateKeyInTextInput({ shift: true }, 'ArrowLeft', input);
        emulateKeyInTextInput({ shift: true }, 'ArrowRight', input);

        expect(input.selectionStart).toBe(2, 'start');
        expect(input.selectionEnd).toBe(3, 'end');
        expect(input.selectionDirection).toBe('backward', 'direction');
      });

      it('should move cursor without shift', () => {
        input.value = 'abc';

        emulateKeyInTextInput({}, 'ArrowLeft', input);

        expect(input.selectionStart).toBe(2, 'start');
        expect(input.selectionEnd).toBe(2, 'end');
        expect(input.selectionDirection).toEqual(
          jasmine.stringMatching(/none|forward/), 'direction',
        );
      });

      it('should start selection from cursor position', () => {
        input.value = 'abc';

        emulateKeyInTextInput({}, 'ArrowLeft', input);
        emulateKeyInTextInput({ shift: true }, 'ArrowLeft', input);

        expect(input.selectionStart).toBe(1, 'start');
        expect(input.selectionEnd).toBe(2, 'end');
        expect(input.selectionDirection).toBe('backward', 'direction');
      });

      it('should type at cursor position', () => {
        emulateKeyInTextInput({}, 'a', input);
        emulateKeyInTextInput({}, 'b', input);
        emulateKeyInTextInput({}, 'ArrowLeft', input);
        emulateKeyInTextInput({}, 'c', input);

        expect(input.value).toBe('acb');
        expect(input.selectionStart).toBe(2, 'start');
        expect(input.selectionEnd).toBe(2, 'end');
        expect(input.selectionDirection).toEqual(
          jasmine.stringMatching(/none|forward/), 'direction',
        );
      });

      it('should change selection direction from backwards to none', () => {
        input.value = 'abcd';
        emulateKeyInTextInput({}, 'ArrowLeft', input);
        emulateKeyInTextInput({}, 'ArrowLeft', input);
        emulateKeyInTextInput({ shift: true }, 'ArrowLeft', input);
        emulateKeyInTextInput({ shift: true }, 'ArrowRight', input);

        expect(input.selectionStart).toBe(2, 'start');
        expect(input.selectionEnd).toBe(2, 'end');
        expect(input.selectionDirection).toEqual(
          jasmine.stringMatching(/none|forward/), 'direction',
        );
      });

      it('should change selection direction from backwards to forwards', () => {
        input.value = 'abcd';
        emulateKeyInTextInput({}, 'ArrowLeft', input);
        emulateKeyInTextInput({}, 'ArrowLeft', input);
        emulateKeyInTextInput({ shift: true }, 'ArrowLeft', input);
        emulateKeyInTextInput({ shift: true }, 'ArrowRight', input);
        emulateKeyInTextInput({ shift: true }, 'ArrowRight', input);

        expect(input.selectionStart).toBe(2, 'start');
        expect(input.selectionEnd).toBe(3, 'end');
        expect(input.selectionDirection).toBe('forward', 'direction');
      });

      it('should extend selection forward', () => {
        input.value = 'abc';
        input.selectionStart = input.selectionEnd = 0;

        emulateKeyInTextInput({ shift: true }, 'ArrowRight', input);
        emulateKeyInTextInput({ shift: true }, 'ArrowRight', input);

        expect(input.selectionStart).toBe(0, 'start');
        expect(input.selectionEnd).toBe(2, 'end');
        expect(input.selectionDirection).toBe('forward', 'direction');
      });

      it('should stop extending selection forward at the end of the input', () => {
        input.value = 'abc';
        input.selectionStart = input.selectionEnd = 0;

        emulateKeyInTextInput({ shift: true }, 'ArrowRight', input);
        emulateKeyInTextInput({ shift: true }, 'ArrowRight', input);
        emulateKeyInTextInput({ shift: true }, 'ArrowRight', input);
        emulateKeyInTextInput({ shift: true }, 'ArrowRight', input);

        expect(input.selectionStart).toBe(0, 'start');
        expect(input.selectionEnd).toBe(3, 'end');
        expect(input.selectionDirection).toBe('forward', 'direction');
      });

      it('should reduce selection forward', () => {
        input.value = 'abc';
        input.selectionStart = input.selectionEnd = 0;

        emulateKeyInTextInput({ shift: true }, 'ArrowRight', input);
        emulateKeyInTextInput({ shift: true }, 'ArrowRight', input);
        emulateKeyInTextInput({ shift: true }, 'ArrowLeft', input);

        expect(input.selectionStart).toBe(0, 'start');
        expect(input.selectionEnd).toBe(1, 'end');
        expect(input.selectionDirection).toBe('forward', 'direction');
      });

      it('should change selection direction from forward to none', () => {
        input.value = 'abcd';
        input.selectionStart = input.selectionEnd = 2;

        emulateKeyInTextInput({ shift: true }, 'ArrowRight', input);
        emulateKeyInTextInput({ shift: true }, 'ArrowLeft', input);

        expect(input.selectionStart).toBe(2, 'start');
        expect(input.selectionEnd).toBe(2, 'end');
        expect(input.selectionDirection).toEqual(
          jasmine.stringMatching(/none|forward/), 'direction',
        );
      });

      it('should change selection direction from forward to backward', () => {
        input.value = 'abcd';
        input.selectionStart = input.selectionEnd = 2;

        emulateKeyInTextInput({ shift: true }, 'ArrowRight', input);
        emulateKeyInTextInput({ shift: true }, 'ArrowLeft', input);
        emulateKeyInTextInput({ shift: true }, 'ArrowLeft', input);

        expect(input.selectionStart).toBe(1, 'start');
        expect(input.selectionEnd).toBe(2, 'end');
        expect(input.selectionDirection).toBe('backward', 'direction');
      });
    });

    // describe('simulate backspace', () => {
    //   pending('backspace not implemented yet');
    //   it('should delete last character', () => {
    //     input.value = 'abcd';

    //     emulateKeyInTextInput({}, 'Backspace', input);

    //     expect(input.value).toBe('abc', 'value');
    //     expect(input.selectionStart).toBe(3, 'start');
    //     expect(input.selectionEnd).toBe(3, 'end');
    //     expect(input.selectionDirection).toEqual(
    //       jasmine.stringMatching(/none|forward/), 'direction',
    //     );
    //   });

    //   it('should delete all characters', () => {
    //     input.value = 'abcd';

    //     emulateKeyInTextInput({}, 'Backspace', input);
    //     emulateKeyInTextInput({}, 'Backspace', input);
    //     emulateKeyInTextInput({}, 'Backspace', input);
    //     emulateKeyInTextInput({}, 'Backspace', input);

    //     expect(input.value).toBe('', 'value');
    //     expect(input.selectionStart).toBe(0, 'start');
    //     expect(input.selectionEnd).toBe(0, 'end');
    //     expect(input.selectionDirection).toEqual(
    //       jasmine.stringMatching(/none|forward/), 'direction',
    //     );
    //   });

    //   it('should not trigger events after deleting all characters', () => {
    //     input.value = 'abcd';
    //     const eventSpy = spyOn(input, 'dispatchEvent');

    //     emulateKeyInTextInput({}, 'Backspace', input);
    //     emulateKeyInTextInput({}, 'Backspace', input);
    //     emulateKeyInTextInput({}, 'Backspace', input);
    //     emulateKeyInTextInput({}, 'Backspace', input);
    //     emulateKeyInTextInput({}, 'Backspace', input);
    //     emulateKeyInTextInput({}, 'Backspace', input);

    //     expect(eventSpy).toHaveBeenCalledTimes(4);
    //     expect(input.value).toBe('', 'value');
    //     expect(input.selectionStart).toBe(0, 'start');
    //     expect(input.selectionEnd).toBe(0, 'end');
    //     expect(input.selectionDirection).toEqual(
    //       jasmine.stringMatching(/none|forward/), 'direction',
    //     );
    //   });

    //   it('should delete at cursor position', () => {
    //     input.value = 'abc';
    //     emulateKeyInTextInput({}, 'ArrowLeft', input);
    //     emulateKeyInTextInput({}, 'Backspace', input);
    //     emulateKeyInTextInput({}, 'd', input);

    //     expect(input.value).toBe('adc');
    //     expect(input.selectionStart).toBe(2, 'start');
    //     expect(input.selectionEnd).toBe(2, 'end');
    //     expect(input.selectionDirection).toEqual(
    //       jasmine.stringMatching(/none|forward/), 'direction',
    //     );
    //   });

    //   it('should delete all selected characters', () => {
    //     input.value = 'abcd';
    //     emulateKeyInTextInput({}, 'ArrowLeft', input);
    //     emulateKeyInTextInput({ shift: true }, 'ArrowLeft', input);
    //     emulateKeyInTextInput({ shift: true }, 'ArrowLeft', input);
    //     emulateKeyInTextInput({}, 'Backspace', input);

    //     expect(input.value).toBe('ad', 'value');
    //     expect(input.selectionStart).toBe(1, 'start');
    //     expect(input.selectionEnd).toBe(1, 'end');
    //     expect(input.selectionDirection).toEqual(
    //       jasmine.stringMatching(/none|forward/), 'direction',
    //     );
    //   });
    // });
  });

  describe('HTMLInputElement', () => {
    let input: HTMLInputElement;

    beforeEach(() => input = document.createElement('input'));

    it('should be a TextInput', () => {
      expect(isTextInput(input)).toBe(true);
    });

    // it('should not append new line on "Enter"', () => {
    //   pending('enter not implemented yet');
    //   emulateKeyInTextInput({}, 'a', input);
    //   emulateKeyInTextInput({}, 'Enter', input);
    //   emulateKeyInTextInput({}, 'c', input);

    //   expect(input.value).toBe('ac');
    // });

    it('on arrow up key should select value until it\'s start', () => {
      input.value = 'abcd';

      emulateKeyInTextInput({}, 'ArrowLeft', input);
      emulateKeyInTextInput({ shift: true }, 'ArrowUp', input);

      expect(input.selectionStart).toBe(0, 'start');
      expect(input.selectionEnd).toBe(3, 'end');
      expect(input.selectionDirection).toBe('backward', 'direction');
    });

    it('on arrow down key should select value until it\'s start', () => {
      input.value = 'abcd';
      input.selectionStart = input.selectionEnd = 1;

      emulateKeyInTextInput({ shift: true }, 'ArrowDown', input);

      expect(input.selectionStart).toBe(1, 'start');
      expect(input.selectionEnd).toBe(4, 'end');
      expect(input.selectionDirection).toBe('forward', 'direction');
    });

    it('on arrow up then down key should remove selection', () => {
      input.value = 'abcd';
      input.selectionStart = input.selectionEnd = 2;

      emulateKeyInTextInput({ shift: true }, 'ArrowUp', input);
      emulateKeyInTextInput({ shift: true }, 'ArrowDown', input);

      expect(input.selectionStart).toBe(2, 'start');
      expect(input.selectionEnd).toBe(2, 'end');
      expect(input.selectionDirection).toEqual(
        jasmine.stringMatching(/none|forward/), 'direction',
      );
    });

    it('on arrow up then twice down key should select from cursor to end', () => {
      input.value = 'abcd';
      input.selectionStart = input.selectionEnd = 2;

      emulateKeyInTextInput({ shift: true }, 'ArrowUp', input);
      emulateKeyInTextInput({ shift: true }, 'ArrowDown', input);
      emulateKeyInTextInput({ shift: true }, 'ArrowDown', input);

      expect(input.selectionStart).toBe(2, 'start');
      expect(input.selectionEnd).toBe(4, 'end');
      expect(input.selectionDirection).toBe('forward', 'direction');
    });

    it('on arrow down then up key should remove selection', () => {
      input.value = 'abcd';
      input.selectionStart = input.selectionEnd = 2;

      emulateKeyInTextInput({ shift: true }, 'ArrowDown', input);
      emulateKeyInTextInput({ shift: true }, 'ArrowUp', input);

      expect(input.selectionStart).toBe(2, 'start');
      expect(input.selectionEnd).toBe(2, 'end');
      expect(input.selectionDirection).toEqual(
        jasmine.stringMatching(/none|forward/), 'direction',
      );
    });

    it('on arrow down then twice up key should select from start to cursor', () => {
      input.value = 'abcd';
      input.selectionStart = input.selectionEnd = 2;

      emulateKeyInTextInput({ shift: true }, 'ArrowDown', input);
      emulateKeyInTextInput({ shift: true }, 'ArrowUp', input);
      emulateKeyInTextInput({ shift: true }, 'ArrowUp', input);

      expect(input.selectionStart).toBe(0, 'start');
      expect(input.selectionEnd).toBe(2, 'end');
      expect(input.selectionDirection).toBe('backward', 'direction');
    });
  });

  describe('HTMLTextAreaElement', () => {
    let textarea: HTMLTextAreaElement;

    beforeEach(() => textarea = document.createElement('textarea'));

    it('should be a TextInput', () => {
      expect(isTextInput(textarea)).toBe(true);
    });

    // it('should append new line on "Enter"', () => {
    //   pending('enter not implemented yet');
    //   emulateKeyInTextInput({}, 'a', textarea);
    //   emulateKeyInTextInput({}, 'Enter', textarea);
    //   emulateKeyInTextInput({}, 'c', textarea);

    //   expect(textarea.value).toBe('a\nc');
    // });
  });

  describe('HTMLButtonElement', () => {
    it('should not be a TextInput', () => {
      expect(isTextInput(document.createElement('button'))).toBe(false);
    });
  });
});
