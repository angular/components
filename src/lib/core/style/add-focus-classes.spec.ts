import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {StyleModule} from './index';
import {By} from '@angular/platform-browser';


describe('MdSlider', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [StyleModule],
      declarations: [
        ButtonWithFocusClasses,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('cdkAddFocusClasses', () => {
    let fixture: ComponentFixture<ButtonWithFocusClasses>;
    let buttonElement: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(ButtonWithFocusClasses);
      fixture.detectChanges();

      buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;
    });

    it('should initially not be focused', () => {
      expect(buttonElement.classList.length).toBe(0, 'button should not have focus classes');
    });

    it('should detect focus via keyboard', async(() => {
      // Simulate focus via keyboard.
      dispatchKeydownEvent(document, 9 /* tab */);
      buttonElement.focus();
      fixture.detectChanges();

      setTimeout(() => {
        fixture.detectChanges();

        expect(buttonElement.classList.length)
            .toBe(2, 'button should have exactly 2 focus classes');
        expect(buttonElement.classList.contains('cdk-focused'))
            .toBe(true, 'button should have cdk-focused class');
        expect(buttonElement.classList.contains('cdk-keyboard-focused'))
            .toBe(true, 'button should have cdk-keyboard-focused class');
      }, 0);
    }));

    it('should detect focus via mouse', async(() => {
      // Simulate focus via mouse.
      dispatchMousedownEvent(document);
      buttonElement.focus();
      fixture.detectChanges();

      setTimeout(() => {
        fixture.detectChanges();

        expect(buttonElement.classList.length)
            .toBe(2, 'button should have exactly 2 focus classes');
        expect(buttonElement.classList.contains('cdk-focused'))
            .toBe(true, 'button should have cdk-focused class');
        expect(buttonElement.classList.contains('cdk-mouse-focused'))
            .toBe(true, 'button should have cdk-mouse-focused class');
      }, 0);
    }));

    it('should detect programmatic focus', async(() => {
      // Programmatically focus.
      buttonElement.focus();
      fixture.detectChanges();

      setTimeout(() => {
        fixture.detectChanges();

        expect(buttonElement.classList.length)
            .toBe(2, 'button should have exactly 2 focus classes');
        expect(buttonElement.classList.contains('cdk-focused'))
            .toBe(true, 'button should have cdk-focused class');
        expect(buttonElement.classList.contains('cdk-programmatically-focused'))
            .toBe(true, 'button should have cdk-programmatically-focused class');
      }, 0);
    }));
  });
});


@Component({template: `<button cdkAddFocusClasses>focus me!</button>`})
class ButtonWithFocusClasses {}


/** Dispatches a mousedown event on the specified element. */
function dispatchMousedownEvent(element: Node) {
  let event = document.createEvent('MouseEvent');
  event.initMouseEvent(
      'mousedown', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  element.dispatchEvent(event);
}


/** Dispatches a keydown event on the specified element. */
function dispatchKeydownEvent(element: Node, keyCode: number) {
  let event: any = document.createEvent('KeyboardEvent');
  (event.initKeyEvent || event.initKeyboardEvent).bind(event)(
      'keydown', true, true, window, 0, 0, 0, 0, 0, keyCode);
  Object.defineProperty(event, 'keyCode', {
    get: function() { return keyCode; }
  });
  element.dispatchEvent(event);
}
