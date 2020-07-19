import {typeInElement} from './type-in-element';

describe('type in elements', () => {
  describe('type in input', () => {
    it('should send keydown event', () => {
      // given
      const input = document.createElement('input');

      const keydownSpy = jasmine.createSpy();
      input.addEventListener('keydown', keydownSpy);

      // when
      typeInElement(input, 'a');

      // then
      expect(keydownSpy).toHaveBeenCalledTimes(1);
      expect(keydownSpy).toHaveBeenCalledWith(jasmine.objectContaining({ key: 'a' }));
    });

    it('should send keypress event', () => {
      // given
      const input = document.createElement('input');

      const keypressSpy = jasmine.createSpy();
      input.addEventListener('keypress', keypressSpy);

      // when
      typeInElement(input, 'a');

      // then
      expect(keypressSpy).toHaveBeenCalledTimes(1);
      expect(keypressSpy).toHaveBeenCalledWith(jasmine.objectContaining({ key: 'a' }));
    });

    it('should send keyup event', () => {
      // given
      const input = document.createElement('input');

      const keyupSpy = jasmine.createSpy();
      input.addEventListener('keyup', keyupSpy);

      // when
      typeInElement(input, 'a');

      // then
      expect(keyupSpy).toHaveBeenCalledTimes(1);
      expect(keyupSpy).toHaveBeenCalledWith(jasmine.objectContaining({ key: 'a' }));
    });

    it('should send input event', () => {
      // given
      const input = document.createElement('input');

      const inputEventSpy = jasmine.createSpy();
      input.addEventListener('input', inputEventSpy);

      // when
      typeInElement(input, 'a');

      // then
      expect(inputEventSpy).toHaveBeenCalledTimes(1);
    });

    it('should send events in order', () => {
      // given
      const input = document.createElement('input');

      const eventSpy = jasmine.createSpy();
      input.addEventListener('input', eventSpy);
      input.addEventListener('keydown', eventSpy);
      input.addEventListener('keyup', eventSpy);
      input.addEventListener('keypress', eventSpy);

      // when
      typeInElement(input, 'a');

      // then
      expect(eventSpy.calls.all().map((call: any) => call.args[0].type)).toEqual([
        'keydown', 'keypress', 'input', 'keyup',
      ]);
    });

    it('should change value of inputs', () => {
      // given
      const input = document.createElement('input');

      // when
      typeInElement(input, 'a');

      // then
      expect(input.value).toEqual('a');
    });

    it('should not execute default action if prevented', () => {
      // given
      const input = document.createElement('input');
      input.addEventListener('keypress', (event) => {
        event.preventDefault();
      });

      // when
      typeInElement(input, 'a');

      // then
      expect(input.value).toEqual('');
    });
  });
});
