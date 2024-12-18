import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {CdkMenuModule} from './menu-module';
import {CdkMenuItemCheckbox} from './menu-item-checkbox';

describe('MenuItemCheckbox', () => {
  let fixture: ComponentFixture<SingleCheckboxButton>;
  let checkbox: CdkMenuItemCheckbox;
  let checkboxElement: HTMLButtonElement;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [CdkMenuModule, SingleCheckboxButton]});
    fixture = TestBed.createComponent(SingleCheckboxButton);
    fixture.detectChanges();

    checkbox = fixture.debugElement
      .query(By.directive(CdkMenuItemCheckbox))
      .injector.get(CdkMenuItemCheckbox);
    checkboxElement = fixture.debugElement.query(By.directive(CdkMenuItemCheckbox)).nativeElement;
  });

  it('should have the menuitemcheckbox role', () => {
    expect(checkboxElement.getAttribute('role')).toBe('menuitemcheckbox');
  });

  it('should set the aria disabled attribute', () => {
    expect(checkboxElement.getAttribute('aria-disabled')).toBeNull();

    checkbox.disabled = true;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(checkboxElement.getAttribute('aria-disabled')).toBe('true');
  });

  it('should not have a menu', () => {
    expect(checkbox.hasMenu).toBeFalse();
  });

  it('should toggle the aria checked attribute', () => {
    expect(checkboxElement.getAttribute('aria-checked')).toBe('false');

    checkboxElement.click();
    fixture.detectChanges();

    expect(checkboxElement.getAttribute('aria-checked')).toBe('true');
  });

  it('should toggle checked state', () => {
    expect(checkbox.checked).toBeFalse();

    checkbox.trigger();
    expect(checkbox.checked).toBeTrue();

    checkbox.trigger();
    expect(checkbox.checked).toBeFalse();
  });

  it('should not toggle checked state when disabled', () => {
    checkbox.disabled = true;
    checkbox.trigger();

    expect(checkbox.checked).toBeFalse();
  });

  it('should emit on clicked emitter when triggered', () => {
    const spy = jasmine.createSpy('cdkMenuItemCheckbox clicked spy');
    checkbox.triggered.subscribe(spy);

    checkbox.trigger();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should not emit on clicked emitter when disabled', () => {
    const spy = jasmine.createSpy('cdkMenuItemCheckbox clicked spy');
    checkbox.triggered.subscribe(spy);
    checkbox.disabled = true;

    checkbox.trigger();

    expect(spy).not.toHaveBeenCalled();
  });
});

@Component({
  template: `
    <div cdkMenu>
      <button cdkMenuItemCheckbox>Click me!</button>
    </div>
  `,
  imports: [CdkMenuModule],
})
class SingleCheckboxButton {}
