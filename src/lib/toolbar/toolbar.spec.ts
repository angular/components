import {Component} from '@angular/core';
import {TestBed, async} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MatToolbarModule} from './toolbar';


describe('MatToolbar', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatToolbarModule.forRoot()],
      declarations: [TestApp],
    });

    TestBed.compileComponents();
  }));

  it('should apply class based on color attribute', () => {
    let fixture = TestBed.createComponent(TestApp);
    let testComponent = fixture.debugElement.componentInstance;
    let toolbarElement = fixture.debugElement.query(By.css('mat-toolbar')).nativeElement;

    testComponent.toolbarColor = 'primary';
    fixture.detectChanges();

    expect(toolbarElement.classList.contains('mat-primary')).toBe(true);

    testComponent.toolbarColor = 'accent';
    fixture.detectChanges();

    expect(toolbarElement.classList.contains('mat-primary')).toBe(false);
    expect(toolbarElement.classList.contains('mat-accent')).toBe(true);

    testComponent.toolbarColor = 'warn';
    fixture.detectChanges();

    expect(toolbarElement.classList.contains('mat-accent')).toBe(false);
    expect(toolbarElement.classList.contains('mat-warn')).toBe(true);
  });
});


@Component({template: `<mat-toolbar [color]="toolbarColor">Test Toolbar</mat-toolbar>`})
class TestApp {
  toolbarColor: string;
}
