/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BidiModule, Directionality} from '@angular/cdk/bidi';
import {Platform} from '@angular/cdk/platform';
import {
  dispatchEvent,
  dispatchFakeEvent,
  dispatchPointerEvent,
  dispatchTouchEvent,
} from '../../cdk/testing/private';
import {Component, Provider, QueryList, Type, ViewChild, ViewChildren} from '@angular/core';
import {ComponentFixture, fakeAsync, flush, TestBed, waitForAsync} from '@angular/core/testing';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {Thumb} from '@material/slider';
import {MatSliderModule} from './module';
import {MatSlider, MatSliderRangeThumb, MatSliderThumb, MatSliderVisualThumb} from './slider';
import {of} from 'rxjs';

interface Point {
  x: number;
  y: number;
}

describe('MDC-based MatSlider', () => {
  let platform: Platform;

  function createComponent<T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [FormsModule, MatSliderModule, ReactiveFormsModule, BidiModule],
      declarations: [component],
      providers: [...providers],
    }).compileComponents();
    platform = TestBed.inject(Platform);
    return TestBed.createComponent<T>(component);
  }

  function checkInput(
    input: MatSliderThumb,
    {
      min,
      max,
      value,
      translateX,
      width,
      step,
    }: {min: number; max: number; value: number; translateX: number; width?: number; step?: number},
  ): void {
    expect(input.min).withContext('min').toBe(min);
    expect(input.max).withContext('max').toBe(max);
    expect(input.value).withContext('value').toBe(value);
    expect(input.translateX)
      .withContext('translateX')
      .toBeCloseTo(translateX + 24, 0);
    if (step !== undefined) {
      expect(input.step).withContext('step').toBe(step);
    }
    if (width !== undefined) {
      const realWidth = parseInt((input as MatSliderRangeThumb)._styleWidth.match(/\d+/)![0], 10);
      expect(realWidth)
        .withContext('width')
        .toBeCloseTo((300 * width) / 100 + 16, 0);
    }
  }

  describe('standard slider', () => {
    let fixture: ComponentFixture<StandardSlider>;
    let slider: MatSlider;
    let input: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(StandardSlider);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      slider = sliderDebugElement.componentInstance;
      input = slider._getInput(Thumb.END) as MatSliderThumb;
    }));

    it('should set the default values', () => {
      expect(slider.min).toBe(0);
      expect(slider.max).toBe(100);
      expect(slider.step).toBe(0);
      checkInput(input, {min: 0, max: 100, value: 0, step: 0, translateX: 0});
    });

    it('should update by click', () => {
      setValueByClick(slider, input, 25, platform.IOS);
      checkInput(input, {min: 0, max: 100, value: 25, step: 0, translateX: 75});

      setValueByClick(slider, input, 50, platform.IOS);
      checkInput(input, {min: 0, max: 100, value: 50, step: 0, translateX: 150});

      setValueByClick(slider, input, 75, platform.IOS);
      checkInput(input, {min: 0, max: 100, value: 75, step: 0, translateX: 225});

      setValueByClick(slider, input, 100, platform.IOS);
      checkInput(input, {min: 0, max: 100, value: 100, step: 0, translateX: 300});
    });

    it('should update by slide', () => {
      slideToValue(slider, input, 25, platform.IOS);
      checkInput(input, {min: 0, max: 100, value: 25, step: 0, translateX: 75});

      slideToValue(slider, input, 50, platform.IOS);
      checkInput(input, {min: 0, max: 100, value: 50, step: 0, translateX: 150});

      slideToValue(slider, input, 75, platform.IOS);
      checkInput(input, {min: 0, max: 100, value: 75, step: 0, translateX: 225});

      slideToValue(slider, input, 100, platform.IOS);
      checkInput(input, {min: 0, max: 100, value: 100, step: 0, translateX: 300});
    });

    it('should not slide before the track', () => {
      slideToValue(slider, input, -10, platform.IOS);
      expect(input.value).toBe(0);
      checkInput(input, {min: 0, max: 100, value: 0, step: 0, translateX: 0});
    });

    it('should not slide past the track', () => {
      slideToValue(slider, input, 110, platform.IOS);
      expect(input.value).toBe(100);
      checkInput(input, {min: 0, max: 100, value: 100, step: 0, translateX: 300});
    });

    it('should not break when the page layout changes', () => {
      slider._elementRef.nativeElement.style.marginLeft = '100px';
      setValueByClick(slider, input, 25, platform.IOS);
      checkInput(input, {min: 0, max: 100, value: 25, step: 0, translateX: 75});
      slider._elementRef.nativeElement.style.marginLeft = 'initial';
    });
  });

  describe('standard range slider', () => {
    let fixture: ComponentFixture<StandardRangeSlider>;
    let slider: MatSlider;
    let endInput: MatSliderRangeThumb;
    let startInput: MatSliderRangeThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(StandardRangeSlider);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      slider = sliderDebugElement.componentInstance;
      endInput = slider._getInput(Thumb.END) as MatSliderRangeThumb;
      startInput = slider._getInput(Thumb.START) as MatSliderRangeThumb;
    }));

    it('should set the default values', () => {
      checkInput(startInput, {min: 0, max: 100, value: 0, step: 0, translateX: 0});
      checkInput(endInput, {min: 0, max: 100, value: 100, step: 0, translateX: 300});

      expect(slider.min).toBe(0);
      expect(slider.max).toBe(100);
      expect(slider.step).toBe(0);
    });

    it('should update by start input click', () => {
      setValueByClick(slider, startInput, 25, platform.IOS);
      checkInput(startInput, {min: 0, max: 100, value: 25, translateX: 75});
      checkInput(endInput, {min: 25, max: 100, value: 100, translateX: 300});
    });

    it('should update by end input click', () => {
      setValueByClick(slider, endInput, 75, platform.IOS);
      checkInput(startInput, {min: 0, max: 75, value: 0, translateX: 0});
      checkInput(endInput, {min: 0, max: 100, value: 75, translateX: 225});
    });

    it('should update by start thumb slide', () => {
      slideToValue(slider, startInput, 75, platform.IOS);
      checkInput(startInput, {min: 0, max: 100, value: 75, translateX: 225});
      checkInput(endInput, {min: 75, max: 100, value: 100, translateX: 300});
    });

    it('should update by end thumb slide', () => {
      slideToValue(slider, endInput, 25, platform.IOS);
      checkInput(startInput, {min: 0, max: 25, value: 0, translateX: 0});
      checkInput(endInput, {min: 0, max: 100, value: 25, translateX: 75});
    });

    it('should not allow start thumb to slide before the track', () => {
      slideToValue(slider, startInput, -10, platform.IOS);
      checkInput(startInput, {min: 0, max: 100, value: 0, translateX: 0});
      checkInput(endInput, {min: 0, max: 100, value: 100, translateX: 300});
    });

    it('should not allow end thumb to slide past the track', () => {
      slideToValue(slider, endInput, 110, platform.IOS);
      checkInput(startInput, {min: 0, max: 100, value: 0, translateX: 0});
      checkInput(endInput, {min: 0, max: 100, value: 100, translateX: 300});
    });

    it('should not allow start thumb to slide past the end thumb', () => {
      slideToValue(slider, endInput, 50, platform.IOS);
      slideToValue(slider, startInput, 55, platform.IOS);
      checkInput(startInput, {min: 0, max: 50, value: 50, translateX: 150});
      checkInput(endInput, {min: 50, max: 100, value: 50, translateX: 150});
    });

    it('should not allow end thumb to slide past the start thumb', () => {
      slideToValue(slider, startInput, 50, platform.IOS);
      slideToValue(slider, endInput, 45, platform.IOS);
      checkInput(startInput, {min: 0, max: 50, value: 50, translateX: 150});
      checkInput(endInput, {min: 50, max: 100, value: 50, translateX: 150});
    });

    it('should not break when the page layout changes', () => {
      slider._elementRef.nativeElement.style.marginLeft = '100px';
      setValueByClick(slider, startInput, 25, platform.IOS);
      checkInput(startInput, {min: 0, max: 100, value: 25, translateX: 75});
      checkInput(endInput, {min: 25, max: 100, value: 100, translateX: 300});

      setValueByClick(slider, endInput, 75, platform.IOS);
      checkInput(startInput, {min: 0, max: 75, value: 25, translateX: 75});
      checkInput(endInput, {min: 25, max: 100, value: 75, translateX: 225});
      slider._elementRef.nativeElement.style.marginLeft = 'initial';
    });
  });

  describe('slider with min/max bindings', () => {
    let fixture: ComponentFixture<SliderWithMinAndMax>;
    let slider: MatSlider;
    let input: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(SliderWithMinAndMax);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      slider = sliderDebugElement.componentInstance;
      input = slider._getInput(Thumb.END) as MatSliderThumb;
    }));

    it('should have the correct initial values', () => {
      checkInput(input, {min: 25, max: 75, value: 25, translateX: 0});
    });

    it('should update the min when the bound value changes', () => {
      fixture.componentInstance.min = 0;
      fixture.detectChanges();
      checkInput(input, {min: 0, max: 75, value: 25, translateX: 100});
    });

    it('should update the max when the bound value changes', () => {
      fixture.componentInstance.max = 90;
      fixture.detectChanges();
      checkInput(input, {min: 25, max: 90, value: 25, translateX: 0});
    });

    it('should update the value if the min increases past it', () => {
      fixture.componentInstance.min = 50;
      fixture.detectChanges();
      checkInput(input, {min: 50, max: 75, value: 50, translateX: 0});
    });

    it('should update the value if the max decreases below it', () => {
      input.value = 75;
      fixture.componentInstance.max = 50;
      fixture.detectChanges();
      checkInput(input, {min: 25, max: 50, value: 50, translateX: 300});
    });

    it('should allow the min increase above the max', () => {
      fixture.componentInstance.min = 80;
      fixture.detectChanges();
      checkInput(input, {min: 80, max: 75, value: 80, translateX: 0});
    });

    it('should allow the max to decrease below the min', () => {
      fixture.componentInstance.max = -10;
      fixture.detectChanges();
      checkInput(input, {min: 25, max: -10, value: 25, translateX: 0});
    });

    it('should update the thumb translateX when the min changes', () => {
      checkInput(input, {min: 25, max: 75, value: 25, translateX: 0});
      fixture.componentInstance.min = -25;
      fixture.detectChanges();
      checkInput(input, {min: -25, max: 75, value: 25, translateX: 150});
    });

    it('should update the thumb translateX when the max changes', () => {
      setValueByClick(slider, input, 50, platform.IOS);
      checkInput(input, {min: 25, max: 75, value: 50, translateX: 150});
      fixture.componentInstance.max = 125;
      fixture.detectChanges();
      checkInput(input, {min: 25, max: 125, value: 50, translateX: 75});
    });
  });

  describe('range slider with min/max bindings', () => {
    let fixture: ComponentFixture<RangeSliderWithMinAndMax>;
    let slider: MatSlider;
    let endInput: MatSliderRangeThumb;
    let startInput: MatSliderRangeThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(RangeSliderWithMinAndMax);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      slider = sliderDebugElement.componentInstance;
      endInput = slider._getInput(Thumb.END) as MatSliderRangeThumb;
      startInput = slider._getInput(Thumb.START) as MatSliderRangeThumb;
    }));

    it('should have the correct initial values', () => {
      checkInput(startInput, {min: 25, max: 75, value: 25, translateX: 0});
      checkInput(endInput, {min: 25, max: 75, value: 75, translateX: 300});
    });

    describe('should handle min changes', () => {
      it('that do not affect values', () => {
        checkInput(startInput, {min: 25, max: 75, value: 25, translateX: 0});
        checkInput(endInput, {min: 25, max: 75, value: 75, translateX: 300});

        fixture.componentInstance.min = -25;
        fixture.detectChanges();

        checkInput(startInput, {min: -25, max: 75, value: 25, translateX: 150});
        checkInput(endInput, {min: 25, max: 75, value: 75, translateX: 300});
      });

      it('that affect the start value', () => {
        fixture.componentInstance.min = 50;
        fixture.detectChanges();
        checkInput(startInput, {min: 50, max: 75, value: 50, translateX: 0});
        checkInput(endInput, {min: 50, max: 75, value: 75, translateX: 300});
      });

      it('that affect both values', () => {
        endInput.value = 50;
        fixture.componentInstance.min = 60;
        fixture.detectChanges();
        checkInput(startInput, {min: 60, max: 60, value: 60, translateX: 0});
        checkInput(endInput, {min: 60, max: 75, value: 60, translateX: 0});
      });

      it('where the new start tx is greater than the old end tx', () => {
        fixture.componentInstance.min = 0;
        fixture.componentInstance.max = 100;
        fixture.detectChanges();

        slideToValue(slider, startInput, 10, platform.IOS);
        slideToValue(slider, endInput, 20, platform.IOS);

        checkInput(startInput, {min: 0, max: 20, value: 10, translateX: 30});
        checkInput(endInput, {min: 10, max: 100, value: 20, translateX: 60});

        fixture.componentInstance.min = -1000;
        fixture.detectChanges();

        checkInput(startInput, {min: -1000, max: 20, value: 10, translateX: 275});
        checkInput(endInput, {min: 10, max: 100, value: 20, translateX: 278});
      });

      it('where the new end tx is less than the old start tx', () => {
        fixture.componentInstance.min = 0;
        fixture.componentInstance.max = 100;
        fixture.detectChanges();

        slideToValue(slider, endInput, 92, platform.IOS);
        slideToValue(slider, startInput, 91, platform.IOS);

        checkInput(startInput, {min: 0, max: 92, value: 91, translateX: 273});
        checkInput(endInput, {min: 91, max: 100, value: 92, translateX: 276});

        fixture.componentInstance.min = 90;
        fixture.detectChanges();

        checkInput(startInput, {min: 90, max: 92, value: 91, translateX: 30});
        checkInput(endInput, {min: 91, max: 100, value: 92, translateX: 60});
      });

      it('that make min and max equal', () => {
        fixture.componentInstance.min = 75;
        fixture.detectChanges();

        checkInput(startInput, {min: 75, max: 75, value: 75, translateX: 0});
        checkInput(endInput, {min: 75, max: 75, value: 75, translateX: 0});
      });

      it('that increase above the max', () => {
        fixture.componentInstance.min = 80;
        fixture.detectChanges();

        checkInput(startInput, {min: 80, max: 75, value: 80, translateX: 0});
        checkInput(endInput, {min: 80, max: 75, value: 80, translateX: 0});
      });
    });

    describe('should handle max changes', () => {
      it('that do not affect values', () => {
        checkInput(startInput, {min: 25, max: 75, value: 25, translateX: 0});
        checkInput(endInput, {min: 25, max: 75, value: 75, translateX: 300});

        fixture.componentInstance.max = 125;
        fixture.detectChanges();

        checkInput(startInput, {min: 25, max: 75, value: 25, translateX: 0});
        checkInput(endInput, {min: 25, max: 125, value: 75, translateX: 150});
      });

      it('that affect the end value', () => {
        fixture.componentInstance.max = 50;
        fixture.detectChanges();
        checkInput(endInput, {min: 25, max: 50, value: 50, translateX: 300});
        checkInput(startInput, {min: 25, max: 50, value: 25, translateX: 0});
      });

      it('that affect both values', () => {
        startInput.value = 60;
        fixture.componentInstance.max = 50;
        fixture.detectChanges();
        checkInput(endInput, {min: 50, max: 50, value: 50, translateX: 300});
        checkInput(startInput, {min: 25, max: 50, value: 50, translateX: 300});
      });

      it('where the new start tx is greater than the old end tx', () => {
        fixture.componentInstance.min = 0;
        fixture.componentInstance.max = 100;
        fixture.detectChanges();

        slideToValue(slider, startInput, 1, platform.IOS);
        slideToValue(slider, endInput, 2, platform.IOS);

        checkInput(startInput, {min: 0, max: 2, value: 1, translateX: 3});
        checkInput(endInput, {min: 1, max: 100, value: 2, translateX: 6});

        fixture.componentInstance.max = 10;
        fixture.detectChanges();

        checkInput(startInput, {min: 0, max: 2, value: 1, translateX: 30});
        checkInput(endInput, {min: 1, max: 10, value: 2, translateX: 60});
      });

      it('where the new end tx is less than the old start tx', () => {
        fixture.componentInstance.min = 0;
        fixture.componentInstance.max = 100;
        fixture.detectChanges();

        slideToValue(slider, endInput, 95, platform.IOS);
        slideToValue(slider, startInput, 90, platform.IOS);

        checkInput(startInput, {min: 0, max: 95, value: 90, translateX: 270});
        checkInput(endInput, {min: 90, max: 100, value: 95, translateX: 285});

        fixture.componentInstance.max = 1000;
        fixture.detectChanges();

        checkInput(startInput, {min: 0, max: 95, value: 90, translateX: 27});
        checkInput(endInput, {min: 90, max: 1000, value: 95, translateX: 28});
      });

      it('that make min and max equal', () => {
        fixture.componentInstance.max = 25;
        fixture.detectChanges();

        checkInput(startInput, {min: 25, max: 25, value: 25, translateX: 0});
        checkInput(endInput, {min: 25, max: 25, value: 25, translateX: 0});
      });

      it('that decrease below the min', () => {
        fixture.componentInstance.max = 0;
        fixture.detectChanges();

        checkInput(startInput, {min: 25, max: 0, value: 25, translateX: 0});
        checkInput(endInput, {min: 25, max: 0, value: 25, translateX: 0});
      });
    });
  });

  describe('disabled slider', () => {
    let slider: MatSlider;
    let input: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(DisabledSlider);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      slider = sliderDebugElement.componentInstance;
      input = slider._getInput(Thumb.END) as MatSliderThumb;
    }));

    it('should be disabled', () => {
      expect(slider.disabled).toBeTrue();
    });

    it('should have the disabled class on the root element', () => {
      expect(slider._elementRef.nativeElement.classList).toContain('mdc-slider--disabled');
    });

    it('should set the disabled attribute on the input element', () => {
      expect(input._hostElement.disabled).toBeTrue();
    });
  });

  describe('disabled range slider', () => {
    let slider: MatSlider;
    let startInput: MatSliderThumb;
    let endInput: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(DisabledRangeSlider);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      slider = sliderDebugElement.componentInstance;
      startInput = slider._getInput(Thumb.START) as MatSliderRangeThumb;
      endInput = slider._getInput(Thumb.END) as MatSliderRangeThumb;
    }));

    it('should be disabled', () => {
      expect(slider.disabled).toBeTrue();
    });

    it('should have the disabled class on the root element', () => {
      expect(slider._elementRef.nativeElement.classList).toContain('mdc-slider--disabled');
    });

    it('should set the disabled attribute on the input elements', () => {
      expect(startInput._hostElement.disabled).toBeTrue();
      expect(endInput._hostElement.disabled).toBeTrue();
    });
  });

  describe('ripple states', () => {
    let input: MatSliderThumb;
    let thumbInstance: MatSliderVisualThumb;
    let thumbElement: HTMLElement;
    let thumbX: number;
    let thumbY: number;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(StandardSlider);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      const slider = sliderDebugElement.componentInstance;
      input = slider._getInput(Thumb.END) as MatSliderThumb;
      thumbInstance = slider._getThumb(Thumb.END);
      thumbElement = thumbInstance._getHostElement();
      const thumbDimensions = thumbElement.getBoundingClientRect();
      thumbX = thumbDimensions.left + thumbDimensions.width / 2;
      thumbY = thumbDimensions.top + thumbDimensions.height / 2;
    }));

    function isRippleVisible(selector: string) {
      flushRippleTransitions();
      return thumbElement.querySelector(`.mat-mdc-slider-${selector}-ripple`) !== null;
    }

    function flushRippleTransitions() {
      thumbElement.querySelectorAll('.mat-ripple-element').forEach(el => {
        dispatchFakeEvent(el, 'transitionend');
      });
    }

    function blur() {
      input._hostElement.blur();
    }

    function pointerenter() {
      dispatchPointerOrTouchEvent(
        input._hostElement,
        PointerEventType.POINTER_MOVE,
        thumbX,
        thumbY,
        platform.IOS,
      );
    }

    function pointerleave() {
      dispatchPointerOrTouchEvent(
        input._hostElement,
        PointerEventType.POINTER_MOVE,
        thumbX + 1000,
        thumbY,
        platform.IOS,
      );
    }

    function pointerdown() {
      dispatchPointerOrTouchEvent(
        input._hostElement,
        PointerEventType.POINTER_DOWN,
        thumbX,
        thumbY,
        platform.IOS,
      );
      input.focus();
    }

    function pointerup() {
      dispatchPointerOrTouchEvent(
        input._hostElement,
        PointerEventType.POINTER_UP,
        thumbX,
        thumbY,
        platform.IOS,
      );
    }

    it('should show the hover ripple on pointerenter', fakeAsync(() => {
      expect(isRippleVisible('hover')).toBeFalse();
      pointerenter();
      expect(isRippleVisible('hover')).toBeTrue();
    }));

    it('should hide the hover ripple on pointerleave', fakeAsync(() => {
      pointerenter();
      pointerleave();
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
      pointerenter();
      expect(isRippleVisible('hover')).toBeFalse();
    }));

    it('should hide the hover ripple if the thumb is focused', fakeAsync(() => {
      pointerenter();
      pointerdown();
      expect(isRippleVisible('hover')).toBeFalse();
    }));

    it('should not hide the focus ripple if the thumb is pressed', fakeAsync(() => {
      pointerdown();
      blur();
      expect(isRippleVisible('focus')).toBeTrue();
    }));

    it('should not hide the hover ripple on blur if the thumb is hovered', fakeAsync(() => {
      pointerenter();
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

  describe('slider with set value', () => {
    let slider: MatSlider;
    let input: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(SliderWithValue);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      slider = sliderDebugElement.componentInstance;
      input = slider._getInput(Thumb.END) as MatSliderThumb;
    }));

    it('should set the default value from the attribute', () => {
      checkInput(input, {min: 0, max: 100, value: 50, translateX: 150});
    });

    it('should update the value', () => {
      slideToValue(slider, input, 75, platform.IOS);
      checkInput(input, {min: 0, max: 100, value: 75, translateX: 225});
    });
  });

  describe('range slider with set value', () => {
    let slider: MatSlider;
    let startInput: MatSliderThumb;
    let endInput: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(RangeSliderWithValue);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      slider = sliderDebugElement.componentInstance;
      startInput = slider._getInput(Thumb.START) as MatSliderRangeThumb;
      endInput = slider._getInput(Thumb.END) as MatSliderRangeThumb;
    }));

    it('should set the correct initial values', () => {
      checkInput(startInput, {min: 0, max: 75, value: 25, translateX: 75});
      checkInput(endInput, {min: 25, max: 100, value: 75, translateX: 225});
    });

    it('should update the start value', () => {
      slideToValue(slider, startInput, 30, platform.IOS);
      checkInput(startInput, {min: 0, max: 75, value: 30, translateX: 90});
      checkInput(endInput, {min: 30, max: 100, value: 75, translateX: 225});
    });

    it('should update the end value', () => {
      slideToValue(slider, endInput, 77, platform.IOS);
      checkInput(startInput, {min: 0, max: 77, value: 25, translateX: 75});
      checkInput(endInput, {min: 25, max: 100, value: 77, translateX: 231});
    });
  });

  describe('slider with set step', () => {
    let fixture: ComponentFixture<SliderWithStep>;
    let slider: MatSlider;
    let input: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(SliderWithStep);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      slider = sliderDebugElement.componentInstance;
      input = slider._getInput(Thumb.END) as MatSliderThumb;
    }));

    it('should update to the value based on the step', () => {
      slideToValue(slider, input, 30, platform.IOS);
      expect(input.value).toBe(25);
    });

    it('should not add decimals to the value if it is a whole number', () => {
      fixture.componentInstance.step = 0.1;
      fixture.detectChanges();
      slideToValue(slider, input, 11, platform.IOS);
      expect(input.value).toBe(11);
    });

    it('should truncate long decimal values when using a decimal step', () => {
      fixture.componentInstance.step = 0.5;
      fixture.detectChanges();
      slideToValue(slider, input, 55.555, platform.IOS);
      expect(input.value).toBe(55.5);
    });

    it('should update the value on step change', () => {
      slideToValue(slider, input, 30, platform.IOS);
      fixture.componentInstance.step = 50;
      fixture.detectChanges();
      expect(input.value).toBe(50);
    });
  });

  describe('range slider with set step', () => {
    let fixture: ComponentFixture<RangeSliderWithStep>;
    let slider: MatSlider;
    let startInput: MatSliderThumb;
    let endInput: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(RangeSliderWithStep);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      slider = sliderDebugElement.componentInstance;
      startInput = slider._getInput(Thumb.START) as MatSliderRangeThumb;
      endInput = slider._getInput(Thumb.END) as MatSliderRangeThumb;
    }));

    it('should set the correct start value on slide', () => {
      slideToValue(slider, startInput, 30, platform.IOS);
      expect(startInput.value).toBe(25);
    });

    it('should set the correct end value on slide', () => {
      slideToValue(slider, endInput, 45, platform.IOS);
      expect(endInput.value).toBe(50);
    });

    it('should not add decimals to the end value if it is a whole number', () => {
      fixture.componentInstance.step = 0.1;
      fixture.detectChanges();
      slideToValue(slider, endInput, 11, platform.IOS);
      expect(endInput.value).toBe(11);
    });

    it('should not add decimals to the start value if it is a whole number', () => {
      fixture.componentInstance.step = 0.1;
      fixture.detectChanges();
      slideToValue(slider, startInput, 11, platform.IOS);
      expect(startInput.value).toBe(11);
    });

    it('should truncate long decimal start values when using a decimal step', () => {
      fixture.componentInstance.step = 0.1;
      fixture.detectChanges();
      slideToValue(slider, startInput, 33.666, platform.IOS);
      expect(startInput.value).toBe(33.7);
    });

    it('should truncate long decimal end values when using a decimal step', () => {
      fixture.componentInstance.step = 0.1;
      fixture.detectChanges();
      slideToValue(slider, endInput, 33.6666, platform.IOS);
      expect(endInput.value).toBe(33.7);
    });

    describe('should handle step changes', () => {
      it('where the new start tx is greater than the old end tx', () => {
        fixture.componentInstance.step = 0;
        fixture.detectChanges();

        slideToValue(slider, startInput, 45, platform.IOS);
        slideToValue(slider, endInput, 46, platform.IOS);

        checkInput(startInput, {min: 0, max: 46, value: 45, translateX: 135});
        checkInput(endInput, {min: 45, max: 100, value: 46, translateX: 138});

        fixture.componentInstance.step = 50;
        fixture.detectChanges();

        checkInput(startInput, {min: 0, max: 50, value: 50, translateX: 150});
        checkInput(endInput, {min: 50, max: 100, value: 50, translateX: 150});
      });

      it('where the new end tx is less than the old start tx', () => {
        fixture.componentInstance.step = 0;
        fixture.detectChanges();

        slideToValue(slider, startInput, 21, platform.IOS);
        slideToValue(slider, endInput, 22, platform.IOS);

        checkInput(startInput, {min: 0, max: 22, value: 21, translateX: 63});
        checkInput(endInput, {min: 21, max: 100, value: 22, translateX: 66});

        fixture.componentInstance.step = 50;
        fixture.detectChanges();

        checkInput(startInput, {min: 0, max: 0, value: 0, translateX: 0});
        checkInput(endInput, {min: 0, max: 100, value: 0, translateX: 0});
      });
    });
  });

  describe('slider with custom thumb label formatting', () => {
    let fixture: ComponentFixture<DiscreteSliderWithDisplayWith>;
    let slider: MatSlider;
    let input: MatSliderThumb;
    let valueIndicatorTextElement: Element;

    beforeEach(() => {
      fixture = createComponent(DiscreteSliderWithDisplayWith);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider))!;
      const sliderNativeElement = sliderDebugElement.nativeElement;
      slider = sliderDebugElement.componentInstance;
      valueIndicatorTextElement = sliderNativeElement.querySelector(
        '.mdc-slider__value-indicator-text',
      )!;
      input = slider._getInput(Thumb.END) as MatSliderThumb;
    });

    it('should set the aria-valuetext attribute with the given `displayWith` function', () => {
      expect(input._hostElement.getAttribute('aria-valuetext')).toBe('$1');
      slider._setValue(10000, Thumb.END);
      expect(input._hostElement.getAttribute('aria-valuetext')).toBe('$10k');
    });

    it('should invoke the passed-in `displayWith` function with the value', () => {
      spyOn(slider, 'displayWith').and.callThrough();
      slider._setValue(1337, Thumb.END);
      expect(slider.displayWith).toHaveBeenCalledWith(1337);
    });

    it('should format the thumb label based on the passed-in `displayWith` function', () => {
      slider._setValue(200000, Thumb.END);
      fixture.detectChanges();
      expect(valueIndicatorTextElement.textContent).toBe('$200k');
    });
  });

  describe('range slider with custom thumb label formatting', () => {
    let fixture: ComponentFixture<DiscreteRangeSliderWithDisplayWith>;
    let slider: MatSlider;
    let startValueIndicatorTextElement: Element;
    let endValueIndicatorTextElement: Element;
    let startInput: MatSliderThumb;
    let endInput: MatSliderThumb;

    beforeEach(() => {
      fixture = createComponent(DiscreteRangeSliderWithDisplayWith);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider))!;
      slider = sliderDebugElement.componentInstance;
      startInput = slider._getInput(Thumb.START) as MatSliderRangeThumb;
      endInput = slider._getInput(Thumb.END) as MatSliderRangeThumb;

      const startThumbElement = slider._getThumb(Thumb.START)._getHostElement();
      const endThumbElement = slider._getThumb(Thumb.END)._getHostElement();
      startValueIndicatorTextElement = startThumbElement.querySelector(
        '.mdc-slider__value-indicator-text',
      )!;
      endValueIndicatorTextElement = endThumbElement.querySelector(
        '.mdc-slider__value-indicator-text',
      )!;
    });

    it('should set the aria-valuetext attribute with the given `displayWith` function', () => {
      expect(startInput._hostElement.getAttribute('aria-valuetext')).toBe('$1');
      expect(endInput._hostElement.getAttribute('aria-valuetext')).toBe('$1000k');
      slider._setValue(250000, Thumb.START);
      slider._setValue(810000, Thumb.END);
      expect(startInput._hostElement.getAttribute('aria-valuetext')).toBe('$250k');
      expect(endInput._hostElement.getAttribute('aria-valuetext')).toBe('$810k');
    });

    it('should invoke the passed-in `displayWith` function with the start value', () => {
      spyOn(slider, 'displayWith').and.callThrough();
      slider._setValue(1337, Thumb.START);
      expect(slider.displayWith).toHaveBeenCalledWith(1337);
    });

    it('should invoke the passed-in `displayWith` function with the end value', () => {
      spyOn(slider, 'displayWith').and.callThrough();
      slider._setValue(5996, Thumb.END);
      expect(slider.displayWith).toHaveBeenCalledWith(5996);
    });

    it('should format the start thumb label based on the passed-in `displayWith` function', () => {
      slider._setValue(200000, Thumb.START);
      fixture.detectChanges();
      expect(startValueIndicatorTextElement.textContent).toBe('$200k');
    });

    it('should format the end thumb label based on the passed-in `displayWith` function', () => {
      slider._setValue(700000, Thumb.END);
      fixture.detectChanges();
      expect(endValueIndicatorTextElement.textContent).toBe('$700k');
    });
  });

  describe('slider with value property binding', () => {
    let fixture: ComponentFixture<SliderWithOneWayBinding>;
    let input: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(SliderWithOneWayBinding);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      const slider = sliderDebugElement.componentInstance;
      input = slider._getInput(Thumb.END) as MatSliderThumb;
    }));

    it('should update when bound value changes', () => {
      fixture.componentInstance.value = 75;
      fixture.detectChanges();
      expect(input.value).toBe(75);
    });
  });

  describe('range slider with value property binding', () => {
    let fixture: ComponentFixture<RangeSliderWithOneWayBinding>;
    let startInput: MatSliderThumb;
    let endInput: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(RangeSliderWithOneWayBinding);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      const slider = sliderDebugElement.componentInstance;
      startInput = slider._getInput(Thumb.START) as MatSliderRangeThumb;
      endInput = slider._getInput(Thumb.END) as MatSliderRangeThumb;
    }));

    it('should update when bound start value changes', () => {
      fixture.componentInstance.startValue = 30;
      fixture.detectChanges();
      expect(startInput.value).toBe(30);
    });

    it('should update when bound end value changes', () => {
      fixture.componentInstance.endValue = 70;
      fixture.detectChanges();
      expect(endInput.value).toBe(70);
    });
  });

  describe('slider with direction', () => {
    let slider: MatSlider;
    let input: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(StandardSlider, [
        {
          provide: Directionality,
          useValue: {value: 'rtl', change: of()},
        },
      ]);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      slider = sliderDebugElement.componentInstance;
      input = slider._getInput(Thumb.END) as MatSliderThumb;
    }));

    it('works in RTL languages', () => {
      setValueByClick(slider, input, 25, platform.IOS, true);
      checkInput(input, {min: 0, max: 100, value: 75, translateX: 75});
    });
  });

  describe('range slider with direction', () => {
    let slider: MatSlider;
    let startInput: MatSliderThumb;
    let endInput: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(StandardRangeSlider, [
        {
          provide: Directionality,
          useValue: {value: 'rtl', change: of()},
        },
      ]);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      slider = sliderDebugElement.componentInstance;
      startInput = slider._getInput(Thumb.START) as MatSliderRangeThumb;
      endInput = slider._getInput(Thumb.END) as MatSliderRangeThumb;
    }));

    it('works in RTL languages', () => {
      setValueByClick(slider, startInput, 90, platform.IOS, true);
      checkInput(startInput, {min: 0, max: 100, value: 10, translateX: 270});

      setValueByClick(slider, endInput, 10, platform.IOS, true);
      checkInput(endInput, {min: 10, max: 100, value: 90, translateX: 30});
    });
  });

  describe('slider with ngModel', () => {
    let fixture: ComponentFixture<SliderWithNgModel>;
    let slider: MatSlider;
    let input: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(SliderWithNgModel);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      slider = sliderDebugElement.componentInstance;
      input = slider._getInput(Thumb.END) as MatSliderThumb;
    }));

    it('should update the model', () => {
      slideToValue(slider, input, 19, platform.IOS);
      fixture.detectChanges();
      expect(fixture.componentInstance.val).toBe('19');
      checkInput(input, {min: 0, max: 100, value: 19, translateX: 57});
    });

    it('should update the slider', fakeAsync(() => {
      fixture.componentInstance.val = '20';
      fixture.detectChanges();
      flush();
      checkInput(input, {min: 0, max: 100, value: 20, translateX: 60});
    }));

    it('should be able to reset a slider by setting the model back to undefined', fakeAsync(() => {
      fixture.componentInstance.val = '5';
      fixture.detectChanges();
      flush();
      checkInput(input, {min: 0, max: 100, value: 5, translateX: 15});

      fixture.componentInstance.val = undefined;
      fixture.detectChanges();
      flush();
      checkInput(input, {min: 0, max: 100, value: 50, translateX: 150});
    }));
  });

  describe('range slider with ngModel', () => {
    let slider: MatSlider;
    let fixture: ComponentFixture<RangeSliderWithNgModel>;
    let startInput: MatSliderThumb;
    let endInput: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(RangeSliderWithNgModel);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      slider = sliderDebugElement.componentInstance;
      startInput = slider._getInput(Thumb.START) as MatSliderRangeThumb;
      endInput = slider._getInput(Thumb.END) as MatSliderRangeThumb;
    }));

    it('should update the models on input value changes', fakeAsync(() => {
      slideToValue(slider, startInput, 25, platform.IOS);
      fixture.detectChanges();
      flush();
      checkInput(startInput, {min: 0, max: 100, value: 25, translateX: 75});

      slideToValue(slider, endInput, 75, platform.IOS);
      fixture.detectChanges();
      flush();
      checkInput(endInput, {min: 25, max: 100, value: 75, translateX: 225});
    }));

    it('should update the thumbs on ngModel value change', fakeAsync(() => {
      fixture.componentInstance.startVal = '50';
      fixture.detectChanges();
      flush();
      checkInput(startInput, {min: 0, max: 100, value: 50, translateX: 150});

      fixture.componentInstance.endVal = '75';
      fixture.detectChanges();
      flush();
      checkInput(endInput, {min: 50, max: 100, value: 75, translateX: 225});
    }));

    it('should be able to reset a start input', fakeAsync(() => {
      fixture.componentInstance.startVal = '5';
      fixture.detectChanges();
      flush();
      checkInput(startInput, {min: 0, max: 100, value: 5, translateX: 15});

      fixture.componentInstance.startVal = undefined;
      fixture.detectChanges();
      flush();
      checkInput(startInput, {min: 0, max: 100, value: 50, translateX: 150});
    }));

    it('should be able to reset an end input', fakeAsync(() => {
      fixture.componentInstance.endVal = '99';
      fixture.detectChanges();
      flush();
      checkInput(endInput, {min: 0, max: 100, value: 99, translateX: 297});

      fixture.componentInstance.endVal = undefined;
      fixture.detectChanges();
      flush();
      checkInput(endInput, {min: 0, max: 100, value: 50, translateX: 150});
    }));
  });

  describe('slider as a custom form control', () => {
    let fixture: ComponentFixture<SliderWithFormControl>;
    let slider: MatSlider;
    let input: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(SliderWithFormControl);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      slider = sliderDebugElement.componentInstance;
      input = slider._getInput(Thumb.END) as MatSliderThumb;
    }));

    it('should update the control on slide', () => {
      expect(fixture.componentInstance.control.value).toBe('0');
      slideToValue(slider, input, 19, platform.IOS);
      expect(fixture.componentInstance.control.value).toBe('19');
    });

    it('should update the value when the control is set', () => {
      expect(input.value).toBe(0);
      fixture.componentInstance.control.setValue('7');
      checkInput(input, {min: 0, max: 100, value: 7, translateX: 21});
    });

    it('should update the disabled state when control is disabled', fakeAsync(() => {
      expect(slider.disabled).toBe(false);
      fixture.componentInstance.control.disable();
      expect(slider.disabled).toBe(true);
    }));

    it('should update the disabled state when the control is enabled', () => {
      slider.disabled = true;
      fixture.componentInstance.control.enable();
      expect(slider.disabled).toBe(false);
    });

    it('should have the correct control state initially and after interaction', () => {
      let sliderControl = fixture.componentInstance.control;

      // The control should start off valid, pristine, and untouched.
      expect(sliderControl.valid).toBe(true);
      expect(sliderControl.pristine).toBe(true);
      expect(sliderControl.touched).toBe(false);

      // After changing the value, the control should become dirty (not pristine),
      // but remain untouched.
      setValueByClick(slider, input, 50, platform.IOS);

      expect(sliderControl.valid).toBe(true);
      expect(sliderControl.pristine).toBe(false);
      expect(sliderControl.touched).toBe(false);

      // If the control has been visited due to interaction, the control should remain
      // dirty and now also be touched.
      input.blur();
      fixture.detectChanges();

      expect(sliderControl.valid).toBe(true);
      expect(sliderControl.pristine).toBe(false);
      expect(sliderControl.touched).toBe(true);
    });
  });

  describe('slider as a custom form control', () => {
    let fixture: ComponentFixture<RangeSliderWithFormControl>;
    let slider: MatSlider;
    let startInput: MatSliderThumb;
    let endInput: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(RangeSliderWithFormControl);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      slider = sliderDebugElement.componentInstance;
      startInput = slider._getInput(Thumb.START) as MatSliderRangeThumb;
      endInput = slider._getInput(Thumb.END) as MatSliderRangeThumb;
    }));

    it('should update the start input control on slide', () => {
      expect(fixture.componentInstance.startInputControl.value).toBe('0');
      slideToValue(slider, startInput, 20, platform.IOS);
      expect(fixture.componentInstance.startInputControl.value).toBe('20');
    });

    it('should update the end input control on slide', () => {
      expect(fixture.componentInstance.endInputControl.value).toBe('100');
      slideToValue(slider, endInput, 80, platform.IOS);
      expect(fixture.componentInstance.endInputControl.value).toBe('80');
    });

    it('should update the start input value when the start input control is set', () => {
      expect(startInput.value).toBe(0);
      fixture.componentInstance.startInputControl.setValue('10');
      checkInput(startInput, {min: 0, max: 100, value: 10, translateX: 30});
    });

    it('should update the end input value when the end input control is set', () => {
      expect(endInput.value).toBe(100);
      fixture.componentInstance.endInputControl.setValue('90');
      checkInput(endInput, {min: 0, max: 100, value: 90, translateX: 270});
    });

    it('should update the disabled state if the start input control is disabled', () => {
      expect(slider.disabled).toBe(false);
      fixture.componentInstance.startInputControl.disable();
      expect(slider.disabled).toBe(true);
    });

    it('should update the disabled state if the end input control is disabled', () => {
      expect(slider.disabled).toBe(false);
      fixture.componentInstance.endInputControl.disable();
      expect(slider.disabled).toBe(true);
    });

    it('should update the disabled state when both input controls are enabled', () => {
      slider.disabled = true;
      fixture.componentInstance.startInputControl.enable();
      expect(slider.disabled).toBe(false);
      fixture.componentInstance.endInputControl.enable();
      expect(slider.disabled).toBe(false);
    });

    it('should have the correct start input control state initially and after interaction', () => {
      let sliderControl = fixture.componentInstance.startInputControl;

      // The control should start off valid, pristine, and untouched.
      expect(sliderControl.valid).toBe(true);
      expect(sliderControl.pristine).toBe(true);
      expect(sliderControl.touched).toBe(false);

      // After changing the value, the control should become dirty (not pristine),
      // but remain untouched.
      setValueByClick(slider, startInput, 25, platform.IOS);

      expect(sliderControl.valid).toBe(true);
      expect(sliderControl.pristine).toBe(false);
      expect(sliderControl.touched).toBe(false);

      // If the control has been visited due to interaction, the control should remain
      // dirty and now also be touched.
      startInput.blur();
      fixture.detectChanges();

      expect(sliderControl.valid).toBe(true);
      expect(sliderControl.pristine).toBe(false);
      expect(sliderControl.touched).toBe(true);
    });

    it('should have the correct start input control state initially and after interaction', () => {
      let sliderControl = fixture.componentInstance.endInputControl;

      // The control should start off valid, pristine, and untouched.
      expect(sliderControl.valid).toBe(true);
      expect(sliderControl.pristine).toBe(true);
      expect(sliderControl.touched).toBe(false);

      // After changing the value, the control should become dirty (not pristine),
      // but remain untouched.
      setValueByClick(slider, endInput, 75, platform.IOS);

      expect(sliderControl.valid).toBe(true);
      expect(sliderControl.pristine).toBe(false);
      expect(sliderControl.touched).toBe(false);

      // If the control has been visited due to interaction, the control should remain
      // dirty and now also be touched.
      endInput.blur();
      fixture.detectChanges();

      expect(sliderControl.valid).toBe(true);
      expect(sliderControl.pristine).toBe(false);
      expect(sliderControl.touched).toBe(true);
    });
  });

  describe('slider with a two-way binding', () => {
    let input: MatSliderThumb;
    let slider: MatSlider;
    let fixture: ComponentFixture<SliderWithTwoWayBinding>;

    beforeEach(() => {
      fixture = createComponent(SliderWithTwoWayBinding);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      slider = sliderDebugElement.componentInstance;
      input = slider._getInput(Thumb.END) as MatSliderThumb;
    });

    it('should sync the value binding in both directions', () => {
      checkInput(input, {min: 0, max: 100, value: 0, step: 0, translateX: 0});

      slideToValue(slider, input, 10, platform.IOS);
      expect(fixture.componentInstance.value).toBe('10');
      checkInput(input, {min: 0, max: 100, value: 10, step: 0, translateX: 30});

      fixture.componentInstance.value = '20';
      fixture.detectChanges();
      expect(fixture.componentInstance.value).toBe('20');
      checkInput(input, {min: 0, max: 100, value: 20, step: 0, translateX: 60});
    });
  });

  describe('range slider with a two-way binding', () => {
    let slider: MatSlider;
    let startInput: MatSliderRangeThumb;
    let endInput: MatSliderRangeThumb;
    let fixture: ComponentFixture<RangeSliderWithTwoWayBinding>;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(RangeSliderWithTwoWayBinding);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      slider = sliderDebugElement.componentInstance;
      endInput = slider._getInput(Thumb.END) as MatSliderRangeThumb;
      startInput = slider._getInput(Thumb.START) as MatSliderRangeThumb;
    }));

    it('should sync the start value binding in both directions', () => {
      expect(fixture.componentInstance.startValue).toBe('0');
      expect(startInput.value).toBe(0);

      slideToValue(slider, startInput, 10, platform.IOS);

      expect(fixture.componentInstance.startValue).toBe('10');
      expect(startInput.value).toBe(10);

      fixture.componentInstance.startValue = '20';
      fixture.detectChanges();
      expect(fixture.componentInstance.startValue).toBe('20');
      expect(startInput.value).toBe(20);
    });

    it('should sync the end value binding in both directions', () => {
      expect(fixture.componentInstance.endValue).toBe('100');
      expect(endInput.value).toBe(100);

      slideToValue(slider, endInput, 90, platform.IOS);
      expect(fixture.componentInstance.endValue).toBe('90');
      expect(endInput.value).toBe(90);

      fixture.componentInstance.endValue = '80';
      fixture.detectChanges();
      expect(fixture.componentInstance.endValue).toBe('80');
      expect(endInput.value).toBe(80);
    });
  });
});

const SLIDER_STYLES = ['.mat-mdc-slider { width: 348px; }'];

@Component({
  template: `
  <mat-slider>
    <input matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class StandardSlider {}

@Component({
  template: `
  <mat-slider>
    <input matSliderStartThumb>
    <input matSliderEndThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class StandardRangeSlider {}

@Component({
  template: `
  <mat-slider disabled>
    <input matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class DisabledSlider {}

@Component({
  template: `
  <mat-slider disabled>
    <input matSliderStartThumb>
    <input matSliderEndThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class DisabledRangeSlider {}

@Component({
  template: `
  <mat-slider [min]="min" [max]="max">
    <input matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class SliderWithMinAndMax {
  min = 25;
  max = 75;
}

@Component({
  template: `
  <mat-slider [min]="min" [max]="max">
    <input matSliderStartThumb>
    <input matSliderEndThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class RangeSliderWithMinAndMax {
  min = 25;
  max = 75;
}

@Component({
  template: `
  <mat-slider>
    <input value="50" matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class SliderWithValue {}

@Component({
  template: `
  <mat-slider>
    <input value="25" matSliderStartThumb>
    <input value="75" matSliderEndThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class RangeSliderWithValue {}

@Component({
  template: `
  <mat-slider [step]="step">
    <input matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class SliderWithStep {
  step = 25;
}

@Component({
  template: `
  <mat-slider [step]="step">
    <input matSliderStartThumb>
    <input matSliderEndThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class RangeSliderWithStep {
  step = 25;
}

@Component({
  template: `
  <mat-slider [displayWith]="displayWith" min="1" max="1000000" discrete>
    <input matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class DiscreteSliderWithDisplayWith {
  displayWith(v: number) {
    if (v >= 1000) {
      return `$${v / 1000}k`;
    }
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
  styles: SLIDER_STYLES,
})
class DiscreteRangeSliderWithDisplayWith {
  displayWith(v: number) {
    if (v >= 1000) {
      return `$${v / 1000}k`;
    }
    return `$${v}`;
  }
}

@Component({
  template: `
  <mat-slider>
    <input [value]="value" matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
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
  styles: SLIDER_STYLES,
})
class RangeSliderWithOneWayBinding {
  startValue = 25;
  endValue = 75;
}

@Component({
  template: `
  <mat-slider>
    <input [(ngModel)]="val" matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class SliderWithNgModel {
  @ViewChild(MatSlider) slider: MatSlider;
  val: string | undefined = '0';
}

@Component({
  template: `
  <mat-slider>
    <input [(ngModel)]="startVal" matSliderStartThumb>
    <input [(ngModel)]="endVal" matSliderEndThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class RangeSliderWithNgModel {
  @ViewChild(MatSlider) slider: MatSlider;
  startVal: string | undefined = '0';
  endVal: string | undefined = '100';
}

@Component({
  template: `
  <mat-slider>
    <input [formControl]="control" matSliderThumb>
  </mat-slider>`,
  styles: SLIDER_STYLES,
})
class SliderWithFormControl {
  control = new FormControl('0');
}

@Component({
  template: `
  <mat-slider>
    <input [formControl]="startInputControl" matSliderStartThumb>
    <input [formControl]="endInputControl" matSliderEndThumb>
  </mat-slider>`,
  styles: SLIDER_STYLES,
})
class RangeSliderWithFormControl {
  startInputControl = new FormControl('0');
  endInputControl = new FormControl('100');
}

@Component({
  template: `
  <mat-slider>
    <input [(value)]="value" matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class SliderWithTwoWayBinding {
  value = '0';
}

@Component({
  template: `
  <mat-slider>
    <input [(value)]="startValue" matSliderStartThumb>
    <input [(value)]="endValue" matSliderEndThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class RangeSliderWithTwoWayBinding {
  @ViewChild(MatSlider) slider: MatSlider;
  @ViewChildren(MatSliderThumb) sliderInputs: QueryList<MatSliderThumb>;
  startValue = '0';
  endValue = '100';
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
function setValueByClick(
  slider: MatSlider,
  input: MatSliderThumb,
  value: number,
  isIOS: boolean,
  isRtl: boolean = false,
) {
  const inputElement = input._elementRef.nativeElement;
  const val = isRtl ? slider.max - value : value;
  const {x, y} = getCoordsForValue(slider, val);

  dispatchPointerOrTouchEvent(inputElement, PointerEventType.POINTER_DOWN, x, y, isIOS);
  input.value = val;
  dispatchEvent(input._hostElement, new Event('input'));
  input.focus();
  dispatchPointerOrTouchEvent(inputElement, PointerEventType.POINTER_UP, x, y, isIOS);
  dispatchEvent(input._hostElement, new Event('change'));
}

/** Slides the MatSlider's thumb to the given value. */
function slideToValue(slider: MatSlider, input: MatSliderThumb, value: number, isIOS: boolean) {
  const sliderElement = slider._elementRef.nativeElement;
  const {x: startX, y: startY} = getCoordsForValue(slider, input.value);
  const {x: endX, y: endY} = getCoordsForValue(slider, value);

  dispatchPointerOrTouchEvent(sliderElement, PointerEventType.POINTER_DOWN, startX, startY, isIOS);
  input.focus();
  dispatchPointerOrTouchEvent(sliderElement, PointerEventType.POINTER_MOVE, endX, endY, isIOS);
  input.value = value;
  dispatchEvent(input._hostElement, new Event('input'));
  dispatchPointerOrTouchEvent(sliderElement, PointerEventType.POINTER_UP, endX, endY, isIOS);
  dispatchEvent(input._hostElement, new Event('change'));
}

/** Returns the x and y coordinates for the given slider value. */
function getCoordsForValue(slider: MatSlider, value: number): Point {
  const {min, max} = slider;
  const percent = (value - min) / (max - min);

  const {top, left, width, height} = slider._elementRef.nativeElement.getBoundingClientRect();
  const x = left + width * percent;
  const y = top + height / 2;

  return {x, y};
}

/** Dispatch a pointerdown or pointerup event if supported, otherwise dispatch the touch event. */
function dispatchPointerOrTouchEvent(
  node: Node,
  type: PointerEventType,
  x: number,
  y: number,
  isIOS: boolean,
) {
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
