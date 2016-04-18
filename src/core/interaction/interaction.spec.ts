import {
  it,
  describe,
  expect,
  beforeEach,
  inject,
  beforeEachProviders,
} from 'angular2/testing';
import {MdInteraction, MdInteractionType} from './interaction';

export function main() {
  describe('MdInteraction', () => {
    let interaction: MdInteraction;

    beforeEachProviders(() => [MdInteraction]);

    beforeEach(inject([MdInteraction], (_interaction: MdInteraction) => {
      interaction = _interaction;
    }));

    it('should correctly detect the keyboard interaction', () => {

      let event = <KeyboardEvent> document.createEvent('Event');

      event.keyCode = 37;
      event.initEvent('keydown', false, true);

      document.body.dispatchEvent(event);

      expect(interaction.getLastInteractionType()).toBe(MdInteractionType.KEYBOARD);
    });

    it('should correctly detect the mouse interaction', () => {
      let eventType = 'PointerEvent' in window ? 'pointerdown' : 'mousedown';
      let event = document.createEvent('MouseEvent');

      event.initMouseEvent(eventType, true, true, window, null, 0, 0, 0, 0,
        false, false, false, false, 0, null);

      if (eventType === 'pointerdown') {
        // https://msdn.microsoft.com/library/windows/apps/hh466130.aspx
        (<PointerEvent> event).pointerType = 4;
      }

      document.body.dispatchEvent(event);

      expect(interaction.getLastInteractionType()).toBe(MdInteractionType.MOUSE);
    });

  });
}
