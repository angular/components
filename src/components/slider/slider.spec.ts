import {
    it,
    describe,
    beforeEach,
    beforeEachProviders,
    inject,
    async,
} from '@angular/core/testing';
import {TestComponentBuilder, ComponentFixture} from '@angular/compiler/testing';
import {Component, DebugElement, provide, ViewEncapsulation} from '@angular/core';
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
      // 50% is the same as the value 50 in this case.
      expect(sliderInstance.value).toBe(50);
    });

    it('should update the value on a drag', () => {
      expect(sliderInstance.value).toBe(0);
      dispatchDragEvent(sliderNativeElement, 0, 0.5, gestureConfig);
      expect(sliderInstance.value).toBe(50);
    });

    it('should set the value as min when dragging before the track', () => {
      expect(sliderInstance.value).toBe(0);
      dispatchDragEvent(sliderNativeElement, 0, -1.5, gestureConfig);
      expect(sliderInstance.value).toBe(0);
    });

    it('should set the value as max when dragging past the track', () => {
      expect(sliderInstance.value).toBe(0);
      dispatchDragEvent(sliderNativeElement, 0, 1.5, gestureConfig);
      expect(sliderInstance.value).toBe(100);
    });

    it('should update the track fill on click', () => {
      let trackFillElement = sliderNativeElement.querySelector('.md-slider-track-fill');
      let trackFillDimensions = trackFillElement.getBoundingClientRect();
      let sliderDimensions =
          sliderNativeElement.querySelector('.md-slider-track').getBoundingClientRect();

      expect(trackFillDimensions.width).toBe(0);
      dispatchClickEvent(sliderNativeElement, 0.5);

      trackFillDimensions = trackFillElement.getBoundingClientRect();
      expect(trackFillDimensions.width).toBe(sliderDimensions.width * 0.5);
    });

    it('should update the thumb position on click', () => {
      let thumbElement = sliderNativeElement.querySelector('.md-slider-thumb-position');
      let thumbDimensions = thumbElement.getBoundingClientRect();
      let thumbWidth =
          sliderNativeElement.querySelector('.md-slider-thumb').getBoundingClientRect().width;
      let sliderDimensions =
          sliderNativeElement.querySelector('.md-slider-track').getBoundingClientRect();

      expect(thumbDimensions.left).toBe(sliderDimensions.left - (thumbWidth / 2));
      dispatchClickEvent(sliderNativeElement, 0.5);

      thumbDimensions = thumbElement.getBoundingClientRect();
      // The thumb's offset is expected to be equal to the slider's offset + half the slider's width
      // (from the click event) - half the thumb width (to center the thumb).
      let offset = sliderDimensions.left + (sliderDimensions.width * 0.5) - (thumbWidth / 2);
      expect(thumbDimensions.left).toBe(offset);
    });

    it('should add the md-slider-active class on click', () => {
      let containerElement = sliderNativeElement.querySelector('.md-slider-container');
      expect(containerElement.classList).not.toContain('md-slider-active');

      dispatchClickEvent(sliderNativeElement, 0.5);
      fixture.detectChanges();

      expect(containerElement.classList).toContain('md-slider-active');
    });

    it('should remove the md-slider-active class on blur', () => {
      let containerElement = sliderNativeElement.querySelector('.md-slider-container');

      dispatchClickEvent(sliderNativeElement, 0.5);
      fixture.detectChanges();

      expect(containerElement.classList).toContain('md-slider-active');

      // The test won't activate the onBlur function. Tried clicking/focusing the body and neither
      // worked. Should update this if a way is ever found.
      sliderInstance.onBlur();
      fixture.detectChanges();

      expect(containerElement.classList).not.toContain('md-slider-active');
    });

    it('should add and remove the md-slider-dragging class when dragging', () => {
      let containerElement = sliderNativeElement.querySelector('.md-slider-container');
      let classes = containerElement.classList;
      expect(classes).not.toContain('md-slider-dragging');

      dispatchDragStartEvent(sliderNativeElement, 0, gestureConfig);
      fixture.detectChanges();

      expect(containerElement.classList).toContain('md-slider-dragging');

      dispatchDragEndEvent(sliderNativeElement, 0.5, gestureConfig);
      fixture.detectChanges();

      expect(containerElement.classList).not.toContain('md-slider-dragging');
    });
  });

  describe('disabled slider', () => {
    let fixture: ComponentFixture<DisabledSlider>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MdSlider;
    let testComponent: DisabledSlider;

    beforeEach(async(() => {
      builder.createAsync(DisabledSlider).then(f => {
        fixture = f;
        fixture.detectChanges();

        testComponent = fixture.debugElement.componentInstance;

        sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
        sliderNativeElement = sliderDebugElement.nativeElement;
        sliderInstance = sliderDebugElement.injector.get(MdSlider);
      });
    }));

    it('should be disabled', () => {
      expect(sliderInstance.disabled).toBeTruthy();
    });

    it('should not change the value on click when disabled', () => {
      expect(sliderInstance.value).toBe(0);
      dispatchClickEvent(sliderNativeElement, 0.5);
      expect(sliderInstance.value).toBe(0);
    });

    it('should not change the value on drag when disabled', () => {
      expect(sliderInstance.value).toBe(0);
      dispatchDragEvent(sliderNativeElement, 0, 0.5, gestureConfig);
      expect(sliderInstance.value).toBe(0);
    });

    it('should not add the md-slider-active class on click when disabled', () => {
      let containerElement = sliderNativeElement.querySelector('.md-slider-container');
      expect(containerElement.classList).not.toContain('md-slider-active');

      dispatchClickEvent(sliderNativeElement, 0.5);
      fixture.detectChanges();

      expect(containerElement.classList).not.toContain('md-slider-active');
    });

    it('should not add the md-slider-dragging class on drag when disabled', () => {
      let containerElement = sliderNativeElement.querySelector('.md-slider-container');
      expect(containerElement.classList).not.toContain('md-slider-dragging');

      dispatchDragStartEvent(sliderNativeElement, 0.5, gestureConfig);
      fixture.detectChanges();

      expect(containerElement.classList).not.toContain('md-slider-dragging');
    });
  });

  describe('slider with set min and max', () => {
    let fixture: ComponentFixture<SliderWithMinAndMax>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MdSlider;
    let testComponent: SliderWithMinAndMax;

    beforeEach(async(() => {
      builder.createAsync(SliderWithMinAndMax).then(f => {
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
    });

    it('should set the correct value on click', () => {
      dispatchClickEvent(sliderNativeElement, 0.5);
      // 50% of the slider would be 10 given a min of 5 and a max of 15. (5 + 15) / 2 = 10
      expect(sliderInstance.value).toBe(10);
    });

    it('should set the correct value on drag', () => {
      dispatchDragEvent(sliderNativeElement, 0, 0.5, gestureConfig);
      expect(sliderInstance.value).toBe(10);
    });
  });

  describe('slider with set value', () => {
    let fixture: ComponentFixture<SliderWithValue>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MdSlider;
    let testComponent: SliderWithValue;

    beforeEach(async(() => {
      builder.createAsync(SliderWithValue).then(f => {
        fixture = f;
        fixture.detectChanges();

        testComponent = fixture.debugElement.componentInstance;

        sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
        sliderNativeElement = sliderDebugElement.nativeElement;
        sliderInstance = sliderDebugElement.injector.get(MdSlider);
      });
    }));

    it('should set the default value from the attribute', () => {
      expect(sliderInstance.value).toBe(26);
    });

    it('should set the correct value on click', () => {
      dispatchClickEvent(sliderNativeElement, 0.5);
      // It should still be 50 regardless of what the original value was.
      expect(sliderInstance.value).toBe(50);
    });

    it('should set the correct value on drag', () => {
      dispatchDragEvent(sliderNativeElement, 0, 0.5, gestureConfig);
      expect(sliderInstance.value).toBe(50);
    });
  });
});

// The transition has to be removed in order to test the updated positions without setTimeout.
@Component({
  directives: [[MdSlider]],
  template: `
  <md-slider></md-slider>
  `,
  styles: [`
  .md-slider-track-fill, .md-slider-thumb-position {
    transition: none !important;
   }
  `],
  encapsulation: ViewEncapsulation.None
})
class StandardSlider { }

@Component({
  directives: [[MdSlider]],
  template: `
  <md-slider disabled></md-slider>
  `
})
class DisabledSlider { }

@Component({
  directives: [[MdSlider]],
  template: `
  <md-slider min="5" max="15"></md-slider>
  `
})
class SliderWithMinAndMax { }

@Component({
  directives: [[MdSlider]],
  template: `
  <md-slider value="26"></md-slider>
  `
})
class SliderWithValue { }

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

  let event = document.createEvent('MouseEvent');
  event.initMouseEvent(
      'click', true, true, window, 0, x, y, x, y, false, false, false, false, 0, null);
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

/**
 * Dispatches a dragstart event from an element.
 * @param element The element from which the event will be dispatched.
 * @param startPercent The percentage of the slider where the drag will begin.
 * @param gestureConfig The gesture config for the test to handle emitting the drag events.
 */
function dispatchDragStartEvent(element: HTMLElement, startPercent: number,
                                gestureConfig: TestGestureConfig): void {
  let dimensions = element.getBoundingClientRect();
  let width = dimensions.width;
  let left = dimensions.left;
  let x = left + (width * startPercent);

  gestureConfig.emitEventForElement('dragstart', element, {
    center: { x: x },
    srcEvent: { preventDefault: jasmine.createSpy('preventDefault') }
  });
}

/**
 * Dispatches a dragend event from an element.
 * @param element The element from which the event will be dispatched.
 * @param endPercent The percentage of the slider where the drag will end.
 * @param gestureConfig The gesture config for the test to handle emitting the drag events.
 */
function dispatchDragEndEvent(element: HTMLElement, endPercent: number,
                                gestureConfig: TestGestureConfig): void {
  let dimensions = element.getBoundingClientRect();
  let width = dimensions.width;
  let left = dimensions.left;
  let x = left + (width * endPercent);

  gestureConfig.emitEventForElement('dragend', element, {
    center: { x: x },
    srcEvent: { preventDefault: jasmine.createSpy('preventDefault') }
  });
}
