import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {CdkMenuModule} from './menu-module';
import {CdkMenuItemRadio} from './menu-item-radio';

describe('MenuItemRadio', () => {
  let fixture: ComponentFixture<SimpleRadioButton>;
  let radioButton: CdkMenuItemRadio;
  let radioElement: HTMLButtonElement;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [CdkMenuModule, SimpleRadioButton]});
    fixture = TestBed.createComponent(SimpleRadioButton);
    fixture.detectChanges();

    radioButton = fixture.debugElement
      .query(By.directive(CdkMenuItemRadio))
      .injector.get(CdkMenuItemRadio);
    radioElement = fixture.debugElement.query(By.directive(CdkMenuItemRadio)).nativeElement;
  });

  it('should have the menuitemradio role', () => {
    expect(radioElement.getAttribute('role')).toBe('menuitemradio');
  });

  it('should set the aria disabled attribute', () => {
    expect(radioElement.getAttribute('aria-disabled')).toBeNull();

    radioButton.disabled = true;
    fixture.componentRef.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(radioElement.getAttribute('aria-disabled')).toBe('true');
  });

  it('should toggle the aria checked attribute', () => {
    expect(radioElement.getAttribute('aria-checked')).toBe('false');

    radioElement.click();
    fixture.detectChanges();

    expect(radioElement.getAttribute('aria-checked')).toBe('true');
  });

  it('should not have a menu', () => {
    expect(radioButton.hasMenu).toBeFalse();
  });

  it('should not toggle checked state when disabled', () => {
    radioButton.disabled = true;
    radioButton.trigger();

    expect(radioButton.checked).toBeFalse();
  });

  it('should emit on clicked emitter when triggered', () => {
    const spy = jasmine.createSpy('cdkMenuItemRadio clicked spy');
    radioButton.triggered.subscribe(spy);

    radioButton.trigger();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should not emit on clicked emitter when disabled', () => {
    const spy = jasmine.createSpy('cdkMenuItemRadio clicked spy');
    radioButton.triggered.subscribe(spy);
    radioButton.disabled = true;

    radioButton.trigger();

    expect(spy).not.toHaveBeenCalled();
  });
});

@Component({
  template: `
    <div cdkMenu>
      <button cdkMenuItemRadio>Click me!</button>
    </div>
  `,
  imports: [CdkMenuModule],
})
class SimpleRadioButton {}
