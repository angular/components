/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Platform} from '@angular/cdk/platform';
import {
  dispatchMouseEvent,
  dispatchPointerEvent,
  dispatchTouchEvent,
} from '@angular/cdk/testing/private';
import {Component, DebugElement, Type} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Thumb} from '@material/slider';
import {MatSliderModule} from './module';
import {MatSlider, MatSliderThumb, MatSliderVisualThumb} from './slider';

describe('MDC-based MatSlider' , () => {
  let platform: Platform;

  beforeAll(() => {
    platform = TestBed.inject(Platform);
    // Mock #setPointerCapture as it throws errors on pointerdown without a real pointerId.
    spyOn(Element.prototype, 'setPointerCapture');
  });

  function createComponent<T>(component: Type<T>): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [MatSliderModule],
      declarations: [component],
    }).compileComponents();
    return TestBed.createComponent<T>(component);
  }

  describe('standard slider', () => {
    let sliderInstance: MatSlider;
    let inputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(StandardSlider);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      inputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should set the default values', () => {
      expect(inputInstance.value).toBe(0);
      expect(sliderInstance.min).toBe(0);
      expect(sliderInstance.max).toBe(100);
    });

    it('should update the value on mousedown', () => {
      setValueByClick(sliderInstance, 19, platform.IOS);
      expect(inputInstance.value).toBe(19);
    });

    it('should update the value on a slide', () => {
      slideToValue(sliderInstance, 77, Thumb.END, platform.IOS);
      expect(inputInstance.value).toBe(77);
    });

    it('should set the value as min when sliding before the track', () => {
      slideToValue(sliderInstance, -1, Thumb.END, platform.IOS);
      expect(inputInstance.value).toBe(0);
    });

    it('should set the value as max when sliding past the track', () => {
      slideToValue(sliderInstance, 101, Thumb.END, platform.IOS);
      expect(inputInstance.value).toBe(100);
    });

    it('should focus the slider input when clicking on the slider', () => {
      expect(document.activeElement).not.toBe(inputInstance._hostElement);
      setValueByClick(sliderInstance, 0, platform.IOS);
      expect(document.activeElement).toBe(inputInstance._hostElement);
    });
  });

  describe('standard range slider', () => {
    let fixture: ComponentFixture<StandardRangeSlider>;
    let sliderDebugElement: DebugElement;
    let sliderInstance: MatSlider;
    let startInputInstance: MatSliderThumb;
    let endInputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(StandardRangeSlider);
      fixture.detectChanges();
      sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      startInputInstance = sliderInstance._getInput(Thumb.START);
      endInputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should set the default values', () => {
      expect(startInputInstance.value).toBe(0);
      expect(endInputInstance.value).toBe(100);
      expect(sliderInstance.min).toBe(0);
      expect(sliderInstance.max).toBe(100);
    });

    it('should update the start value on a slide', () => {
      slideToValue(sliderInstance, 19, Thumb.START, platform.IOS);
      expect(startInputInstance.value).toBe(19);
    });

    it('should update the end value on a slide', () => {
      slideToValue(sliderInstance, 27, Thumb.END, platform.IOS);
      expect(endInputInstance.value).toBe(27);
    });

    it('should update the start value on mousedown behind the start thumb', () => {
      sliderInstance._setValue(19, Thumb.START);
      setValueByClick(sliderInstance, 12, platform.IOS);
      expect(startInputInstance.value).toBe(12);
    });

    it('should update the end value on mousedown in front of the end thumb', () => {
      sliderInstance._setValue(27, Thumb.END);
      setValueByClick(sliderInstance, 55, platform.IOS);
      expect(endInputInstance.value).toBe(55);
    });

    it('should set the start value as min when sliding before the track', () => {
      slideToValue(sliderInstance, -1, Thumb.START, platform.IOS);
      expect(startInputInstance.value).toBe(0);
    });

    it('should set the end value as max when sliding past the track', () => {
      slideToValue(sliderInstance, 101, Thumb.START, platform.IOS);
      expect(startInputInstance.value).toBe(100);
    });

    it('should not let the start thumb slide past the end thumb', () => {
      sliderInstance._setValue(50, Thumb.END);
      slideToValue(sliderInstance, 75, Thumb.START, platform.IOS);
      expect(startInputInstance.value).toBe(50);
    });

    it('should not let the end thumb slide before the start thumb', () => {
      sliderInstance._setValue(50, Thumb.START);
      slideToValue(sliderInstance, 25, Thumb.END, platform.IOS);
      expect(startInputInstance.value).toBe(50);
    });
  });

  describe('disabled slider', () => {
    let sliderInstance: MatSlider;
    let inputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(DisabledSlider);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      inputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should be disabled', () => {
      expect(sliderInstance.disabled).toBeTrue();
    });

    it('should have the disabled class on the root element', () => {
      expect(sliderInstance._elementRef.nativeElement.classList).toContain('mdc-slider--disabled');
    });

    it('should set the disabled attribute on the input element', () => {
      expect(inputInstance._hostElement.disabled).toBeTrue();
    });

    it('should not update the value on mousedown', () => {
      setValueByClick(sliderInstance, 19, platform.IOS);
      expect(inputInstance.value).toBe(0);
    });

    it('should not update the value on a slide', () => {
      slideToValue(sliderInstance, 77, Thumb.END, platform.IOS);
      expect(inputInstance.value).toBe(0);
    });
  });

  describe('disabled range slider', () => {
    let sliderInstance: MatSlider;
    let startInputInstance: MatSliderThumb;
    let endInputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(DisabledRangeSlider);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      startInputInstance = sliderInstance._getInput(Thumb.START);
      endInputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should be disabled', () => {
      expect(sliderInstance.disabled).toBeTrue();
    });

    it('should have the disabled class on the root element', () => {
      expect(sliderInstance._elementRef.nativeElement.classList).toContain('mdc-slider--disabled');
    });

    it('should set the disabled attribute on the input elements', () => {
      expect(startInputInstance._hostElement.disabled).toBeTrue();
      expect(endInputInstance._hostElement.disabled).toBeTrue();
    });

    it('should not update the start value on a slide', () => {
      slideToValue(sliderInstance, 19, Thumb.START, platform.IOS);
      expect(startInputInstance.value).toBe(0);
    });

    it('should not update the end value on a slide', () => {
      slideToValue(sliderInstance, 27, Thumb.END, platform.IOS);
      expect(endInputInstance.value).toBe(100);
    });

    it('should not update the start value on mousedown behind the start thumb', () => {
      sliderInstance._setValue(19, Thumb.START);
      setValueByClick(sliderInstance, 12, platform.IOS);
      expect(startInputInstance.value).toBe(19);
    });

    it('should update the end value on mousedown in front of the end thumb', () => {
      sliderInstance._setValue(27, Thumb.END);
      setValueByClick(sliderInstance, 55, platform.IOS);
      expect(endInputInstance.value).toBe(27);
    });
  });

  describe('ripple states', () => {
    let fixture: ComponentFixture<StandardSlider>;
    let inputInstance: MatSliderThumb;
    let thumbInstance: MatSliderVisualThumb;
    let thumbElement: HTMLElement;
    let thumbX: number;
    let thumbY: number;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(StandardSlider);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      const sliderInstance = sliderDebugElement.componentInstance;
      inputInstance = sliderInstance._getInput(Thumb.END);
      thumbInstance = sliderInstance._getThumb(Thumb.END);
      thumbElement = thumbInstance._getHostElement();
      const thumbDimensions = thumbElement.getBoundingClientRect();
      thumbX = thumbDimensions.left - (thumbDimensions.width / 2);
      thumbY = thumbDimensions.top - (thumbDimensions.height / 2);
    }));

    function isRippleVisible(selector: string) {
      tick(500);
      return !!document.querySelector(`.mat-mdc-slider-${selector}-ripple`);
    }

    function blur() {
      inputInstance._hostElement.blur();
    }

    function mouseenter() {
      dispatchMouseEvent(thumbElement, 'mouseenter', thumbX, thumbY);
    }

    function mouseleave() {
      dispatchMouseEvent(thumbElement, 'mouseleave', thumbX, thumbY);
    }

    function pointerdown() {
      dispatchPointerOrTouchEvent(
        thumbElement, PointerEventType.POINTER_DOWN, thumbX, thumbY, platform.IOS
      );
    }

    function pointerup() {
      dispatchPointerOrTouchEvent(
        thumbElement, PointerEventType.POINTER_UP, thumbX, thumbY, platform.IOS
      );
    }

    it('should show the hover ripple on mouseenter', fakeAsync(() => {
      expect(isRippleVisible('hover')).toBeFalse();
      mouseenter();
      expect(isRippleVisible('hover')).toBeTrue();
    }));

    it('should hide the hover ripple on mouseleave', fakeAsync(() => {
      mouseenter();
      mouseleave();
      expect(isRippleVisible('hover')).toBeFalse();
    }));

    it('should show the focus ripple on pointerdown', fakeAsync(() => {
      expect(isRippleVisible('focus')).toBeFalse();
      pointerdown();
      expect(isRippleVisible('focus')).toBeTrue();
    }));

    it('should continue to show the focus ripple on pointerup', fakeAsync(() => {
      pointerdown();
      pointerup();
      expect(isRippleVisible('focus')).toBeTrue();
    }));

    it('should hide the focus ripple on blur', fakeAsync(() => {
      pointerdown();
      pointerup();
      blur();
      expect(isRippleVisible('focus')).toBeFalse();
    }));

    it('should show the active ripple on pointerdown', fakeAsync(() => {
      expect(isRippleVisible('active')).toBeFalse();
      pointerdown();
      expect(isRippleVisible('active')).toBeTrue();
    }));

    it('should hide the active ripple on pointerup', fakeAsync(() => {
      pointerdown();
      pointerup();
      expect(isRippleVisible('active')).toBeFalse();
    }));

    // Edge cases.

    it('should not show the hover ripple if the thumb is already focused', fakeAsync(() => {
      pointerdown();
      mouseenter();
      expect(isRippleVisible('hover')).toBeFalse();
    }));

    it('should hide the hover ripple if the thumb is focused', fakeAsync(() => {
      mouseenter();
      pointerdown();
      expect(isRippleVisible('hover')).toBeFalse();
    }));

    it('should not hide the focus ripple if the thumb is pressed', fakeAsync(() => {
      pointerdown();
      blur();
      expect(isRippleVisible('focus')).toBeTrue();
    }));

    it('should not hide the hover ripple on blur if the thumb is hovered', fakeAsync(() => {
      mouseenter();
      pointerdown();
      pointerup();
      blur();
      expect(isRippleVisible('hover')).toBeTrue();
    }));

    it('should hide the focus ripple on drag end if the thumb already lost focus', fakeAsync(() => {
      pointerdown();
      blur();
      pointerup();
      expect(isRippleVisible('focus')).toBeFalse();
    }));
  });

  describe('slider with set min and max', () => {
    let fixture: ComponentFixture<SliderWithMinAndMax>;
    let sliderInstance: MatSlider;
    let inputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(SliderWithMinAndMax);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      inputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should set the default values from the attributes', () => {
      expect(inputInstance.value).toBe(25);
      expect(sliderInstance.min).toBe(25);
      expect(sliderInstance.max).toBe(75);
    });

    it('should set the correct value on mousedown', () => {
      setValueByClick(sliderInstance, 33, platform.IOS);
      expect(inputInstance.value).toBe(33);
    });

    it('should set the correct value on slide', () => {
      slideToValue(sliderInstance, 55, Thumb.END, platform.IOS);
      expect(inputInstance.value).toBe(55);
    });

    it('should be able to set the min and max values when they are more precise ' +
      'than the step', () => {
        sliderInstance.step = 10;
        fixture.detectChanges();
        slideToValue(sliderInstance, 25, Thumb.END, platform.IOS);
        expect(inputInstance.value).toBe(25);
        slideToValue(sliderInstance, 75, Thumb.END, platform.IOS);
        expect(inputInstance.value).toBe(75);
    });
  });

  describe('range slider with set min and max', () => {
    let fixture: ComponentFixture<RangeSliderWithMinAndMax>;
    let sliderInstance: MatSlider;
    let startInputInstance: MatSliderThumb;
    let endInputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(RangeSliderWithMinAndMax);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      startInputInstance = sliderInstance._getInput(Thumb.START);
      endInputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should set the default values from the attributes', () => {
      expect(startInputInstance.value).toBe(25);
      expect(endInputInstance.value).toBe(75);
      expect(sliderInstance.min).toBe(25);
      expect(sliderInstance.max).toBe(75);
    });

    it('should set the correct start value on mousedown behind the start thumb', () => {
      sliderInstance._setValue(50, Thumb.START);
      setValueByClick(sliderInstance, 33, platform.IOS);
      expect(startInputInstance.value).toBe(33);
    });

    it('should set the correct end value on mousedown behind the end thumb', () => {
      sliderInstance._setValue(50, Thumb.END);
      setValueByClick(sliderInstance, 66, platform.IOS);
      expect(endInputInstance.value).toBe(66);
    });

    it('should set the correct start value on slide', () => {
      slideToValue(sliderInstance, 40, Thumb.START, platform.IOS);
      expect(startInputInstance.value).toBe(40);
    });

    it('should set the correct end value on slide', () => {
      slideToValue(sliderInstance, 60, Thumb.END, platform.IOS);
      expect(endInputInstance.value).toBe(60);
    });

    it('should be able to set the min and max values when they are more precise ' +
      'than the step', () => {
        sliderInstance.step = 10;
        fixture.detectChanges();
        slideToValue(sliderInstance, 25, Thumb.START, platform.IOS);
        expect(startInputInstance.value).toBe(25);
        slideToValue(sliderInstance, 75, Thumb.END, platform.IOS);
        expect(endInputInstance.value).toBe(75);
    });
  });
});


@Component({
  template: `
  <mat-slider>
    <input matSliderThumb>
  </mat-slider>
  `,
})
class StandardSlider {}

@Component({
  template: `
  <mat-slider>
    <input matSliderStartThumb>
    <input matSliderEndThumb>
  </mat-slider>
  `,
})
class StandardRangeSlider {}

@Component({
  template: `
  <mat-slider disabled>
    <input matSliderThumb>
  </mat-slider>
  `,
})
class DisabledSlider {}

@Component({
  template: `
  <mat-slider disabled>
    <input matSliderStartThumb>
    <input matSliderEndThumb>
  </mat-slider>
  `,
})
class DisabledRangeSlider {}

@Component({
  template: `
  <mat-slider min="25" max="75">
    <input matSliderThumb>
  </mat-slider>
  `,
})
class SliderWithMinAndMax {}

@Component({
  template: `
  <mat-slider min="25" max="75">
    <input matSliderStartThumb>
    <input matSliderEndThumb>
  </mat-slider>
  `,
})
class RangeSliderWithMinAndMax {}

/** The pointer event types used by the MDC Slider. */
const enum PointerEventType {
  POINTER_DOWN = 'pointerdown',
  POINTER_UP = 'pointerup',
  POINTER_MOVE = 'pointermove',
}

/** The touch event types used by the MDC Slider. */
const enum TouchEventType {
  TOUCH_START = 'touchstart',
  TOUCH_END = 'touchend',
  TOUCH_MOVE = 'touchmove',
}

/** Clicks on the MatSlider at the coordinates corresponding to the given value. */
function setValueByClick(slider: MatSlider, value: number, isIOS: boolean) {
  const {min, max} = slider;
  const percent = (value - min) / (max - min);

  const sliderElement = slider._elementRef.nativeElement;
  const {top, left, width, height} = sliderElement.getBoundingClientRect();
  const x = left + (width * percent);
  const y = top + (height / 2);

  dispatchPointerOrTouchEvent(sliderElement, PointerEventType.POINTER_DOWN, x, y, isIOS);
  dispatchPointerOrTouchEvent(sliderElement, PointerEventType.POINTER_UP, x, y, isIOS);
}

/** Slides the MatSlider's thumb to the given value. */
function slideToValue(slider: MatSlider, value: number, thumbPosition: Thumb, isIOS: boolean) {
  const {min, max} = slider;
  const percent = (value - min) / (max - min);

  const sliderElement = slider._elementRef.nativeElement;
  const thumbElement = slider._getThumbElement(thumbPosition);

  const sliderDimensions = sliderElement.getBoundingClientRect();
  const thumbDimensions = thumbElement.getBoundingClientRect();

  const startX = thumbDimensions.left + (thumbDimensions.width / 2);
  const startY = thumbDimensions.top + (thumbDimensions.height / 2);

  const endX = sliderDimensions.left + (sliderDimensions.width * percent);
  const endY = sliderDimensions.top + (sliderDimensions.height / 2);

  dispatchPointerOrTouchEvent(sliderElement, PointerEventType.POINTER_DOWN, startX, startY, isIOS);
  dispatchPointerOrTouchEvent(sliderElement, PointerEventType.POINTER_MOVE, endX, endY, isIOS);
  dispatchPointerOrTouchEvent(sliderElement, PointerEventType.POINTER_UP, endX, endY, isIOS);
}

/** Dispatch a pointerdown or pointerup event if supported, otherwise dispatch the touch event. */
function dispatchPointerOrTouchEvent(
  node: Node, type: PointerEventType, x: number, y: number, isIOS: boolean) {
  if (isIOS) {
    dispatchTouchEvent(node, pointerEventTypeToTouchEventType(type), x, y, x, y);
  } else {
    dispatchPointerEvent(node, type, x, y);
  }
}

/** Returns the touch event equivalent of the given pointer event. */
function pointerEventTypeToTouchEventType(pointerEventType: PointerEventType) {
  switch (pointerEventType) {
    case PointerEventType.POINTER_DOWN:
      return TouchEventType.TOUCH_START;
    case PointerEventType.POINTER_UP:
      return TouchEventType.TOUCH_END;
    case PointerEventType.POINTER_MOVE:
      return TouchEventType.TOUCH_MOVE;
  }
}
