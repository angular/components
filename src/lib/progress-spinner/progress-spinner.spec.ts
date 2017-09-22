import {TestBed, async} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdProgressSpinnerModule} from './index';


describe('MdProgressSpinner', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdProgressSpinnerModule],
      declarations: [
        BasicProgressSpinner,
        IndeterminateProgressSpinner,
        ProgressSpinnerWithValueAndBoundMode,
        ProgressSpinnerWithColor,
        ProgressSpinnerCustomStrokeWidth,
        ProgressSpinnerCustomDiameter,
        SpinnerWithColor,
      ],
    }).compileComponents();
  }));

  it('should apply a mode of "determinate" if no mode is provided.', () => {
    let fixture = TestBed.createComponent(BasicProgressSpinner);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('md-progress-spinner'));
    expect(progressElement.componentInstance.mode).toBe('determinate');
  });

  it('should not modify the mode if a valid mode is provided.', () => {
    let fixture = TestBed.createComponent(IndeterminateProgressSpinner);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('md-progress-spinner'));
    expect(progressElement.componentInstance.mode).toBe('indeterminate');
  });

  it('should define a default value of undefined for the value attribute', () => {
    let fixture = TestBed.createComponent(BasicProgressSpinner);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('md-progress-spinner'));
    expect(progressElement.componentInstance.value).toBeUndefined();
  });

  it('should set the value to 0 when the mode is set to indeterminate', () => {
    let fixture = TestBed.createComponent(ProgressSpinnerWithValueAndBoundMode);
    let progressElement = fixture.debugElement.query(By.css('md-progress-spinner'));
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

    let progressElement = fixture.debugElement.query(By.css('md-progress-spinner'));
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

  it('should allow a custom diameter', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerCustomDiameter);
    const spinner = fixture.debugElement.query(By.css('md-progress-spinner')).nativeElement;
    const svgElement = fixture.nativeElement.querySelector('svg');

    fixture.componentInstance.diameter = 32;
    fixture.detectChanges();

    expect(parseInt(spinner.style.width))
        .toBe(32, 'Expected the custom diameter to be applied to the host element width.');
    expect(parseInt(spinner.style.height))
        .toBe(32, 'Expected the custom diameter to be applied to the host element height.');
    expect(parseInt(svgElement.style.width))
        .toBe(32, 'Expected the custom diameter to be applied to the svg element width.');
    expect(parseInt(svgElement.style.height))
        .toBe(32, 'Expected the custom diameter to be applied to the svg element height.');
    expect(svgElement.getAttribute('viewBox'))
        .toBe('0 0 32 32', 'Expected the custom diameter to be applied to the svg viewBox.');
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

  it('should set the color class on the md-spinner', () => {
    let fixture = TestBed.createComponent(SpinnerWithColor);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('md-spinner'));

    expect(progressElement.nativeElement.classList).toContain('mat-primary');

    fixture.componentInstance.color = 'accent';
    fixture.detectChanges();

    expect(progressElement.nativeElement.classList).toContain('mat-accent');
    expect(progressElement.nativeElement.classList).not.toContain('mat-primary');
  });

  it('should set the color class on the md-progress-spinner', () => {
    let fixture = TestBed.createComponent(ProgressSpinnerWithColor);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('md-progress-spinner'));

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


@Component({template: '<md-progress-spinner></md-progress-spinner>'})
class BasicProgressSpinner {}

@Component({template: '<md-progress-spinner [strokeWidth]="strokeWidth"></md-progress-spinner>'})
class ProgressSpinnerCustomStrokeWidth {
  strokeWidth: number;
}

@Component({template: '<md-progress-spinner [diameter]="diameter"></md-progress-spinner>'})
class ProgressSpinnerCustomDiameter {
  diameter: number;
}

@Component({template: '<md-progress-spinner mode="indeterminate"></md-progress-spinner>'})
class IndeterminateProgressSpinner { }

@Component({template: '<md-progress-spinner value="50" [mode]="mode"></md-progress-spinner>'})
class ProgressSpinnerWithValueAndBoundMode { mode = 'indeterminate'; }

@Component({template: `<md-spinner [color]="color"></md-spinner>`})
class SpinnerWithColor { color: string = 'primary'; }

@Component({template: `<md-progress-spinner value="50" [color]="color"></md-progress-spinner>`})
class ProgressSpinnerWithColor { color: string = 'primary'; }
