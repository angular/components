import {
    it,
    iit,
    describe,
    beforeEach,
    beforeEachProviders,
    inject,
    async,
    fakeAsync,
    tick,
} from '@angular/core/testing';
import {TestComponentBuilder, ComponentFixture} from '@angular/compiler/testing';
import {Component, DebugElement, provide} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdSlider} from './slider';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {TestGestureConfig} from './test-gesture-config';

describe('MdSlider', () => {
  let builder: TestComponentBuilder;
  let gestureConfig: TestGestureConfig;

  beforeEachProviders(() => [
    provide(HAMMER_GESTURE_CONFIG, {useFactory: () => {
      gestureConfig = new TestGestureConfig();
      return gestureConfig;
    }})
  ]);

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    builder = tcb;
  }));

  describe('standard slider', () => {
    let fixture: ComponentFixture<StandardSlider>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MdSlider;
    let testComponent: StandardSlider;

    beforeEach(async(() => {
      builder.createAsync(StandardSlider).then(f => {
        fixture = f;
        fixture.detectChanges();

        testComponent = fixture.debugElement.componentInstance;

        sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
        sliderNativeElement = sliderDebugElement.nativeElement;
        sliderInstance = sliderDebugElement.injector.get(MdSlider);
      });
    }));

    it('should set the default values', () => {
      expect(sliderInstance.value).toBe(0);
      expect(sliderInstance.min).toBe(0);
      expect(sliderInstance.max).toBe(100);
    });

    it('should update the value on a click', () => {
      expect(sliderInstance.value).toBe(0);
      dispatchClickEvent(sliderNativeElement, 0.5);
      // 50% is the same as the value 50 in this case (0 -> 100, middle = 50).
      expect(sliderInstance.value).toBe(50);
    });

    it('should update the value on a drag', () => {
      expect(sliderInstance.value).toBe(0);
      dispatchDragEvent(sliderNativeElement, 0, 0.5, gestureConfig);
      expect(sliderInstance.value).toBe(50);
    });

    iit('should update the track fill on click', fakeAsync(() => {
      let trackFillDimensions =
          sliderNativeElement.querySelector('.md-slider-track-fill').getBoundingClientRect();
      let sliderDimensions =
          sliderNativeElement.querySelector('.md-slider-track').getBoundingClientRect();
      expect(trackFillDimensions.width).toBe(0);
      dispatchClickEvent(sliderNativeElement, 0.5);
      fixture.detectChanges();
      tick();
      tick();

      let test = sliderNativeElement.querySelector('.md-slider-track-fill');
      let testDimensions = test.getBoundingClientRect();

      console.log(testDimensions.width);
      expect(testDimensions.width).toBe(sliderDimensions.width * 0.5);
    }));
  });

  describe('min max disabled slider', () => {
    let fixture: ComponentFixture<MinMaxDisabledSlider>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MdSlider;
    let testComponent: MinMaxDisabledSlider;

    beforeEach(async(() => {
      builder.createAsync(MinMaxDisabledSlider).then(f => {
        fixture = f;
        fixture.detectChanges();

        testComponent = fixture.debugElement.componentInstance;

        sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
        sliderNativeElement = sliderDebugElement.nativeElement;
        sliderInstance = sliderDebugElement.injector.get(MdSlider);
      });
    }));

    it('should set the default values from the attributes', () => {
      expect(sliderInstance.value).toBe(5);
      expect(sliderInstance.min).toBe(5);
      expect(sliderInstance.max).toBe(15);
      expect(sliderInstance.disabled).toBeTruthy();
    });

    it('should not change the value on click when disabled', () => {
      expect(sliderInstance.value).toBe(5);
      dispatchClickEvent(sliderNativeElement, 0.5);
      expect(sliderInstance.value).toBe(5);
    });

    it('should not change the value on drag when disabled', () => {
      expect(sliderInstance.value).toBe(5);
      dispatchDragEvent(sliderNativeElement, 0, 0.5, gestureConfig);
      expect(sliderInstance.value).toBe(5);
    });
  });
});


@Component({
  directives: [[MdSlider]],
  template: `
  <md-slider></md-slider>
  `
})
class StandardSlider { }

@Component({
  directives: [[MdSlider]],
  template: `
  <md-slider min="5" max="15" disabled></md-slider>
  `
})
class MinMaxDisabledSlider { }

/**
 * Dispatches a click event from an element.
 * @param element The element from which the event will be dispatched.
 * @param percentage The percentage of the slider where the click should occur. Used to find the
 * physical location of the click.
 */
function dispatchClickEvent(element: HTMLElement, percentage: number): void {
  let dimensions = element.getBoundingClientRect();
  let width = dimensions.width;
  let left = dimensions.left;
  let y = dimensions.top;
  let x = left + (width * percentage);

  let event = new MouseEvent('click', {
    clientX: x,
    clientY: y
  });
  element.dispatchEvent(event);
}

/**
 * Dispatches a drag event from an element.
 * @param element The element from which the event will be dispatched.
 * @param startPercent The percentage of the slider where the drag will begin.
 * @param endPercent The percentage of the slider where the drag will end.
 * @param gestureConfig The gesture config for the test to handle emitting the drag events.
 */
function dispatchDragEvent(element: HTMLElement, startPercent: number, endPercent: number,
                           gestureConfig: TestGestureConfig): void {
  let dimensions = element.getBoundingClientRect();
  let width = dimensions.width;
  let left = dimensions.left;
  let startX = left + (width * startPercent);
  let endX = left + (width * endPercent);

  gestureConfig.emitEventForElement('dragstart', element, {
    // The actual event has a center with an x value that the drag listener is looking for.
    center: { x: startX },
    // The event needs a source event with a prevent default so we fake one.
    srcEvent: { preventDefault: jasmine.createSpy('preventDefault') }
  });
  gestureConfig.emitEventForElement('drag', element, {
    center: { x: endX },
    srcEvent: { preventDefault: jasmine.createSpy('preventDefault') }
  });
}
