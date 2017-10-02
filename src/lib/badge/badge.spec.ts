import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MatBadge,  MatBadgeModule} from './index';


fdescribe('MatBadge', () => {

  let fixture: ComponentFixture<any>;
  let badgeDebugElement: DebugElement;
  let badgeContentDebugElement: DebugElement;
  let testComponent: TestApp;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatBadgeModule],
      declarations: [TestApp]
    });

    TestBed.compileComponents();

    fixture = TestBed.createComponent(TestApp);
    testComponent = fixture.debugElement.componentInstance;
    badgeDebugElement = fixture.debugElement.query(By.directive(MatBadge));
    badgeContentDebugElement = fixture.debugElement.query(By.css('.mat-badge-content'));
    fixture.detectChanges();
  }));

  it('should update the badge based on content attribute', () => {
    expect(badgeContentDebugElement.nativeElement.innerHTML).toContain('1');

    testComponent.badgeContent = '22';
    fixture.detectChanges();
    expect(badgeContentDebugElement.nativeElement.innerHTML).toContain('22');
  });

  it('should apply class based on color attribute', () => {
    testComponent.badgeColor = 'primary';
    fixture.detectChanges();
    expect(badgeDebugElement.nativeElement.classList.contains('mat-primary')).toBe(true);

    testComponent.badgeColor = 'accent';
    fixture.detectChanges();
    expect(badgeDebugElement.nativeElement.classList.contains('mat-accent')).toBe(true);

    testComponent.badgeColor = 'warn';
    fixture.detectChanges();
    expect(badgeDebugElement.nativeElement.classList.contains('mat-warn')).toBe(true);

    testComponent.badgeColor = null;
    fixture.detectChanges();

    expect(badgeDebugElement.nativeElement.classList).not.toContain('mat-accent');
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

/** Test component that contains an MatBadge. */
@Component({
  selector: 'test-app',
  template: `
    <mat-badge [content]="badgeContent" [color]="badgeColor" [direction]="badgeDirection">
      <mat-icon>home</mat-icon>
    </mat-badge>
  `
})
class TestApp {
  badgeColor;
  badgeContent = '1';
  badgeDirection = 'above after';
}
