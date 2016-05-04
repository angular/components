import {
  it,
  describe,
  expect,
  beforeEach,
  inject,
} from '@angular/core/testing';
import {TestComponentBuilder} from '@angular/compiler/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdProgressFab} from './progress-fab';
import {MdProgressCircle} from '../progress-circle/progress-circle';

export function main() {
  describe('MdProgressFab', () => {
    let builder: TestComponentBuilder;

    beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
      builder = tcb;
    }));

    it('should correctly apply the color attribute on the progress circle', (done: () => void) => {
      return builder
        .createAsync(TestApp)
        .then((fixture) => {
          let testComponent = fixture.debugElement.componentInstance;
          let progressDebugElement = fixture.debugElement.query(By.css('md-progress-circle'));

          testComponent.progressColor = 'primary';
          fixture.detectChanges();

          expect(progressDebugElement.nativeElement.getAttribute('color')).toBe('primary');

          testComponent.progressColor = 'accent';
          fixture.detectChanges();

          expect(progressDebugElement.nativeElement.getAttribute('color')).toBe('accent');

          done();
      });
    });

    it('should correctly apply the mode on the progress circle', (done: () => void) => {
      return builder
        .createAsync(TestApp)
        .then((fixture) => {
          let testComponent = fixture.debugElement.componentInstance;
          let progressComponent: MdProgressCircle = fixture.debugElement
            .query(By.css('md-progress-circle')).componentInstance;

          testComponent.progressMode = 'determinate';
          fixture.detectChanges();

          expect(progressComponent.mode).toBe('determinate');

          testComponent.progressColor = 'indeterminate';
          fixture.detectChanges();

          expect(progressComponent.mode).toBe('determinate');

          done();
        });
    });

    it('should correctly apply the value on the progress circle', (done: () => void) => {
      return builder
        .createAsync(TestApp)
        .then((fixture) => {
          let testComponent = fixture.debugElement.componentInstance;
          let progressComponent: MdProgressCircle = fixture.debugElement
            .query(By.css('md-progress-circle')).componentInstance;

          testComponent.progressValue = 50;
          fixture.detectChanges();

          expect(progressComponent._value).toBe(50);

          testComponent.progressValue = 70;
          fixture.detectChanges();

          expect(progressComponent._value).toBe(70);

          done();
        });
    });

    it('should correctly apply the color on the button', (done: () => void) => {
      return builder
        .createAsync(TestApp)
        .then((fixture) => {
          let testComponent = fixture.debugElement.componentInstance;
          let buttonDebugElement = fixture.debugElement.query(By.css('button'));

          testComponent.buttonColor = 'primary';
          fixture.detectChanges();

          expect(buttonDebugElement.nativeElement.classList.contains('md-primary')).toBe(true);

          testComponent.buttonColor = 'accent';
          fixture.detectChanges();
          expect(buttonDebugElement.nativeElement.classList.contains('md-accent')).toBe(true);

          done();
        });
    });

  });
}

@Component({
  selector: 'test-app',
  template: `
  <button md-progress-fab [color]="buttonColor" [progressColor]="progressColor" 
          [mode]="progressMode" [value]="progressValue">
  </button>`,
  directives: [MdProgressFab]
})
class TestApp {
  buttonColor: string = 'primary';
  progressColor: string = 'accent';
  progressMode: string = 'indeterminate';
  progressValue: number = 0;
}
