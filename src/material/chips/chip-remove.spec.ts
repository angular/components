import {ENTER, SPACE} from '@angular/cdk/keycodes';
import {dispatchKeyboardEvent, dispatchMouseEvent} from '@angular/cdk/testing/private';
import {Component, ChangeDetectionStrategy} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MatChip, MatChipsModule} from './index';

describe('Chip Remove', () => {
  let fixture: ComponentFixture<TestChip>;
  let testChip: TestChip;
  let chipNativeElement: HTMLElement;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(TestChip);
    testChip = fixture.debugElement.componentInstance;
    fixture.detectChanges();

    const chipDebugElement = fixture.debugElement.query(By.directive(MatChip))!;
    chipNativeElement = chipDebugElement.nativeElement;
  }));

  describe('basic behavior', () => {
    it('should apply a CSS class to the remove icon', () => {
      const buttonElement = chipNativeElement.querySelector('.mdc-evolution-chip__icon--trailing')!;
      expect(buttonElement.classList).toContain('mat-mdc-chip-remove');
    });

    it('should ensure that the button cannot submit its parent form', () => {
      const buttonElement = chipNativeElement.querySelector('button')!;
      expect(buttonElement.getAttribute('type')).toBe('button');
    });

    it('should not set the `type` attribute on non-button elements', () => {
      const buttonElement = chipNativeElement.querySelector('span.mat-mdc-chip-remove')!;
      expect(buttonElement.hasAttribute('type')).toBe(false);
    });

    it('should emit (removed) event when exit animation is complete', () => {
      testChip.removable = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      chipNativeElement.querySelector('button')!.click();
      fixture.detectChanges();

      expect(testChip.didRemove).toHaveBeenCalled();
    });

    it('should not make the element aria-hidden when it is focusable', () => {
      const buttonElement = chipNativeElement.querySelector('button')!;

      expect(buttonElement.getAttribute('tabindex')).toBe('-1');
      expect(buttonElement.hasAttribute('aria-hidden')).toBe(false);
    });

    it('should prevent the default SPACE action', () => {
      const buttonElement = chipNativeElement.querySelector('button')!;

      testChip.removable = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      const event = dispatchKeyboardEvent(buttonElement, 'keydown', SPACE);
      fixture.detectChanges();

      expect(event.defaultPrevented).toBe(true);
    });

    it('should prevent the default ENTER action', () => {
      const buttonElement = chipNativeElement.querySelector('button')!;

      testChip.removable = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      const event = dispatchKeyboardEvent(buttonElement, 'keydown', ENTER);
      fixture.detectChanges();

      expect(event.defaultPrevented).toBe(true);
    });

    it('should have a focus indicator', () => {
      const buttonElement = chipNativeElement.querySelector('.mdc-evolution-chip__icon--trailing')!;
      expect(buttonElement.classList.contains('mat-focus-indicator')).toBe(true);
    });

    it('should prevent the default click action', () => {
      const buttonElement = chipNativeElement.querySelector('button')!;
      const event = dispatchMouseEvent(buttonElement, 'click');
      fixture.detectChanges();

      expect(event.defaultPrevented).toBe(true);
    });
  });
});

@Component({
  template: `
    <mat-chip-set>
      <mat-chip
        [removable]="removable"
        [disabled]="disabled"
        (removed)="didRemove()">
        <button matChipRemove></button>
        <span matChipRemove></span>
      </mat-chip>
    </mat-chip-set>
  `,
  imports: [MatChipsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class TestChip {
  removable = false;
  disabled = false;
  didRemove = jasmine.createSpy('didRemove spy');
}
