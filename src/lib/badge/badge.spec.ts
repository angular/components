import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MatBadge, MatBadgeModule} from './index';

fdescribe('MatBadge', () => {
  let fixture: ComponentFixture<any>;
  let testComponent: TestApp;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatBadgeModule],
      declarations: [TestApp],
    });

    TestBed.compileComponents();
    fixture = TestBed.createComponent(TestApp);
    testComponent = fixture.debugElement.componentInstance;
    fixture.detectChanges();
  });

  describe('MatBadge Text', () => {
    let badgeDebugElement: DebugElement;

    beforeEach(() => {
      badgeDebugElement = fixture.debugElement.query(By.directive(MatBadge));
      fixture.detectChanges();
    });

    it('should update the badge based on attribute', () => {
      let badgeContentDebugElement =
          badgeDebugElement.nativeElement.querySelector('.mat-badge-content');

      expect(badgeContentDebugElement.innerHTML).toContain('1');

      testComponent.badgeContent = '22';
      fixture.detectChanges();

      badgeContentDebugElement =
          badgeDebugElement.nativeElement.querySelector('.mat-badge-content');
      expect(badgeContentDebugElement.innerHTML).toContain('22');
    });

    it('should apply class based on color attribute', () => {
      testComponent.badgeColor = 'primary';
      fixture.detectChanges();
      expect(badgeDebugElement.nativeElement.classList.contains('mat-badge-primary')).toBe(true);

      testComponent.badgeColor = 'accent';
      fixture.detectChanges();
      expect(badgeDebugElement.nativeElement.classList.contains('mat-badge-accent')).toBe(true);

      testComponent.badgeColor = 'warn';
      fixture.detectChanges();
      expect(badgeDebugElement.nativeElement.classList.contains('mat-badge-warn')).toBe(true);

      testComponent.badgeColor = null;
      fixture.detectChanges();

      expect(badgeDebugElement.nativeElement.classList).not.toContain('mat-badge-accent');
    });

    it('should update the badget position on direction change', () => {
      expect(badgeDebugElement.nativeElement.classList.contains('mat-badge-above')).toBe(true);
      expect(badgeDebugElement.nativeElement.classList.contains('mat-badge-after')).toBe(true);

      testComponent.badgeDirection = 'below before';
      fixture.detectChanges();

      expect(badgeDebugElement.nativeElement.classList.contains('mat-badge-below')).toBe(true);
      expect(badgeDebugElement.nativeElement.classList.contains('mat-badge-before')).toBe(true);
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
class TestApp {
  badgeColor;
  badgeContent = '1';
  badgeDirection = 'above after';
}
