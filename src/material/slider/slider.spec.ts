/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BidiModule, Directionality} from '@angular/cdk/bidi';
import {Platform} from '@angular/cdk/platform';
import {dispatchEvent, dispatchFakeEvent, dispatchPointerEvent} from '@angular/cdk/testing/private';
import {Component, Provider, QueryList, Type, ViewChild, ViewChildren} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {of} from 'rxjs';
import {MatSliderModule} from './module';
import {MatSlider} from './slider';
import {MatSliderRangeThumb, MatSliderThumb} from './slider-input';
import {_MatThumb} from './slider-interface';
import {MatSliderVisualThumb} from './slider-thumb';

interface Point {
  x: number;
  y: number;
}

describe('MatSlider', () => {
  let platform: Platform;

  function createComponent<T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [FormsModule, MatSliderModule, ReactiveFormsModule, BidiModule],
      providers: [...providers],
      declarations: [component],
    });
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

    // The discrepancy between the "ideal" and "actual" translateX comes from
    // the 3px offset from the start & end of the slider track to the first
    // and last tick marks.
    //
    // The "actual" translateX is calculated based on a slider that is 6px
    // smaller than the width of the slider. Using this "actual" translateX in
    // tests would make it even more difficult than it already is to tell if
    // the translateX is off, so we abstract things in here so tests can be
    // more intuitive.
    //
    // The most clear way to compare the two tx's is to just turn them into
    // percentages by dividing by their (total height) / 100.
    const idealTXPercentage = Math.round(translateX / 3);
    const actualTXPercentage = Math.round((input.translateX - 3) / 2.94);
    expect(actualTXPercentage)
      .withContext(`translateX: ${input.translateX} should be close to ${translateX}`)
      .toBe(idealTXPercentage);
    if (step !== undefined) {
      expect(input.step).withContext('step').toBe(step);
    }
    if (width !== undefined) {
      const realWidth = parseInt(
        (input as MatSliderRangeThumb)._hostElement.style.width.match(/\d+/)![0],
        10,
      );
      expect(realWidth)
        .withContext('width')
        .toBeCloseTo((300 * width) / 100 + 16, 0);
    }
  }

  // Note that this test is outside of the other `describe` blocks, because they all run
  // `detectChanges` in the `beforeEach` and we're testing specifically what happens if it
  // is destroyed before change detection has run.
  it('should not throw if a slider is destroyed before the first change detection run', () => {
    expect(() => {
      const fixture = createComponent(StandardSlider);
      fixture.destroy();
    }).not.toThrow();
  });

  describe('standard slider', () => {
    let fixture: ComponentFixture<StandardSlider>;
    let slider: MatSlider;
    let input: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(StandardSlider);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      slider = sliderDebugElement.componentInstance;
      input = slider._getInput(_MatThumb.END) as MatSliderThumb;
    }));

    it('should set the default values', () => {
      expect(slider.min).toBe(0);
      expect(slider.max).toBe(100);
      expect(slider.step).toBe(1);
      checkInput(input, {min: 0, max: 100, value: 0, step: 1, translateX: 0});
    });

    it('should update by click', fakeAsync(() => {
      setValueByClick(slider, input, 25);
      checkInput(input, {min: 0, max: 100, value: 25, step: 1, translateX: 75});

      setValueByClick(slider, input, 50);
      checkInput(input, {min: 0, max: 100, value: 50, step: 1, translateX: 150});

      setValueByClick(slider, input, 75);
      checkInput(input, {min: 0, max: 100, value: 75, step: 1, translateX: 225});

      setValueByClick(slider, input, 100);
      checkInput(input, {min: 0, max: 100, value: 100, step: 1, translateX: 300});
    }));

    it('should update by slide', fakeAsync(() => {
      slideToValue(slider, input, 25);
      checkInput(input, {min: 0, max: 100, value: 25, step: 1, translateX: 75});

      slideToValue(slider, input, 50);
      checkInput(input, {min: 0, max: 100, value: 50, step: 1, translateX: 150});

      slideToValue(slider, input, 75);
      checkInput(input, {min: 0, max: 100, value: 75, step: 1, translateX: 225});

      slideToValue(slider, input, 100);
      checkInput(input, {min: 0, max: 100, value: 100, step: 1, translateX: 300});
    }));

    it('should not slide before the track', fakeAsync(() => {
      slideToValue(slider, input, -10);
      expect(input.value).toBe(0);
      checkInput(input, {min: 0, max: 100, value: 0, step: 1, translateX: 0});
    }));

    it('should not slide past the track', fakeAsync(() => {
      slideToValue(slider, input, 110);
      expect(input.value).toBe(100);
      checkInput(input, {min: 0, max: 100, value: 100, step: 1, translateX: 300});
    }));

    // TODO(wagnermaciel): Fix this test case (behavior works as intended in browser).
    // it('should not break when the page layout changes', fakeAsync(async () => {
    //   slider._elementRef.nativeElement.style.marginLeft = '100px';
    //   tick(200);
    //   fixture.detectChanges();
    //   setValueByClick(slider, input, 25);
    //   checkInput(input, {min: 0, max: 100, value: 25, step: 1, translateX: 75});
    //   slider._elementRef.nativeElement.style.marginLeft = 'initial';
    // }));
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
      endInput = slider._getInput(_MatThumb.END) as MatSliderRangeThumb;
      startInput = slider._getInput(_MatThumb.START) as MatSliderRangeThumb;
    }));

    it('should set the default values', () => {
      checkInput(startInput, {min: 0, max: 100, value: 0, step: 1, translateX: 0});
      checkInput(endInput, {min: 0, max: 100, value: 100, step: 1, translateX: 300});

      expect(slider.min).toBe(0);
      expect(slider.max).toBe(100);
      expect(slider.step).toBe(1);
    });

    it('should update by start input click', fakeAsync(() => {
      setValueByClick(slider, startInput, 25);
      checkInput(startInput, {min: 0, max: 100, value: 25, translateX: 75});
      checkInput(endInput, {min: 25, max: 100, value: 100, translateX: 300});
    }));

    it('should update by end input click', fakeAsync(() => {
      setValueByClick(slider, endInput, 75);
      checkInput(startInput, {min: 0, max: 75, value: 0, translateX: 0});
      checkInput(endInput, {min: 0, max: 100, value: 75, translateX: 225});
    }));

    it('should update by start thumb slide', fakeAsync(() => {
      slideToValue(slider, startInput, 75);
      checkInput(startInput, {min: 0, max: 100, value: 75, translateX: 225});
      checkInput(endInput, {min: 75, max: 100, value: 100, translateX: 300});
    }));

    it('should update by end thumb slide', fakeAsync(() => {
      slideToValue(slider, endInput, 25);
      checkInput(startInput, {min: 0, max: 25, value: 0, translateX: 0});
      checkInput(endInput, {min: 0, max: 100, value: 25, translateX: 75});
    }));

    it('should not allow start thumb to slide before the track', fakeAsync(() => {
      slideToValue(slider, startInput, -10);
      checkInput(startInput, {min: 0, max: 100, value: 0, translateX: 0});
      checkInput(endInput, {min: 0, max: 100, value: 100, translateX: 300});
    }));

    it('should not allow end thumb to slide past the track', fakeAsync(() => {
      slideToValue(slider, endInput, 110);
      checkInput(startInput, {min: 0, max: 100, value: 0, translateX: 0});
      checkInput(endInput, {min: 0, max: 100, value: 100, translateX: 300});
    }));

    it('should not allow start thumb to slide past the end thumb', fakeAsync(() => {
      slideToValue(slider, endInput, 50);
      slideToValue(slider, startInput, 55);
      checkInput(startInput, {min: 0, max: 50, value: 50, translateX: 150});
      checkInput(endInput, {min: 50, max: 100, value: 50, translateX: 150});
    }));

    it('should not allow end thumb to slide past the start thumb', fakeAsync(() => {
      slideToValue(slider, startInput, 50);
      slideToValue(slider, endInput, 45);
      checkInput(startInput, {min: 0, max: 50, value: 50, translateX: 150});
      checkInput(endInput, {min: 50, max: 100, value: 50, translateX: 150});
    }));

    // TODO(wagnermaciel): Fix this test case (behavior works as intended in browser).
    // it('should not break when the page layout changes', fakeAsync(() => {
    //   slider._elementRef.nativeElement.style.marginLeft = '100px';
    //   setValueByClick(slider, startInput, 25);
    //   checkInput(startInput, {min: 0, max: 100, value: 25, translateX: 75});
    //   checkInput(endInput, {min: 25, max: 100, value: 100, translateX: 300});

    //   setValueByClick(slider, endInput, 75);
    //   checkInput(startInput, {min: 0, max: 75, value: 25, translateX: 75});
    //   checkInput(endInput, {min: 25, max: 100, value: 75, translateX: 225});
    //   slider._elementRef.nativeElement.style.marginLeft = 'initial';
    // }));
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
      input = slider._getInput(_MatThumb.END) as MatSliderThumb;
    }));

    it('should have the correct initial values', () => {
      checkInput(input, {min: 25, max: 75, value: 25, translateX: 0});
    });

    it('should update the min when the bound value changes', () => {
      fixture.componentInstance.min = 0;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      checkInput(input, {min: 0, max: 75, value: 25, translateX: 100});
    });

    it('should update the max when the bound value changes', () => {
      fixture.componentInstance.max = 90;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      checkInput(input, {min: 25, max: 90, value: 25, translateX: 0});
    });

    it('should update the value if the min increases past it', () => {
      fixture.componentInstance.min = 50;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      checkInput(input, {min: 50, max: 75, value: 50, translateX: 0});
    });

    it('should update the value if the max decreases below it', () => {
      input.value = 75;
      fixture.componentInstance.max = 50;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      checkInput(input, {min: 25, max: 50, value: 50, translateX: 300});
    });

    it('should allow the min increase above the max', () => {
      fixture.componentInstance.min = 80;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      checkInput(input, {min: 80, max: 75, value: 80, translateX: 0});
    });

    it('should allow the max to decrease below the min', () => {
      fixture.componentInstance.max = -10;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      checkInput(input, {min: 25, max: -10, value: 25, translateX: 0});
    });

    it('should update the thumb translateX when the min changes', () => {
      checkInput(input, {min: 25, max: 75, value: 25, translateX: 0});
      fixture.componentInstance.min = -25;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      checkInput(input, {min: -25, max: 75, value: 25, translateX: 150});
    });

    it('should update the thumb translateX when the max changes', fakeAsync(() => {
      setValueByClick(slider, input, 50);
      checkInput(input, {min: 25, max: 75, value: 50, translateX: 150});
      fixture.componentInstance.max = 125;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      checkInput(input, {min: 25, max: 125, value: 50, translateX: 75});
    }));
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
      endInput = slider._getInput(_MatThumb.END) as MatSliderRangeThumb;
      startInput = slider._getInput(_MatThumb.START) as MatSliderRangeThumb;
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
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        checkInput(startInput, {min: -25, max: 75, value: 25, translateX: 150});
        checkInput(endInput, {min: 25, max: 75, value: 75, translateX: 300});
      });

      it('that affect the start value', () => {
        fixture.componentInstance.min = 50;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        checkInput(startInput, {min: 50, max: 75, value: 50, translateX: 0});
        checkInput(endInput, {min: 50, max: 75, value: 75, translateX: 300});
      });

      it('that affect both values', () => {
        endInput.value = 50;
        fixture.componentInstance.min = 60;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        checkInput(startInput, {min: 60, max: 60, value: 60, translateX: 0});
        checkInput(endInput, {min: 60, max: 75, value: 60, translateX: 0});
      });

      it('where the new start tx is greater than the old end tx', fakeAsync(() => {
        fixture.componentInstance.min = 0;
        fixture.componentInstance.max = 100;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        slideToValue(slider, startInput, 10);
        slideToValue(slider, endInput, 20);

        checkInput(startInput, {min: 0, max: 20, value: 10, translateX: 30});
        checkInput(endInput, {min: 10, max: 100, value: 20, translateX: 60});

        fixture.componentInstance.min = -1000;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        checkInput(startInput, {min: -1000, max: 20, value: 10, translateX: 275.5});
        checkInput(endInput, {min: 10, max: 100, value: 20, translateX: 278});
      }));

      it('where the new end tx is less than the old start tx', fakeAsync(() => {
        fixture.componentInstance.min = 0;
        fixture.componentInstance.max = 100;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        slideToValue(slider, endInput, 92);
        slideToValue(slider, startInput, 91);

        checkInput(startInput, {min: 0, max: 92, value: 91, translateX: 273});
        checkInput(endInput, {min: 91, max: 100, value: 92, translateX: 276});

        fixture.componentInstance.min = 90;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        checkInput(startInput, {min: 90, max: 92, value: 91, translateX: 30});
        checkInput(endInput, {min: 91, max: 100, value: 92, translateX: 60});
      }));

      it('that make min and max equal', () => {
        fixture.componentInstance.min = 75;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        checkInput(startInput, {min: 75, max: 75, value: 75, translateX: 0});
        checkInput(endInput, {min: 75, max: 75, value: 75, translateX: 0});
      });

      it('that increase above the max', () => {
        fixture.componentInstance.min = 80;
        fixture.changeDetectorRef.markForCheck();
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
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        checkInput(startInput, {min: 25, max: 75, value: 25, translateX: 0});
        checkInput(endInput, {min: 25, max: 125, value: 75, translateX: 150});
      });

      it('that affect the end value', () => {
        fixture.componentInstance.max = 50;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        checkInput(endInput, {min: 25, max: 50, value: 50, translateX: 300});
        checkInput(startInput, {min: 25, max: 50, value: 25, translateX: 0});
      });

      it('that affect both values', () => {
        startInput.value = 60;
        fixture.componentInstance.max = 50;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        checkInput(endInput, {min: 50, max: 50, value: 50, translateX: 300});
        checkInput(startInput, {min: 25, max: 50, value: 50, translateX: 300});
      });

      it('where the new start tx is greater than the old end tx', fakeAsync(() => {
        fixture.componentInstance.min = 0;
        fixture.componentInstance.max = 100;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        slideToValue(slider, startInput, 1);
        slideToValue(slider, endInput, 2);

        checkInput(startInput, {min: 0, max: 2, value: 1, translateX: 3});
        checkInput(endInput, {min: 1, max: 100, value: 2, translateX: 6});

        fixture.componentInstance.max = 10;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        checkInput(startInput, {min: 0, max: 2, value: 1, translateX: 30});
        checkInput(endInput, {min: 1, max: 10, value: 2, translateX: 60});
      }));

      it('where the new end tx is less than the old start tx', fakeAsync(() => {
        fixture.componentInstance.min = 0;
        fixture.componentInstance.max = 100;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        slideToValue(slider, endInput, 95);
        slideToValue(slider, startInput, 90);

        checkInput(startInput, {min: 0, max: 95, value: 90, translateX: 270});
        checkInput(endInput, {min: 90, max: 100, value: 95, translateX: 285});

        fixture.componentInstance.max = 1000;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        checkInput(startInput, {min: 0, max: 95, value: 90, translateX: 27});
        checkInput(endInput, {min: 90, max: 1000, value: 95, translateX: 28.5});
      }));

      it('that make min and max equal', () => {
        fixture.componentInstance.max = 25;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        checkInput(startInput, {min: 25, max: 25, value: 25, translateX: 0});
        checkInput(endInput, {min: 25, max: 25, value: 25, translateX: 0});
      });

      it('that decrease below the min', () => {
        fixture.componentInstance.max = 0;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        // For some reason there was a bug with Safari 15.3.
        // Manually testing on version 16.0 shows that this issue no longer exists.
        if (!platform.SAFARI) {
          checkInput(startInput, {min: 25, max: 0, value: 25, translateX: 0});
          checkInput(endInput, {min: 25, max: 0, value: 25, translateX: 0});
        }
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
      input = slider._getInput(_MatThumb.END) as MatSliderThumb;
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
      startInput = slider._getInput(_MatThumb.START) as MatSliderRangeThumb;
      endInput = slider._getInput(_MatThumb.END) as MatSliderRangeThumb;
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
      input = slider._getInput(_MatThumb.END) as MatSliderThumb;
      thumbInstance = slider._getThumb(_MatThumb.END);
      thumbElement = thumbInstance._hostElement;
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
      dispatchPointerEvent(input._hostElement, 'pointermove', thumbX, thumbY);
    }

    function pointerleave() {
      dispatchPointerEvent(input._hostElement, 'pointermove', thumbX + 1000, thumbY);
    }

    function pointerdown() {
      dispatchPointerEvent(input._hostElement, 'pointerdown', thumbX, thumbY);
      input.focus();
    }

    function pointerup() {
      dispatchPointerEvent(input._hostElement, 'pointerup', thumbX, thumbY);
    }

    it('should show the hover ripple on pointerenter', fakeAsync(() => {
      // Doesn't make sense to test for pointerenter events on touch devices.
      expect(isRippleVisible('hover')).toBeFalse();
      pointerenter();
      expect(isRippleVisible('hover')).toBeTrue();
    }));

    it('should hide the hover ripple on pointerleave', fakeAsync(() => {
      // Doesn't make sense to test for pointerleave events on touch devices.
      pointerenter();
      pointerleave();
      expect(isRippleVisible('hover')).toBeFalse();
    }));

    it('should show the focus ripple on pointerdown', fakeAsync(() => {
      expect(isRippleVisible('focus')).toBeFalse();
      pointerdown();
      flush();
      expect(isRippleVisible('focus')).toBeTrue();
    }));

    it('should continue to show the focus ripple on pointerup', fakeAsync(() => {
      pointerdown();
      pointerup();
      flush();

      // The slider immediately loses focus on pointerup for Safari.
      if (platform.SAFARI) {
        expect(isRippleVisible('hover')).toBeTrue();
      } else {
        expect(isRippleVisible('focus')).toBeTrue();
      }
    }));

    it('should hide the focus ripple on blur', fakeAsync(() => {
      pointerdown();
      pointerup();
      blur();
      flush();
      expect(isRippleVisible('focus')).toBeFalse();
    }));

    it('should show the active ripple on pointerdown', fakeAsync(() => {
      expect(isRippleVisible('active')).toBeFalse();
      pointerdown();
      expect(isRippleVisible('active')).toBeTrue();
      flush();
    }));

    it('should hide the active ripple on pointerup', fakeAsync(() => {
      pointerdown();
      pointerup();
      flush();
      expect(isRippleVisible('active')).toBeFalse();
    }));

    // Edge cases.

    it('should not show the hover ripple if the thumb is already focused', fakeAsync(() => {
      pointerdown();
      pointerenter();
      flush();
      expect(isRippleVisible('hover')).toBeFalse();
    }));

    it('should hide the hover ripple if the thumb is focused', fakeAsync(() => {
      pointerenter();
      pointerdown();
      flush();
      expect(isRippleVisible('hover')).toBeFalse();
    }));

    it('should not hide the focus ripple if the thumb is pressed', fakeAsync(() => {
      pointerdown();
      blur();
      flush();
      expect(isRippleVisible('focus')).toBeTrue();
    }));

    it('should not hide the hover ripple on blur if the thumb is hovered', fakeAsync(() => {
      pointerenter();
      pointerdown();
      pointerup();
      blur();
      flush();
      expect(isRippleVisible('hover')).toBeTrue();
    }));

    it('should hide the focus ripple on drag end if the thumb already lost focus', fakeAsync(() => {
      pointerdown();
      blur();
      pointerup();
      flush();
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
      input = slider._getInput(_MatThumb.END) as MatSliderThumb;
    }));

    it('should set the default value from the attribute', () => {
      checkInput(input, {min: 0, max: 100, value: 50, translateX: 150});
    });

    it('should update the value', fakeAsync(() => {
      slideToValue(slider, input, 75);
      checkInput(input, {min: 0, max: 100, value: 75, translateX: 225});
    }));
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
      startInput = slider._getInput(_MatThumb.START) as MatSliderRangeThumb;
      endInput = slider._getInput(_MatThumb.END) as MatSliderRangeThumb;
    }));

    it('should set the correct initial values', fakeAsync(() => {
      checkInput(startInput, {min: 0, max: 75, value: 25, translateX: 75});
      checkInput(endInput, {min: 25, max: 100, value: 75, translateX: 225});
    }));

    it('should update the start value', fakeAsync(() => {
      checkInput(startInput, {min: 0, max: 75, value: 25, translateX: 75});
      checkInput(endInput, {min: 25, max: 100, value: 75, translateX: 225});
      slideToValue(slider, startInput, 30);
      checkInput(startInput, {min: 0, max: 75, value: 30, translateX: 90});
      checkInput(endInput, {min: 30, max: 100, value: 75, translateX: 225});
    }));

    it('should update the end value', fakeAsync(() => {
      slideToValue(slider, endInput, 77);
      checkInput(startInput, {min: 0, max: 77, value: 25, translateX: 75});
      checkInput(endInput, {min: 25, max: 100, value: 77, translateX: 231});
    }));
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
      input = slider._getInput(_MatThumb.END) as MatSliderThumb;
    }));

    it('should update to the value based on the step', fakeAsync(() => {
      slideToValue(slider, input, 30);
      expect(input.value).toBe(25);
    }));

    it('should not add decimals to the value if it is a whole number', fakeAsync(() => {
      fixture.componentInstance.step = 0.1;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      slideToValue(slider, input, 11);
      expect(input.value).toBe(11);
    }));

    it('should truncate long decimal values when using a decimal step', fakeAsync(() => {
      fixture.componentInstance.step = 0.5;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      slideToValue(slider, input, 55.555);
      expect(input.value).toBe(55.5);
    }));

    it('should update the value on step change', fakeAsync(() => {
      slideToValue(slider, input, 30);
      fixture.componentInstance.step = 50;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(input.value).toBe(50);
    }));
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
      startInput = slider._getInput(_MatThumb.START) as MatSliderRangeThumb;
      endInput = slider._getInput(_MatThumb.END) as MatSliderRangeThumb;
    }));

    it('should set the correct start value on slide', fakeAsync(() => {
      slideToValue(slider, startInput, 30);
      expect(startInput.value).toBe(25);
    }));

    it('should set the correct end value on slide', fakeAsync(() => {
      slideToValue(slider, endInput, 45);
      expect(endInput.value).toBe(50);
    }));

    it('should not add decimals to the end value if it is a whole number', fakeAsync(() => {
      fixture.componentInstance.step = 0.1;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      slideToValue(slider, endInput, 11);
      expect(endInput.value).toBe(11);
    }));

    it('should not add decimals to the start value if it is a whole number', fakeAsync(() => {
      fixture.componentInstance.step = 0.1;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      slideToValue(slider, startInput, 11);
      expect(startInput.value).toBe(11);
    }));

    it('should truncate long decimal start values when using a decimal step', fakeAsync(() => {
      fixture.componentInstance.step = 0.1;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      slideToValue(slider, startInput, 33.666);
      expect(startInput.value).toBe(33.7);
    }));

    it('should truncate long decimal end values when using a decimal step', fakeAsync(() => {
      fixture.componentInstance.step = 0.1;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      slideToValue(slider, endInput, 33.6666);
      expect(endInput.value).toBe(33.7);
    }));

    describe('should handle step changes', () => {
      it('where the new start tx is greater than the old end tx', fakeAsync(() => {
        fixture.componentInstance.step = 0;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        slideToValue(slider, startInput, 45);
        slideToValue(slider, endInput, 46);

        checkInput(startInput, {min: 0, max: 46, value: 45, translateX: 135});
        checkInput(endInput, {min: 45, max: 100, value: 46, translateX: 138});

        fixture.componentInstance.step = 50;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        checkInput(startInput, {min: 0, max: 50, value: 50, translateX: 150});
        checkInput(endInput, {min: 50, max: 100, value: 50, translateX: 150});
      }));

      it('where the new end tx is less than the old start tx', fakeAsync(() => {
        fixture.componentInstance.step = 0;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        slideToValue(slider, startInput, 21);
        slideToValue(slider, endInput, 22);

        checkInput(startInput, {min: 0, max: 22, value: 21, translateX: 63});
        checkInput(endInput, {min: 21, max: 100, value: 22, translateX: 66});

        fixture.componentInstance.step = 50;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        checkInput(startInput, {min: 0, max: 0, value: 0, translateX: 0});
        checkInput(endInput, {min: 0, max: 100, value: 0, translateX: 0});
      }));
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
      input = slider._getInput(_MatThumb.END) as MatSliderThumb;
    });

    it('should set the aria-valuetext attribute with the given `displayWith` function', fakeAsync(() => {
      expect(input._hostElement.getAttribute('aria-valuetext')).toBe('$1');
      setValueByClick(slider, input, 199);
      fixture.detectChanges();
      flush();
      expect(input._hostElement.getAttribute('aria-valuetext')).toBe('$199');
    }));

    it('should invoke the passed-in `displayWith` function with the value', fakeAsync(() => {
      spyOn(slider, 'displayWith').and.callThrough();
      setValueByClick(slider, input, 199);
      expect(slider.displayWith).toHaveBeenCalledWith(199);
    }));

    it('should format the thumb label based on the passed-in `displayWith` function', fakeAsync(() => {
      setValueByClick(slider, input, 149);
      fixture.detectChanges();
      expect(valueIndicatorTextElement.textContent).toBe('$149');
    }));
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
      startInput = slider._getInput(_MatThumb.START) as MatSliderRangeThumb;
      endInput = slider._getInput(_MatThumb.END) as MatSliderRangeThumb;

      const startThumbElement = slider._getThumb(_MatThumb.START)._hostElement;
      const endThumbElement = slider._getThumb(_MatThumb.END)._hostElement;
      startValueIndicatorTextElement = startThumbElement.querySelector(
        '.mdc-slider__value-indicator-text',
      )!;
      endValueIndicatorTextElement = endThumbElement.querySelector(
        '.mdc-slider__value-indicator-text',
      )!;
    });

    it('should set the aria-valuetext attribute with the given `displayWith` function', fakeAsync(() => {
      expect(startInput._hostElement.getAttribute('aria-valuetext')).toBe('$1');
      expect(endInput._hostElement.getAttribute('aria-valuetext')).toBe('$200');
      setValueByClick(slider, startInput, 25);
      setValueByClick(slider, endInput, 81);
      expect(startInput._hostElement.getAttribute('aria-valuetext')).toBe('$25');
      expect(endInput._hostElement.getAttribute('aria-valuetext')).toBe('$81');
    }));

    it('should invoke the passed-in `displayWith` function with the start value', fakeAsync(() => {
      spyOn(slider, 'displayWith').and.callThrough();
      setValueByClick(slider, startInput, 197);
      expect(slider.displayWith).toHaveBeenCalledWith(197);
    }));

    it('should invoke the passed-in `displayWith` function with the end value', fakeAsync(() => {
      spyOn(slider, 'displayWith').and.callThrough();
      setValueByClick(slider, endInput, 72);
      expect(slider.displayWith).toHaveBeenCalledWith(72);
    }));

    it('should format the start thumb label based on the passed-in `displayWith` function', fakeAsync(() => {
      setValueByClick(slider, startInput, 120);
      fixture.detectChanges();
      expect(startValueIndicatorTextElement.textContent).toBe('$120');
    }));

    it('should format the end thumb label based on the passed-in `displayWith` function', fakeAsync(() => {
      setValueByClick(slider, endInput, 70);
      fixture.detectChanges();
      expect(endValueIndicatorTextElement.textContent).toBe('$70');
    }));
  });

  describe('slider with value property binding', () => {
    let fixture: ComponentFixture<SliderWithOneWayBinding>;
    let input: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(SliderWithOneWayBinding);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      const slider = sliderDebugElement.componentInstance;
      input = slider._getInput(_MatThumb.END) as MatSliderThumb;
    }));

    it('should update when bound value changes', () => {
      fixture.componentInstance.value = 75;
      fixture.changeDetectorRef.markForCheck();
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
      startInput = slider._getInput(_MatThumb.START) as MatSliderRangeThumb;
      endInput = slider._getInput(_MatThumb.END) as MatSliderRangeThumb;
    }));

    it('should update when bound start value changes', () => {
      fixture.componentInstance.startValue = 30;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(startInput.value).toBe(30);
    });

    it('should update when bound end value changes', () => {
      fixture.componentInstance.endValue = 70;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(endInput.value).toBe(70);
    });

    it('should update the input width when the start value changes', () => {
      const startInputEl = startInput._elementRef.nativeElement;
      const endInputEl = endInput._elementRef.nativeElement;
      const startInputWidthBefore = startInputEl.getBoundingClientRect().width;
      const endInputWidthBefore = endInputEl.getBoundingClientRect().width;
      fixture.componentInstance.startValue = 10;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      const startInputWidthAfter = startInputEl.getBoundingClientRect().width;
      const endInputWidthAfter = endInputEl.getBoundingClientRect().width;
      expect(startInputWidthBefore).not.toBe(startInputWidthAfter);
      expect(endInputWidthBefore).not.toBe(endInputWidthAfter);
    });

    it('should update the input width when the end value changes', () => {
      const startInputEl = startInput._elementRef.nativeElement;
      const endInputEl = endInput._elementRef.nativeElement;
      const startInputWidthBefore = startInputEl.getBoundingClientRect().width;
      const endInputWidthBefore = endInputEl.getBoundingClientRect().width;
      fixture.componentInstance.endValue = 90;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      const startInputWidthAfter = startInputEl.getBoundingClientRect().width;
      const endInputWidthAfter = endInputEl.getBoundingClientRect().width;
      expect(startInputWidthBefore).not.toBe(startInputWidthAfter);
      expect(endInputWidthBefore).not.toBe(endInputWidthAfter);
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
      input = slider._getInput(_MatThumb.END) as MatSliderThumb;
    }));

    it('works in RTL languages', fakeAsync(() => {
      setValueByClick(slider, input, 25, true);
      checkInput(input, {min: 0, max: 100, value: 75, translateX: 75});
    }));
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
      startInput = slider._getInput(_MatThumb.START) as MatSliderRangeThumb;
      endInput = slider._getInput(_MatThumb.END) as MatSliderRangeThumb;
    }));

    it('works in RTL languages', fakeAsync(() => {
      setValueByClick(slider, startInput, 90, true);
      checkInput(startInput, {min: 0, max: 100, value: 10, translateX: 270});

      setValueByClick(slider, endInput, 10, true);
      checkInput(endInput, {min: 10, max: 100, value: 90, translateX: 30});
    }));
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
      input = slider._getInput(_MatThumb.END) as MatSliderThumb;
    }));

    it('should update the model', fakeAsync(() => {
      slideToValue(slider, input, 19);
      fixture.detectChanges();
      expect(fixture.componentInstance.val).toBe(19);
      checkInput(input, {min: 0, max: 100, value: 19, translateX: 57});
    }));

    it('should update the slider', fakeAsync(() => {
      fixture.componentInstance.val = 20;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      flush();
      checkInput(input, {min: 0, max: 100, value: 20, translateX: 60});
    }));

    it('should be able to reset a slider by setting the model back to undefined', fakeAsync(() => {
      fixture.componentInstance.val = 5;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      flush();
      checkInput(input, {min: 0, max: 100, value: 5, translateX: 15});

      fixture.componentInstance.val = undefined;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      flush();
      checkInput(input, {min: 0, max: 100, value: 0, translateX: 0});
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
      startInput = slider._getInput(_MatThumb.START) as MatSliderRangeThumb;
      endInput = slider._getInput(_MatThumb.END) as MatSliderRangeThumb;
    }));

    it('should update the models on input value changes', fakeAsync(() => {
      slideToValue(slider, startInput, 25);
      fixture.detectChanges();
      flush();
      checkInput(startInput, {min: 0, max: 100, value: 25, translateX: 75});

      slideToValue(slider, endInput, 75);
      fixture.detectChanges();
      flush();
      checkInput(endInput, {min: 25, max: 100, value: 75, translateX: 225});
    }));

    it('should update the thumbs on ngModel value change', fakeAsync(() => {
      fixture.componentInstance.startVal = 50;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      flush();
      checkInput(startInput, {min: 0, max: 100, value: 50, translateX: 150});

      fixture.componentInstance.endVal = 75;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      flush();
      checkInput(endInput, {min: 50, max: 100, value: 75, translateX: 225});
    }));

    it('should be able to reset a start input', fakeAsync(() => {
      fixture.componentInstance.startVal = 5;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      flush();
      checkInput(startInput, {min: 0, max: 100, value: 5, translateX: 15});

      fixture.componentInstance.startVal = undefined;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      flush();
      checkInput(startInput, {min: 0, max: 100, value: 0, translateX: 0});
    }));

    it('should be able to reset an end input', fakeAsync(() => {
      fixture.componentInstance.endVal = 99;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      flush();
      checkInput(endInput, {min: 0, max: 100, value: 99, translateX: 297});

      fixture.componentInstance.endVal = undefined;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      flush();
      checkInput(endInput, {min: 0, max: 100, value: 0, translateX: 0});
    }));
  });

  describe('range slider w/ NgModel edge case', () => {
    it('should initialize correctly despite NgModel `null` bug', fakeAsync(() => {
      const fixture = createComponent(RangeSliderWithNgModelEdgeCase);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      const slider = sliderDebugElement.componentInstance;
      const startInput = slider._getInput(_MatThumb.START) as MatSliderRangeThumb;
      const endInput = slider._getInput(_MatThumb.END) as MatSliderRangeThumb;
      flush();
      checkInput(startInput, {min: -1, max: -0.3, value: -0.7, translateX: 90});
      checkInput(endInput, {min: -0.7, max: 0, value: -0.3, translateX: 210});
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
      input = slider._getInput(_MatThumb.END) as MatSliderThumb;
    }));

    it('should update the control on slide', fakeAsync(() => {
      expect(fixture.componentInstance.control.value).toBe(0);
      slideToValue(slider, input, 19);
      expect(fixture.componentInstance.control.value).toBe(19);
    }));

    it('should update the value when the control is set', () => {
      expect(input.value).toBe(0);
      fixture.componentInstance.control.setValue(7);
      checkInput(input, {min: 0, max: 100, value: 7, translateX: 21});
    });

    it('should update the disabled state when control is disabled', () => {
      expect(slider.disabled).toBe(false);
      fixture.componentInstance.control.disable();
      expect(slider.disabled).toBe(true);
    });

    it('should update the disabled state when the control is enabled', () => {
      slider.disabled = true;
      fixture.componentInstance.control.enable();
      expect(slider.disabled).toBe(false);
    });

    it('should have the correct control state initially and after interaction', fakeAsync(() => {
      let sliderControl = fixture.componentInstance.control;

      // The control should start off valid, pristine, and untouched.
      expect(sliderControl.valid).toBe(true);
      expect(sliderControl.pristine).toBe(true);
      expect(sliderControl.touched).toBe(false);

      // After changing the value, the control should become dirty (not pristine),
      // but remain untouched.
      setValueByClick(slider, input, 50);

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
    }));
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
      startInput = slider._getInput(_MatThumb.START) as MatSliderRangeThumb;
      endInput = slider._getInput(_MatThumb.END) as MatSliderRangeThumb;
    }));

    it('should update the start input control on slide', fakeAsync(() => {
      expect(fixture.componentInstance.startInputControl.value).toBe(0);
      slideToValue(slider, startInput, 20);
      expect(fixture.componentInstance.startInputControl.value).toBe(20);
    }));

    it('should update the end input control on slide', fakeAsync(() => {
      expect(fixture.componentInstance.endInputControl.value).toBe(100);
      slideToValue(slider, endInput, 80);
      expect(fixture.componentInstance.endInputControl.value).toBe(80);
    }));

    it('should update the start input value when the start input control is set', () => {
      expect(startInput.value).toBe(0);
      fixture.componentInstance.startInputControl.setValue(10);
      checkInput(startInput, {min: 0, max: 100, value: 10, translateX: 30});
    });

    it('should update the end input value when the end input control is set', () => {
      expect(endInput.value).toBe(100);
      fixture.componentInstance.endInputControl.setValue(90);
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

    it('should have the correct start input control state initially and after interaction', fakeAsync(() => {
      let sliderControl = fixture.componentInstance.startInputControl;

      // The control should start off valid, pristine, and untouched.
      expect(sliderControl.valid).toBe(true);
      expect(sliderControl.pristine).toBe(true);
      expect(sliderControl.touched).toBe(false);

      // After changing the value, the control should become dirty (not pristine),
      // but remain untouched.
      setValueByClick(slider, startInput, 25);

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
    }));

    it('should have the correct start input control state initially and after interaction', fakeAsync(() => {
      let sliderControl = fixture.componentInstance.endInputControl;

      // The control should start off valid, pristine, and untouched.
      expect(sliderControl.valid).toBe(true);
      expect(sliderControl.pristine).toBe(true);
      expect(sliderControl.touched).toBe(false);

      // After changing the value, the control should become dirty (not pristine),
      // but remain untouched.
      setValueByClick(slider, endInput, 75);

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
    }));
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
      input = slider._getInput(_MatThumb.END) as MatSliderThumb;
    });

    it('should sync the value binding in both directions', fakeAsync(() => {
      checkInput(input, {min: 0, max: 100, value: 0, step: 1, translateX: 0});

      slideToValue(slider, input, 10);
      expect(fixture.componentInstance.value).toBe(10);
      checkInput(input, {min: 0, max: 100, value: 10, step: 1, translateX: 30});

      fixture.componentInstance.value = 20;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(fixture.componentInstance.value).toBe(20);
      checkInput(input, {min: 0, max: 100, value: 20, step: 1, translateX: 60});
    }));
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
      endInput = slider._getInput(_MatThumb.END) as MatSliderRangeThumb;
      startInput = slider._getInput(_MatThumb.START) as MatSliderRangeThumb;
    }));

    it('should sync the start value binding in both directions', fakeAsync(() => {
      expect(fixture.componentInstance.startValue).toBe(0);
      expect(startInput.value).toBe(0);

      slideToValue(slider, startInput, 10);

      expect(fixture.componentInstance.startValue).toBe(10);
      expect(startInput.value).toBe(10);

      fixture.componentInstance.startValue = 20;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(fixture.componentInstance.startValue).toBe(20);
      expect(startInput.value).toBe(20);
    }));

    it('should sync the end value binding in both directions', fakeAsync(() => {
      expect(fixture.componentInstance.endValue).toBe(100);
      expect(endInput.value).toBe(100);

      slideToValue(slider, endInput, 90);
      expect(fixture.componentInstance.endValue).toBe(90);
      expect(endInput.value).toBe(90);

      fixture.componentInstance.endValue = 80;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(fixture.componentInstance.endValue).toBe(80);
      expect(endInput.value).toBe(80);
    }));
  });

  describe('slider with tick marks', () => {
    let fixture: ComponentFixture<SliderWithTickMarks>;
    let slider: MatSlider;
    let sliderEl: HTMLElement;

    function getTickMarkEls() {
      const activeClass = '.mdc-slider__tick-mark--active';
      const inactiveClass = '.mdc-slider__tick-mark--inactive';
      const active = sliderEl.querySelectorAll(activeClass);
      const inactive = sliderEl.querySelectorAll(inactiveClass);
      const ticks = sliderEl.querySelectorAll(`${activeClass},${inactiveClass}`);
      return {ticks, active, inactive};
    }

    beforeEach(waitForAsync(() => {
      fixture = createComponent(SliderWithTickMarks);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      slider = sliderDebugElement.componentInstance;
      sliderEl = sliderDebugElement.nativeElement;
    }));

    it('should have tick marks', () => {
      expect(slider._tickMarks.length).toBeTruthy();
    });

    it('should have the correct number of ticks', () => {
      expect(slider._tickMarks.length).toBe(101);

      slider.max = 10;
      expect(slider._tickMarks.length).toBe(11);

      slider.step = 2;
      expect(slider._tickMarks.length).toBe(6);

      slider.min = 8;
      expect(slider._tickMarks.length).toBe(2);
    });

    it('should position the tick marks correctly', () => {
      const {ticks} = getTickMarkEls();

      // 2.94 because the slider is 300px, there is 3px padding
      // on each side of the tick mark track, and there are 100
      // spaces between the 101 ticks. So the math is:
      // (300 - 6) / 100 = 2.94
      const spacing = 2.94;
      const delta = 0.1; // Floating point imprecision

      let x = 18; // Where the first tick happens to start at.

      for (let i = 0; i < ticks.length; i++) {
        const tickX = ticks[i].getBoundingClientRect().x;
        expect(tickX).toBeGreaterThan(x - delta);
        expect(tickX).toBeLessThan(x + delta);
        x = tickX + spacing;
      }
    });

    // TODO(wagnermaciel): Add this test once this is fixed.
    // it('should render the correct number of active & inactive ticks', () => {});

    // TODO(wagnermaciel): Add this test once this is fixed.
    // it('should position the tick marks correctly with a misaligned step', () => {});

    // TODO(wagnermaciel): Add this test once this is fixed.
    // it('should position the tick marks correctly with a misaligned step (rtl)', () => {});
  });
});

const SLIDER_STYLES = ['.mat-mdc-slider { width: 300px; }'];

@Component({
  template: `
  <mat-slider>
    <input matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
  standalone: false,
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
  standalone: false,
})
class StandardRangeSlider {}

@Component({
  template: `
  <mat-slider disabled>
    <input matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
  standalone: false,
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
  standalone: false,
})
class DisabledRangeSlider {}

@Component({
  template: `
  <mat-slider [min]="min" [max]="max">
    <input matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
  standalone: false,
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
  standalone: false,
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
  standalone: false,
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
  standalone: false,
})
class RangeSliderWithValue {}

@Component({
  template: `
  <mat-slider [step]="step">
    <input matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
  standalone: false,
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
  standalone: false,
})
class RangeSliderWithStep {
  step = 25;
}

@Component({
  template: `
  <mat-slider [displayWith]="displayWith" min="1" max="200" discrete>
    <input matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
  standalone: false,
})
class DiscreteSliderWithDisplayWith {
  displayWith(v: number) {
    return `$${v}`;
  }
}

@Component({
  template: `
  <mat-slider [displayWith]="displayWith" min="1" max="200" discrete>
    <input matSliderStartThumb>
    <input matSliderEndThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
  standalone: false,
})
class DiscreteRangeSliderWithDisplayWith {
  displayWith(v: number) {
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
  standalone: false,
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
  standalone: false,
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
  standalone: false,
})
class SliderWithNgModel {
  @ViewChild(MatSlider) slider: MatSlider;
  val: number | undefined = 0;
}

@Component({
  template: `
  <mat-slider>
    <input [(ngModel)]="startVal" matSliderStartThumb>
    <input [(ngModel)]="endVal" matSliderEndThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
  standalone: false,
})
class RangeSliderWithNgModel {
  @ViewChild(MatSlider) slider: MatSlider;
  startVal: number | undefined = 0;
  endVal: number | undefined = 100;
}

@Component({
  template: `
  <mat-slider min="-1" max="0" step="0.1">
    <input [(ngModel)]="startValue" matSliderStartThumb />
    <input [(ngModel)]="endValue" matSliderEndThumb />
  </mat-slider>

`,
  styles: SLIDER_STYLES,
  standalone: false,
})
class RangeSliderWithNgModelEdgeCase {
  @ViewChild(MatSlider) slider: MatSlider;
  startValue: number = -0.7;
  endValue: number = -0.3;
}

@Component({
  template: `
  <mat-slider>
    <input [formControl]="control" matSliderThumb>
  </mat-slider>`,
  styles: SLIDER_STYLES,
  standalone: false,
})
class SliderWithFormControl {
  control = new FormControl(0);
}

@Component({
  template: `
  <mat-slider>
    <input [formControl]="startInputControl" matSliderStartThumb>
    <input [formControl]="endInputControl" matSliderEndThumb>
  </mat-slider>`,
  styles: SLIDER_STYLES,
  standalone: false,
})
class RangeSliderWithFormControl {
  startInputControl = new FormControl(0);
  endInputControl = new FormControl(100);
}

@Component({
  template: `
  <mat-slider>
    <input [(value)]="value" matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
  standalone: false,
})
class SliderWithTwoWayBinding {
  value = 0;
}

@Component({
  template: `
  <mat-slider>
    <input [(value)]="startValue" matSliderStartThumb>
    <input [(value)]="endValue" matSliderEndThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
  standalone: false,
})
class RangeSliderWithTwoWayBinding {
  @ViewChild(MatSlider) slider: MatSlider;
  @ViewChildren(MatSliderThumb) sliderInputs: QueryList<MatSliderThumb>;
  startValue = 0;
  endValue = 100;
}

@Component({
  template: `
  <mat-slider [showTickMarks]="true">
    <input matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
  standalone: false,
})
class SliderWithTickMarks {
  @ViewChild(MatSlider) slider: MatSlider;
}

/** Clicks on the MatSlider at the coordinates corresponding to the given value. */
function setValueByClick(
  slider: MatSlider,
  input: MatSliderThumb,
  value: number,
  isRtl: boolean = false,
) {
  const inputElement = input._elementRef.nativeElement;
  const val = isRtl ? slider.max - value : value;
  const {x, y} = getCoordsForValue(slider, value);

  dispatchPointerEvent(inputElement, 'pointerdown', x, y);
  input.value = val;
  dispatchEvent(input._hostElement, new Event('input'));
  input.focus();
  dispatchPointerEvent(inputElement, 'pointerup', x, y);
  dispatchEvent(input._hostElement, new Event('change'));
  flush();
}

/** Slides the MatSlider's thumb to the given value. */
function slideToValue(slider: MatSlider, input: MatSliderThumb, value: number) {
  const sliderElement = slider._elementRef.nativeElement;
  const {x: startX, y: startY} = getCoordsForValue(slider, input.value);
  const {x: endX, y: endY} = getCoordsForValue(slider, value);

  dispatchPointerEvent(sliderElement, 'pointerdown', startX, startY);
  input.focus();
  dispatchPointerEvent(sliderElement, 'pointermove', endX, endY);
  input._hostElement.value = `${value}`;
  dispatchEvent(input._hostElement, new Event('input'));
  dispatchPointerEvent(sliderElement, 'pointerup', endX, endY);
  dispatchEvent(input._hostElement, new Event('change'));
  tick(10);
}

/** Returns the x and y coordinates for the given slider value. */
function getCoordsForValue(slider: MatSlider, value: number): Point {
  const {min, max} = slider;
  const percent = (value - min) / (max - min);

  const {top, left, width, height} = slider._elementRef.nativeElement.getBoundingClientRect();
  const x = width * percent + left;
  const y = top + height / 2;

  return {x, y};
}
