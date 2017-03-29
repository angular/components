import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, ElementRef, Renderer} from '@angular/core';
import {MdThemeable} from './themeable';
import {By} from '@angular/platform-browser';

describe('MdThemeable', () => {

  let fixture: ComponentFixture<TestComponent>;
  let testComponent: TestComponent;
  let themeableElement: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, ThemeableComponent],
    });

    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    themeableElement = fixture.debugElement.query(By.css('themeable-test')).nativeElement;
  });

  it('should support a default component color', () => {
    expect(themeableElement.classList).toContain('mat-warn');
  });

  it('should update classes on color change', () => {
    expect(themeableElement.classList).toContain('mat-warn');

    testComponent.color = 'primary';
    fixture.detectChanges();

    expect(themeableElement.classList).toContain('mat-primary');
    expect(themeableElement.classList).not.toContain('mat-warn');

    testComponent.color = 'accent';
    fixture.detectChanges();

    expect(themeableElement.classList).toContain('mat-accent');
    expect(themeableElement.classList).not.toContain('mat-warn');
    expect(themeableElement.classList).not.toContain('mat-primary');

    testComponent.color = null;
    fixture.detectChanges();

    expect(themeableElement.classList).not.toContain('mat-accent');
    expect(themeableElement.classList).not.toContain('mat-warn');
    expect(themeableElement.classList).not.toContain('mat-primary');
  });

  it('should throw an error when using an invalid color', () => {
    testComponent.color = 'Invalid';

    expect(() => fixture.detectChanges()).toThrow();
  });

});

@Component({
  selector: 'themeable-test',
  template: '<span>Themeable</span>'
})
class ThemeableComponent extends MdThemeable {
  constructor(renderer: Renderer, elementRef: ElementRef) {
    super(renderer, elementRef);
  }
}

@Component({
  template: '<themeable-test [color]="color"></themeable-test>'
})
class TestComponent {
  color: string = 'warn';
}
