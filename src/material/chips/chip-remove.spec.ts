import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MatChip, MatChipsModule} from './index';
import {dispatchFakeEvent, dispatchKeyboardEvent} from '@angular/cdk/testing';
import {ENTER} from '@angular/cdk/keycodes';

describe('Chip Remove', () => {
  let fixture: ComponentFixture<TestChip>;
  let testChip: TestChip;
  let chipDebugElement: DebugElement;
  let chipNativeElement: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatChipsModule],
      declarations: [
        TestChip
      ]
    });

    TestBed.compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TestChip);
    testChip = fixture.debugElement.componentInstance;
    fixture.detectChanges();

    chipDebugElement = fixture.debugElement.query(By.directive(MatChip));
    chipNativeElement = chipDebugElement.nativeElement;
  }));

  describe('basic behavior', () => {
    it('should applies the `mat-chip-remove` CSS class', () => {
      let buttonElement = chipNativeElement.querySelector('button')!;

      expect(buttonElement.classList).toContain('mat-chip-remove');
    });

    it('should emits (removed) on click', () => {
      let buttonElement = chipNativeElement.querySelector('button')!;

      testChip.removable = true;
      fixture.detectChanges();
      buttonElement.click();

      expect(testChip.didRemove).toHaveBeenCalled();
    });

    it('should become focusable when the chip is focused', () => {
      const removeElement = chipNativeElement.querySelector('a')!;

      expect(removeElement.getAttribute('tabindex')).toBe('-1');

      dispatchFakeEvent(chipNativeElement, 'focus');
      fixture.detectChanges();

      expect(removeElement.getAttribute('tabindex')).toBe('0');

      dispatchFakeEvent(chipNativeElement, 'blur');
      fixture.detectChanges();

      expect(removeElement.getAttribute('tabindex')).toBe('-1');
    });

    it('should not overwrite the tabindex if it was set by the consumer', () => {
      const removeElement = chipNativeElement.querySelector('a')!;

      fixture.componentInstance.chipRemoveTabindex = 3;
      fixture.detectChanges();

      expect(removeElement.getAttribute('tabindex')).toBe('3');

      dispatchFakeEvent(chipNativeElement, 'focus');
      fixture.detectChanges();

      expect(removeElement.getAttribute('tabindex')).toBe('3');
    });

    it('should remove the chip when pressing enter', () => {
      const hrefElement = chipNativeElement.querySelector('a')!;

      testChip.removable = true;
      fixture.detectChanges();

      const event = dispatchKeyboardEvent(hrefElement, 'keydown', ENTER);
      fixture.detectChanges();

      expect(testChip.didRemove).toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    });

    it('should not remove if parent chip is disabled', () => {
      let buttonElement = chipNativeElement.querySelector('button')!;

      testChip.disabled = true;
      testChip.removable = true;
      fixture.detectChanges();

      spyOn(testChip, 'didRemove');

      buttonElement.click();
      fixture.detectChanges();

      expect(testChip.didRemove).not.toHaveBeenCalled();
    });

  });
});

@Component({
  template: `
    <mat-chip
      [removable]="removable"
      [disabled]="disabled"
      (removed)="didRemove()"><button matChipRemove></button></mat-chip>
  `
})
class TestChip {
  chipRemoveTabindex: number;
  removable: boolean;
  disabled = false;
  didRemove = jasmine.createSpy('remove spy');
}
