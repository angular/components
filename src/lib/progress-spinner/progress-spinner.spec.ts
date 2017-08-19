import {TestBed, async} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MatProgressSpinnerModule} from './index';


describe('MatProgressSpinner', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatProgressSpinnerModule],
      declarations: [
        BasicProgressSpinner,
        IndeterminateProgressSpinner,
        ProgressSpinnerWithValueAndBoundMode,
        ProgressSpinnerWithColor,
        ProgressSpinnerCustomStrokeWidth,
        SpinnerWithColor,
      ],
    }).compileComponents();
  }));

  it('should apply a mode of "determinate" if no mode is provided.', () => {
    let fixture = TestBed.createComponent(BasicProgressSpinner);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('mat-progress-spinner'));
    expect(progressElement.componentInstance.mode).toBe('determinate');
  });

  it('should not modify the mode if a valid mode is provided.', () => {
    let fixture = TestBed.createComponent(IndeterminateProgressSpinner);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('mat-progress-spinner'));
    expect(progressElement.componentInstance.mode).toBe('indeterminate');
  });

  it('should define a default value of undefined for the value attribute', () => {
    let fixture = TestBed.createComponent(BasicProgressSpinner);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('mat-progress-spinner'));
    expect(progressElement.componentInstance.value).toBeUndefined();
  });

  it('should set the value to 0 when the mode is set to indeterminate', () => {
    let fixture = TestBed.createComponent(ProgressSpinnerWithValueAndBoundMode);
    let progressElement = fixture.debugElement.query(By.css('mat-progress-spinner'));
    fixture.componentInstance.mode = 'determinate';
    fixture.detectChanges();

    expect(progressElement.componentInstance.value).toBe(50);
    fixture.componentInstance.mode = 'indeterminate';
    fixture.detectChanges();
    expect(progressElement.componentInstance.value).toBe(0);
  });

  it('should clamp the value of the progress between 0 and 100', () => {
    let fixture = TestBed.createComponent(BasicProgressSpinner);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('mat-progress-spinner'));
    let progressComponent = progressElement.componentInstance;

    progressComponent.value = 50;
    expect(progressComponent.value).toBe(50);

    progressComponent.value = 0;
    expect(progressComponent.value).toBe(0);

    progressComponent.value = 100;
    expect(progressComponent.value).toBe(100);

    progressComponent.value = 999;
    expect(progressComponent.value).toBe(100);

    progressComponent.value = -10;
    expect(progressComponent.value).toBe(0);
  });

  it('should allow a custom stroke width', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerCustomStrokeWidth);
    const circleElement = fixture.nativeElement.querySelector('circle');

    fixture.componentInstance.strokeWidth = 40;
    fixture.detectChanges();

    expect(parseInt(circleElement.style.strokeWidth))
      .toBe(40, 'Expected the custom stroke width to be applied to the circle element.');
  });

  it('should expand the host element if the stroke width is greater than the default', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerCustomStrokeWidth);
    const element = fixture.debugElement.nativeElement.querySelector('.mat-progress-spinner');

    fixture.componentInstance.strokeWidth = 40;
    fixture.detectChanges();

    expect(element.style.width).toBe('130px');
    expect(element.style.height).toBe('130px');
  });

  it('should not collapse the host element if the stroke width is less than the default', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerCustomStrokeWidth);
    const element = fixture.debugElement.nativeElement.querySelector('.mat-progress-spinner');

    fixture.componentInstance.strokeWidth = 5;
    fixture.detectChanges();

    expect(element.style.width).toBe('100px');
    expect(element.style.height).toBe('100px');
  });

  it('should set the color class on the mat-spinner', () => {
    let fixture = TestBed.createComponent(SpinnerWithColor);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('mat-spinner'));

    expect(progressElement.nativeElement.classList).toContain('mat-primary');

    fixture.componentInstance.color = 'accent';
    fixture.detectChanges();

    expect(progressElement.nativeElement.classList).toContain('mat-accent');
    expect(progressElement.nativeElement.classList).not.toContain('mat-primary');
  });

  it('should set the color class on the mat-progress-spinner', () => {
    let fixture = TestBed.createComponent(ProgressSpinnerWithColor);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('mat-progress-spinner'));

    expect(progressElement.nativeElement.classList).toContain('mat-primary');

    fixture.componentInstance.color = 'accent';
    fixture.detectChanges();

    expect(progressElement.nativeElement.classList).toContain('mat-accent');
    expect(progressElement.nativeElement.classList).not.toContain('mat-primary');
  });

  it('should remove the underlying SVG element from the tab order explicitly', () => {
    const fixture = TestBed.createComponent(BasicProgressSpinner);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('svg').getAttribute('focusable')).toBe('false');
  });

});


@Component({template: '<mat-progress-spinner></mat-progress-spinner>'})
class BasicProgressSpinner {}

@Component({template: '<mat-progress-spinner [strokeWidth]="strokeWidth"></mat-progress-spinner>'})
class ProgressSpinnerCustomStrokeWidth {
  strokeWidth: number;
}

@Component({template: '<mat-progress-spinner mode="indeterminate"></mat-progress-spinner>'})
class IndeterminateProgressSpinner { }

@Component({template: '<mat-progress-spinner value="50" [mode]="mode"></mat-progress-spinner>'})
class ProgressSpinnerWithValueAndBoundMode { mode = 'indeterminate'; }

@Component({template: `<mat-spinner [color]="color"></mat-spinner>`})
class SpinnerWithColor { color: string = 'primary'; }

@Component({template: `<mat-progress-spinner value="50" [color]="color"></mat-progress-spinner>`})
class ProgressSpinnerWithColor { color: string = 'primary'; }
