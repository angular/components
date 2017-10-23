import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MatBadge, MatBadgeModule} from './index';

describe('MatBadge', () => {
  let fixture: ComponentFixture<any>;
  let testComponent: BadgeWithTextContent;
  let badgeNativeElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatBadgeModule],
      declarations: [BadgeWithTextContent],
    });

    TestBed.compileComponents();
    fixture = TestBed.createComponent(BadgeWithTextContent);
    testComponent = fixture.debugElement.componentInstance;
    fixture.detectChanges();
  });

  describe('MatBadge Text', () => {
    let badgeDebugElement: DebugElement;

    beforeEach(() => {
      badgeDebugElement = fixture.debugElement.query(By.directive(MatBadge));
      badgeNativeElement = badgeDebugElement.nativeElement;
      fixture.detectChanges();
    });

    it('should update the badge based on attribute', () => {
      let badgeContentDebugElement = badgeNativeElement.querySelector('.mat-badge-content');

      expect(badgeContentDebugElement.textContent).toContain('1');

      testComponent.badgeContent = '22';
      fixture.detectChanges();

      badgeContentDebugElement = badgeNativeElement.querySelector('.mat-badge-content');
      expect(badgeContentDebugElement.textContent).toContain('22');
    });

    it('should apply class based on color attribute', () => {
      testComponent.badgeColor = 'primary';
      fixture.detectChanges();
      expect(badgeNativeElement.classList.contains('mat-badge-primary')).toBe(true);

      testComponent.badgeColor = 'accent';
      fixture.detectChanges();
      expect(badgeNativeElement.classList.contains('mat-badge-accent')).toBe(true);

      testComponent.badgeColor = 'warn';
      fixture.detectChanges();
      expect(badgeNativeElement.classList.contains('mat-badge-warn')).toBe(true);

      testComponent.badgeColor = null;
      fixture.detectChanges();

      expect(badgeNativeElement.classList).not.toContain('mat-badge-accent');
    });

    it('should update the badget position on direction change', () => {
      expect(badgeNativeElement.classList.contains('mat-badge-above')).toBe(true);
      expect(badgeNativeElement.classList.contains('mat-badge-after')).toBe(true);

      testComponent.badgeDirection = 'below before';
      fixture.detectChanges();

      expect(badgeNativeElement.classList.contains('mat-badge-below')).toBe(true);
      expect(badgeNativeElement.classList.contains('mat-badge-before')).toBe(true);
    });
  });

});

/** Test component that contains an MatBadge. */
@Component({
  selector: 'test-app',
  template: `
    <span [matBadge]="badgeContent"
          [matBadgeColor]="badgeColor"
          [matBadgePosition]="badgeDirection">
      home
    </span>
  `
})
class BadgeWithTextContent {
  badgeColor;
  badgeContent = '1';
  badgeDirection = 'above after';
}
