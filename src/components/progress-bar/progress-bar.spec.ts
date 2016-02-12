import {beforeEach, ddescribe, expect, inject, it, TestComponentBuilder} from 'angular2/testing';
import {Component, DebugElement} from 'angular2/core';
import {By} from 'angular2/platform/browser'
import {MdProgressBar} from './progress-bar';


export function main() {
  describe('MdProgressCircular', () => {
    let builder:TestComponentBuilder;

    beforeEach(inject([TestComponentBuilder], (tcb:TestComponentBuilder) => {
      builder = tcb;
    }));

    it('should apply a mode of "determinate" if no mode is provided.', (done:() => void) => {
      builder
          .overrideTemplate(TestApp, '<md-progress-bar></md-progress-bar>')
          .createAsync(TestApp)
          .then((fixture) => {
            fixture.detectChanges();
            let progressElement = getChildDebugElement(fixture.debugElement, 'md-progress-bar');
            expect(progressElement.componentInstance.mode).toBe('determinate');
            done();
          });
    });

    it('should apply a mode of "determinate" if an invalid mode is provided.', (done:() => void) => {
      builder
          .overrideTemplate(TestApp, '<md-progress-bar mode="spinny"></md-progress-bar>')
          .createAsync(TestApp)
          .then((fixture) => {
            fixture.detectChanges();
            let progressElement = getChildDebugElement(fixture.debugElement, 'md-progress-bar');
            expect(progressElement.componentInstance.mode).toBe('determinate');
            done();
          });
    });

    it('should not modify the mode if a valid mode is provided.', (done:() => void) => {
      builder
          .overrideTemplate(TestApp, '<md-progress-bar mode="buffer"></md-progress-bar>')
          .createAsync(TestApp)
          .then((fixture) => {
            fixture.detectChanges();
            let progressElement = getChildDebugElement(fixture.debugElement, 'md-progress-bar');
            expect(progressElement.componentInstance.mode).toBe('buffer');
            done();
          });
    });

    it('should define a default value for the value and bufferValue attributes', (done:() => void) => {
      builder
          .overrideTemplate(TestApp, '<md-progress-bar></md-progress-bar>')
          .createAsync(TestApp)
          .then((fixture) => {
            fixture.detectChanges();
            let progressElement = getChildDebugElement(fixture.debugElement, 'md-progress-bar');
            expect(progressElement.componentInstance.value).toBe(0);
            expect(progressElement.componentInstance.bufferValue).toBe(0);
            done();
          });
    });

    it('should clamp value and bufferValue between 0 and 100', (done:() => void) => {
      builder
          .overrideTemplate(TestApp, '<md-progress-bar></md-progress-bar>')
          .createAsync(TestApp)
          .then((fixture) => {
            fixture.detectChanges();
            let progressElement = getChildDebugElement(fixture.debugElement, 'md-progress-bar');
            let progressComponent = progressElement.componentInstance;

            progressComponent.value = 50;
            expect(progressComponent.value).toBe(50);

            progressComponent.value = 999;
            expect(progressComponent.value).toBe(100);

            progressComponent.value = -10;
            expect(progressComponent.value).toBe(0);

            progressComponent.bufferValue = -29;
            expect(progressComponent.bufferValue).toBe(0);

            progressComponent.bufferValue = 9;
            expect(progressComponent.bufferValue).toBe(9);

            progressComponent.bufferValue = 1320;
            expect(progressComponent.bufferValue).toBe(100);
            done();
          });
    });

    it('should return the transform attribute based on the value, bufferValue and mode', (done:() => void) => {
      builder
          .overrideTemplate(TestApp, '<md-progress-bar></md-progress-bar>')
          .createAsync(TestApp)
          .then((fixture) => {
            fixture.detectChanges();
            let progressElement = getChildDebugElement(fixture.debugElement, 'md-progress-bar');
            let progressComponent = progressElement.componentInstance;

            expect(progressComponent.primaryTransform()).toBe('scaleX(0)');
            expect(progressComponent.bufferTransform()).toBe(undefined);

            progressComponent.value = 40;
            expect(progressComponent.primaryTransform()).toBe('scaleX(0.4)');
            expect(progressComponent.bufferTransform()).toBe(undefined);

            progressComponent.value = 35;
            progressComponent.bufferValue = 55;
            expect(progressComponent.primaryTransform()).toBe('scaleX(0.35)');
            expect(progressComponent.bufferTransform()).toBe(undefined);

            progressComponent.mode = 'buffer';
            expect(progressComponent.primaryTransform()).toBe('scaleX(0.35)');
            expect(progressComponent.bufferTransform()).toBe('scaleX(0.55)');


            progressComponent.value = 60;
            progressComponent.bufferValue = 60;
            expect(progressComponent.primaryTransform()).toBe('scaleX(0.6)');
            expect(progressComponent.bufferTransform()).toBe('scaleX(0.6)');
            done();
          });
    });
  });
}


/** Gets a child DebugElement by tag name. */
function getChildDebugElement(parent: DebugElement, selector: string): DebugElement {
  return parent.query(By.css(selector));
}



/** Test component that contains an MdButton. */
@Component({
  directives: [MdProgressBar],
  template: '',
})
class TestApp {}