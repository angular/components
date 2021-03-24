/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LEFT_ARROW, RIGHT_ARROW} from '@angular/cdk/keycodes';
import {Platform} from '@angular/cdk/platform';
import {
  dispatchFakeEvent,
  dispatchMouseEvent,
  dispatchPointerEvent,
  dispatchTouchEvent,
} from '@angular/cdk/testing/private';
import {Component, Type} from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
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
      imports: [MatSliderModule, FormsModule],
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
    let sliderInstance: MatSlider;
    let startInputInstance: MatSliderThumb;
    let endInputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(StandardRangeSlider);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
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
    let inputInstance: MatSliderThumb;
    let thumbInstance: MatSliderVisualThumb;
    let thumbElement: HTMLElement;
    let thumbX: number;
    let thumbY: number;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(StandardSlider);
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

  describe('slider with set value', () => {
    let sliderInstance: MatSlider;
    let inputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(SliderWithValue);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      inputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should set the default value from the attribute', () => {
      expect(inputInstance.value).toBe(50);
    });

    it('should set the correct value on mousedown', () => {
      setValueByClick(sliderInstance, 19, platform.IOS);
      expect(inputInstance.value).toBe(19);
    });

    it('should set the correct value on slide', () => {
      slideToValue(sliderInstance, 77, Thumb.END, platform.IOS);
      expect(inputInstance.value).toBe(77);
    });
  });

  describe('range slider with set value', () => {
    let sliderInstance: MatSlider;
    let startInputInstance: MatSliderThumb;
    let endInputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(RangeSliderWithValue);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      startInputInstance = sliderInstance._getInput(Thumb.START);
      endInputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should set the default value from the attribute', () => {
      expect(startInputInstance.value).toBe(25);
      expect(endInputInstance.value).toBe(75);
    });

    it('should set the correct start value on mousedown behind the start thumb', () => {
      setValueByClick(sliderInstance, 19, platform.IOS);
      expect(startInputInstance.value).toBe(19);
    });

    it('should set the correct start value on mousedown in front of the end thumb', () => {
      setValueByClick(sliderInstance, 77, platform.IOS);
      expect(endInputInstance.value).toBe(77);
    });

    it('should set the correct start value on slide', () => {
      slideToValue(sliderInstance, 73, Thumb.START, platform.IOS);
      expect(startInputInstance.value).toBe(73);
    });

    it('should set the correct end value on slide', () => {
      slideToValue(sliderInstance, 99, Thumb.END, platform.IOS);
      expect(endInputInstance.value).toBe(99);
    });
  });

  describe('slider with set step', () => {
    let sliderInstance: MatSlider;
    let inputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(SliderWithStep);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      inputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should set the correct step value on mousedown', () => {
      expect(inputInstance.value).toBe(0);
      setValueByClick(sliderInstance, 13, platform.IOS);
      expect(inputInstance.value).toBe(25);
    });

    it('should set the correct step value on slide', () => {
      slideToValue(sliderInstance, 12, Thumb.END, platform.IOS);
      expect(inputInstance.value).toBe(0);
    });

    it('should not add decimals to the value if it is a whole number', () => {
      sliderInstance.step = 0.1;
      slideToValue(sliderInstance, 100, Thumb.END, platform.IOS);
      expect(inputInstance.value).toBe(100);
    });

    it('should truncate long decimal values when using a decimal step', () => {
      // TODO(wagnermaciel): Uncomment this test once b/182504575 is resolved.
      // sliderInstance.step = 0.1;
      // slideToValue(sliderInstance, 33.3333, Thumb.END, platform.IOS);
      // expect(inputInstance.value).toBe(33);
    });

    it('should truncate long decimal values when using a decimal step and the arrow keys', () => {
      sliderInstance.step = 0.1;
      changeValueUsingArrowKeys(sliderInstance, RIGHT_ARROW, Thumb.END);
      changeValueUsingArrowKeys(sliderInstance, RIGHT_ARROW, Thumb.END);
      changeValueUsingArrowKeys(sliderInstance, RIGHT_ARROW, Thumb.END);
      expect(inputInstance.value).toBe(0.3);
    });
  });

  describe('range slider with set step', () => {
    let sliderInstance: MatSlider;
    let startInputInstance: MatSliderThumb;
    let endInputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(RangeSliderWithStep);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      startInputInstance = sliderInstance._getInput(Thumb.START);
      endInputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should set the correct step value on mousedown behind the start thumb', () => {
      sliderInstance._setValue(50, Thumb.START);
      setValueByClick(sliderInstance, 13, platform.IOS);
      expect(startInputInstance.value).toBe(25);
    });

    it('should set the correct step value on mousedown in front of the end thumb', () => {
      sliderInstance._setValue(50, Thumb.END);
      setValueByClick(sliderInstance, 63, platform.IOS);
      expect(endInputInstance.value).toBe(75);
    });

    it('should set the correct start thumb step value on slide', () => {
      slideToValue(sliderInstance, 26, Thumb.START, platform.IOS);
      expect(startInputInstance.value).toBe(25);
    });

    it('should set the correct end thumb step value on slide', () => {
      slideToValue(sliderInstance, 45, Thumb.END, platform.IOS);
      expect(endInputInstance.value).toBe(50);
    });

    it('should not add decimals to the end value if it is a whole number', () => {
      sliderInstance.step = 0.1;
      slideToValue(sliderInstance, 100, Thumb.END, platform.IOS);
      expect(endInputInstance.value).toBe(100);
    });

    it('should not add decimals to the start value if it is a whole number', () => {
      sliderInstance.step = 0.1;
      slideToValue(sliderInstance, 100, Thumb.END, platform.IOS);
      expect(endInputInstance.value).toBe(100);
    });

    it('should truncate long decimal start values when using a decimal step', () => {
      // TODO(wagnermaciel): Uncomment this test once b/182504575 is resolved.
      // sliderInstance.step = 0.1;
      // slideToValue(sliderInstance, 33.3333, Thumb.START, platform.IOS);
      // expect(startInputInstance.value).toBe(33);
    });

    it('should truncate long decimal end values when using a decimal step', () => {
      // TODO(wagnermaciel): Uncomment this test once b/182504575 is resolved.
      // sliderInstance.step = 0.1;
      // slideToValue(sliderInstance, 66.6666, Thumb.END, platform.IOS);
      // expect(endInputInstance.value).toBe(66);
    });

    it('should truncate long decimal start values when using a decimal step arrow keys', () => {
      sliderInstance.step = 0.1;
      changeValueUsingArrowKeys(sliderInstance, RIGHT_ARROW, Thumb.START);
      changeValueUsingArrowKeys(sliderInstance, RIGHT_ARROW, Thumb.START);
      changeValueUsingArrowKeys(sliderInstance, RIGHT_ARROW, Thumb.START);
      expect(startInputInstance.value).toBe(0.3);
    });

    it('should truncate long decimal end values when using a decimal step arrow keys', () => {
      sliderInstance.step = 0.1;
      changeValueUsingArrowKeys(sliderInstance, LEFT_ARROW, Thumb.END);
      changeValueUsingArrowKeys(sliderInstance, LEFT_ARROW, Thumb.END);
      changeValueUsingArrowKeys(sliderInstance, LEFT_ARROW, Thumb.END);
      expect(endInputInstance.value).toBe(99.7);
    });
  });

  describe('slider with custom thumb label formatting', () => {
    let fixture: ComponentFixture<DiscreteSliderWithDisplayWith>;
    let sliderInstance: MatSlider;
    let valueIndicatorTextElement: Element;

    beforeEach(() => {
      fixture = createComponent(DiscreteSliderWithDisplayWith);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider))!;
      const sliderNativeElement = sliderDebugElement.nativeElement;
      sliderInstance = sliderDebugElement.componentInstance;
      valueIndicatorTextElement =
        sliderNativeElement.querySelector('.mdc-slider__value-indicator-text')!;
    });

    it('should invoke the passed-in `displayWith` function with the value', () => {
      spyOn(fixture.componentInstance, 'displayWith').and.callThrough();
      sliderInstance._setValue(1337, Thumb.END);
      fixture.whenStable().then(() => {
        expect(fixture.componentInstance.displayWith).toHaveBeenCalledWith(1337);
      });
    });

    it('should format the thumb label based on the passed-in `displayWith` function', () => {
      sliderInstance._setValue(200000, Thumb.END);
      fixture.whenStable().then(() => {
        expect(valueIndicatorTextElement.textContent).toBe('200k');
      });
    });
  });

  describe('range slider with custom thumb label formatting', () => {
    let fixture: ComponentFixture<DiscreteRangeSliderWithDisplayWith>;
    let sliderInstance: MatSlider;
    let startValueIndicatorTextElement: Element;
    let endValueIndicatorTextElement: Element;

    beforeEach(() => {
      fixture = createComponent(DiscreteRangeSliderWithDisplayWith);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider))!;
      sliderInstance = sliderDebugElement.componentInstance;

      const startThumbElement = sliderInstance._getThumbElement(Thumb.START);
      const endThumbElement = sliderInstance._getThumbElement(Thumb.END);
      startValueIndicatorTextElement =
        startThumbElement.querySelector('.mdc-slider__value-indicator-text')!;
      endValueIndicatorTextElement =
        endThumbElement.querySelector('.mdc-slider__value-indicator-text')!;
    });

    it('should invoke the passed-in `displayWith` function with the start value', () => {
      spyOn(fixture.componentInstance, 'displayWith').and.callThrough();
      sliderInstance._setValue(1337, Thumb.START);
      fixture.whenStable().then(() => {
        expect(fixture.componentInstance.displayWith).toHaveBeenCalledWith(1337);
      });
    });

    it('should invoke the passed-in `displayWith` function with the end value', () => {
      spyOn(fixture.componentInstance, 'displayWith').and.callThrough();
      sliderInstance._setValue(5996, Thumb.END);
      fixture.whenStable().then(() => {
        expect(fixture.componentInstance.displayWith).toHaveBeenCalledWith(5996);
      });
    });

    it('should format the start thumb label based on the passed-in `displayWith` function', () => {
      sliderInstance._setValue(200000, Thumb.START);
      fixture.whenStable().then(() => {
        expect(startValueIndicatorTextElement.textContent).toBe('200k');
      });
    });

    it('should format the end thumb label based on the passed-in `displayWith` function', () => {
      sliderInstance._setValue(700000, Thumb.END);
      fixture.whenStable().then(() => {
        expect(endValueIndicatorTextElement.textContent).toBe('700k');
      });
    });
  });

  describe('slider with value property binding', () => {
    let fixture: ComponentFixture<SliderWithOneWayBinding>;
    let testComponent: SliderWithOneWayBinding;
    let inputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(SliderWithOneWayBinding);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      const sliderInstance = sliderDebugElement.componentInstance;
      inputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should update when bound value changes', () => {
      testComponent.value = 75;
      fixture.detectChanges();
      expect(inputInstance.value).toBe(75);
    });
  });

  describe('range slider with value property binding', () => {
    let fixture: ComponentFixture<RangeSliderWithOneWayBinding>;
    let testComponent: RangeSliderWithOneWayBinding;
    let startInputInstance: MatSliderThumb;
    let endInputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(RangeSliderWithOneWayBinding);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      const sliderInstance = sliderDebugElement.componentInstance;
      startInputInstance = sliderInstance._getInput(Thumb.START);
      endInputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should update when bound start value changes', () => {
      testComponent.startValue = 30;
      fixture.detectChanges();
      expect(startInputInstance.value).toBe(30);
    });

    it('should update when bound end value changes', () => {
      testComponent.endValue = 70;
      fixture.detectChanges();
      expect(endInputInstance.value).toBe(70);
    });
  });

  describe('slider with ngModel', () => {
    let fixture: ComponentFixture<SliderWithNgModel>;
    let testComponent: SliderWithNgModel;
    let sliderInstance: MatSlider;
    let inputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(SliderWithNgModel);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      inputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should update the model on mouseup', () => {
      expect(testComponent.value).toBe(0);
      setValueByClick(sliderInstance, 76, platform.IOS);
      expect(testComponent.value).toBe(76);
    });

    it('should update the model on slide', () => {
      expect(testComponent.value).toBe(0);
      slideToValue(sliderInstance, 19, Thumb.END, platform.IOS);
      expect(testComponent.value).toBe(19);
    });

    it('should be able to set a slider value by setting the model', fakeAsync(() => {
      expect(inputInstance.value).toBe(0);
      testComponent.value = 5;
      fixture.detectChanges();
      flush();
      expect(inputInstance.value).toBe(5);
    }));

    it('should be able to reset a slider by setting the model back to undefined', fakeAsync(() => {
      testComponent.value = 5;
      fixture.detectChanges();
      flush();
      testComponent.value = undefined;
      fixture.detectChanges();
      flush();
      expect(inputInstance.value).toBe(0);
    }));
  });

  describe('range slider with ngModel', () => {
    let fixture: ComponentFixture<RangeSliderWithNgModel>;
    let testComponent: RangeSliderWithNgModel;
    let sliderInstance: MatSlider;
    let startInputInstance: MatSliderThumb;
    let endInputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(RangeSliderWithNgModel);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      startInputInstance = sliderInstance._getInput(Thumb.START);
      endInputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should update the model on mouseup behind the start thumb', () => {
      expect(testComponent.startValue).toBe(0);
      sliderInstance._setValue(19, Thumb.START);
      setValueByClick(sliderInstance, 12, platform.IOS);
      expect(testComponent.startValue).toBe(12);
    });

    it('should update the model on mouseup in front of the end thumb', () => {
      expect(testComponent.endValue).toBe(100);
      sliderInstance._setValue(50, Thumb.END);
      setValueByClick(sliderInstance, 75, platform.IOS);
      expect(testComponent.endValue).toBe(75);
    });

    it('should update the start thumb model on slide', () => {
      expect(testComponent.startValue).toBe(0);
      slideToValue(sliderInstance, 19, Thumb.START, platform.IOS);
      expect(testComponent.startValue).toBe(19);
    });

    it('should update the end thumb model on slide', () => {
      expect(testComponent.endValue).toBe(100);
      slideToValue(sliderInstance, 33, Thumb.END, platform.IOS);
      expect(testComponent.endValue).toBe(33);
    });

    it('should be able to set the slider start value by setting the model', fakeAsync(() => {
      expect(startInputInstance.value).toBe(0);
      testComponent.startValue = 5;
      fixture.detectChanges();
      flush();
      expect(startInputInstance.value).toBe(5);
    }));

    it('should be able to set the slider end value by setting the model', fakeAsync(() => {
      expect(endInputInstance.value).toBe(100);
      testComponent.endValue = 99;
      fixture.detectChanges();
      flush();
      expect(endInputInstance.value).toBe(99);
    }));

    it('should be able to reset a sliders start value ' +
      'by setting the model back to undefined', fakeAsync(() => {
      testComponent.startValue = 5;
      fixture.detectChanges();
      flush();
      testComponent.startValue = undefined;
      fixture.detectChanges();
      flush();
      expect(startInputInstance.value).toBe(0);
    }));

    it('should be able to reset a sliders end value ' +
      'by setting the model back to undefined', fakeAsync(() => {
      testComponent.endValue = 99;
      fixture.detectChanges();
      flush();
      testComponent.endValue = undefined;
      fixture.detectChanges();
      flush();
      expect(endInputInstance.value).toBe(0);
    }));
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

@Component({
  template: `
  <mat-slider>
    <input value="50" matSliderThumb>
  </mat-slider>
  `,
})
class SliderWithValue {}

@Component({
  template: `
  <mat-slider>
    <input value="25" matSliderStartThumb>
    <input value="75" matSliderEndThumb>
  </mat-slider>
  `,
})
class RangeSliderWithValue {}

@Component({
  template: `
  <mat-slider step="25">
    <input matSliderThumb>
  </mat-slider>
  `,
})
class SliderWithStep {}

@Component({
  template: `
  <mat-slider step="25">
    <input matSliderStartThumb>
    <input matSliderEndThumb>
  </mat-slider>
  `,
})
class RangeSliderWithStep {}

@Component({
  template: `
  <mat-slider [displayWith]="displayWith" min="1" max="1000000" discrete>
    <input matSliderThumb>
  </mat-slider>
  `,
})
class DiscreteSliderWithDisplayWith {
  displayWith(v: number) {
    if (v >= 1000) { return `$${v / 1000}k`; }
    return `$${v}`;
  }
}

@Component({
  template: `
  <mat-slider [displayWith]="displayWith" min="1" max="1000000" discrete>
    <input matSliderStartThumb>
    <input matSliderEndThumb>
  </mat-slider>
  `,
})
class DiscreteRangeSliderWithDisplayWith {
  displayWith(v: number) {
    if (v >= 1000) { return `$${v / 1000}k`; }
    return `$${v}`;
  }
}

@Component({
  template: `
  <mat-slider>
    <input [value]="value" matSliderThumb>
  </mat-slider>
  `,
})
class SliderWithOneWayBinding {
  value = 50;
}

@Component({
  template: `
  <mat-slider>
    <input [value]="startValue" matSliderStartThumb>
    <input [value]="endValue" matSliderEndThumb>
  </mat-slider>
  `,
})
class RangeSliderWithOneWayBinding {
  startValue = 25;
  endValue = 75;
}

@Component({
  template: `
  <mat-slider>
    <input [(ngModel)]="value" matSliderThumb>
  </mat-slider>`,
})
class SliderWithNgModel {
  value: number | undefined = 0;
}

@Component({
  template: `
  <mat-slider>
    <input [(ngModel)]="startValue" matSliderStartThumb>
    <input [(ngModel)]="endValue" matSliderEndThumb>
  </mat-slider>`,
})
class RangeSliderWithNgModel {
  startValue: number | undefined = 0;
  endValue: number | undefined = 100;
}

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

/**
 * Mimics changing the slider value using arrow keys.
 *
 * Dispatching keydown events on inputs do not trigger value changes. Thus, to mimic this behavior,
 * we manually change the slider inputs value and then dispatch a change event (which is what the
 * MDC Foundation is listening for & how it handles these updates).
 */
function changeValueUsingArrowKeys(slider: MatSlider, arrow: number, thumbPosition: Thumb) {
  const input = slider._getInput(thumbPosition);
  const value = arrow === RIGHT_ARROW
    ? input.value + slider.step
    : input.value - slider.step;
  input._hostElement.value = value.toString();
  dispatchFakeEvent(input._hostElement, 'change');
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
