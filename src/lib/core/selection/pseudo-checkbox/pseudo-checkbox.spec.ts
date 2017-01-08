import {
    async,
    ComponentFixture,
    TestBed,
} from '@angular/core/testing';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdSelectionModule} from '../index';
import {MdPseudoCheckbox} from './pseudo-checkbox';


describe('MdPseudoCheckbox', () => {
  let fixture: ComponentFixture<any>;
  let checkboxDebugElement: DebugElement;
  let checkboxNativeElement: HTMLElement;
  let checkboxInstance: MdPseudoCheckbox;
  let testComponent: SimplePseudoCheckbox;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdSelectionModule.forRoot()],
      declarations: [SimplePseudoCheckbox],
    });

    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(SimplePseudoCheckbox);
      fixture.detectChanges();

      checkboxDebugElement = fixture.debugElement.query(By.directive(MdPseudoCheckbox));
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      checkboxInstance = checkboxDebugElement.componentInstance;
      testComponent = fixture.debugElement.componentInstance;
    });
  }));

  it('should add and remove the checked state', () => {
    expect(checkboxInstance.checked).toBe(false);
    expect(checkboxNativeElement.classList).not.toContain('md-pseudo-checkbox-checked');

    testComponent.checked = true;
    fixture.detectChanges();

    expect(checkboxInstance.checked).toBe(true);
    expect(checkboxNativeElement.classList).toContain('md-pseudo-checkbox-checked');

    testComponent.checked = false;
    fixture.detectChanges();

    expect(checkboxInstance.checked).toBe(false);
    expect(checkboxNativeElement.classList).not.toContain('md-pseudo-checkbox-checked');
  });

  it('should add and remove indeterminate state', () => {
    expect(checkboxNativeElement.classList).not.toContain('md-pseudo-checkbox-checked');

    testComponent.indeterminate = true;
    fixture.detectChanges();

    expect(checkboxNativeElement.classList).toContain('md-pseudo-checkbox-indeterminate');

    testComponent.indeterminate = false;
    fixture.detectChanges();

    expect(checkboxNativeElement.classList).not.toContain('md-pseudo-checkbox-indeterminate');
  });

  it('should add and remove disabled state', () => {
    expect(checkboxInstance.disabled).toBe(false);
    expect(checkboxNativeElement.classList).not.toContain('md-pseudo-checkbox-disabled');

    testComponent.disabled = true;
    fixture.detectChanges();

    expect(checkboxInstance.disabled).toBe(true);
    expect(checkboxNativeElement.classList).toContain('md-pseudo-checkbox-disabled');

    testComponent.disabled = false;
    fixture.detectChanges();

    expect(checkboxInstance.disabled).toBe(false);
    expect(checkboxNativeElement.classList).not.toContain('md-pseudo-checkbox-disabled');
  });

  describe('transition classes', () => {
    it('should transition unchecked -> checked -> unchecked', () => {
      testComponent.checked = true;
      fixture.detectChanges();
      expect(checkboxNativeElement.classList).toContain(
          'md-pseudo-checkbox-anim-unchecked-checked');

      testComponent.checked = false;
      fixture.detectChanges();
      expect(checkboxNativeElement.classList).not.toContain(
          'md-pseudo-checkbox-anim-unchecked-checked');
      expect(checkboxNativeElement.classList).toContain(
          'md-pseudo-checkbox-anim-checked-unchecked');
    });

    it('should transition unchecked -> indeterminate -> unchecked', () => {
      testComponent.indeterminate = true;
      fixture.detectChanges();

      expect(checkboxNativeElement.classList)
          .toContain('md-pseudo-checkbox-anim-unchecked-indeterminate');

      testComponent.indeterminate = false;
      fixture.detectChanges();

      expect(checkboxNativeElement.classList)
          .not.toContain('md-pseudo-checkbox-anim-unchecked-indeterminate');
      expect(checkboxNativeElement.classList)
          .toContain('md-pseudo-checkbox-anim-indeterminate-unchecked');
    });

    it('should transition indeterminate -> checked', () => {
      testComponent.indeterminate = true;
      fixture.detectChanges();

      testComponent.checked = true;
      fixture.detectChanges();

      expect(checkboxNativeElement.classList).not.toContain(
          'md-pseudo-checkbox-anim-unchecked-indeterminate');
      expect(checkboxNativeElement.classList).toContain(
          'md-pseudo-checkbox-anim-indeterminate-checked');
    });

    it('should not apply transition classes when there is no state change', () => {
      testComponent.checked = checkboxInstance.checked;
      fixture.detectChanges();
      expect(checkboxNativeElement).not.toMatch(/^md-pseudo-checkbox-anim/g);

      testComponent.indeterminate = checkboxInstance.indeterminate;
      expect(checkboxNativeElement).not.toMatch(/^md-pseudo-checkbox-anim/g);
    });

    it('should not initially have any transition classes', () => {
      expect(checkboxNativeElement).not.toMatch(/^md-pseudo-checkbox-anim/g);
    });
  });

  describe('color behaviour', () => {
    it('should apply class based on color attribute', () => {
      testComponent.color = 'primary';
      fixture.detectChanges();
      expect(checkboxDebugElement.nativeElement.classList).toContain('md-primary');

      testComponent.color = 'accent';
      fixture.detectChanges();
      expect(checkboxDebugElement.nativeElement.classList).toContain('md-accent');
    });

    it('should should not clear previous defined classes', () => {
      checkboxDebugElement.nativeElement.classList.add('custom-class');

      testComponent.color = 'primary';
      fixture.detectChanges();

      expect(checkboxDebugElement.nativeElement.classList).toContain('md-primary');
      expect(checkboxDebugElement.nativeElement.classList).toContain('custom-class');

      testComponent.color = 'accent';
      fixture.detectChanges();

      expect(checkboxDebugElement.nativeElement.classList).not.toContain('md-primary');
      expect(checkboxDebugElement.nativeElement.classList).toContain('md-accent');
      expect(checkboxDebugElement.nativeElement.classList).toContain('custom-class');

    });
  });

});


@Component({
  template: `
    <md-pseudo-checkbox
      [checked]="checked"
      [indeterminate]="indeterminate"
      [disabled]="disabled"
      [color]="color"></md-pseudo-checkbox>
  `
})
export class SimplePseudoCheckbox {
  checked = false;
  indeterminate = false;
  disabled = false;
  color = 'accent';
}
