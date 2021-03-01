/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {dispatchMouseEvent, dispatchPointerEvent} from '@angular/cdk/testing/private';
import {Component, DebugElement, Type} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {RippleRef, RippleState} from '@angular/material/core';
import {By} from '@angular/platform-browser';
import {Thumb} from '@material/slider';
import {MatSliderModule} from './module';
import {MatSlider, MatSliderThumb, MatSliderVisualThumb} from './slider';

describe('MDC-based MatSlider' , () => {
  beforeAll(() => {
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
    let fixture: ComponentFixture<StandardSlider>;
    let sliderDebugElement: DebugElement;
    let sliderInstance: MatSlider;
    let inputInstance: MatSliderThumb;

    beforeEach(() => {
      fixture = createComponent(StandardSlider);
      fixture.detectChanges();
      sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      inputInstance = sliderInstance._getInput(Thumb.END);
    });

    beforeEach(done => {
      fixture.whenStable().then(() => done());
    });

    it('should set the default values', () => {
      expect(inputInstance.value).toBe(0);
      expect(sliderInstance.min).toBe(0);
      expect(sliderInstance.max).toBe(100);
    });

    it('should update the value on mousedown', () => {
      setValueByClick(sliderInstance, 19);
      expect(inputInstance.value).toBe(19);
    });

    it('should update the value on a slide', () => {
      slideToValue(sliderInstance, 77);
      expect(inputInstance.value).toBe(77);
    });

    it('should set the value as min when sliding before the track', () => {
      slideToValue(sliderInstance, -1);
      expect(inputInstance.value).toBe(0);
    });

    it('should set the value as max when sliding past the track', () => {
      slideToValue(sliderInstance, 101);
      expect(inputInstance.value).toBe(100);
    });

    it('should focus the slider input when clicking on the slider', () => {
      expect(document.activeElement).not.toBe(inputInstance._hostElement);
      setValueByClick(sliderInstance, 0);
      expect(document.activeElement).toBe(inputInstance._hostElement);
    });
  });

  describe('standard range slider', () => {
    let fixture: ComponentFixture<StandardRangeSlider>;
    let sliderDebugElement: DebugElement;
    let sliderInstance: MatSlider;
    let startInputInstance: MatSliderThumb;
    let endInputInstance: MatSliderThumb;

    beforeEach(() => {
      fixture = createComponent(StandardRangeSlider);
      fixture.detectChanges();
      sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      startInputInstance = sliderInstance._getInput(Thumb.START);
      endInputInstance = sliderInstance._getInput(Thumb.END);
    });

    beforeEach(done => {
      fixture.whenStable().then(() => done());
    });

    it('should set the default values', () => {
      expect(startInputInstance.value).toBe(0);
      expect(endInputInstance.value).toBe(100);
      expect(sliderInstance.min).toBe(0);
      expect(sliderInstance.max).toBe(100);
    });

    it('should update the start value on a slide', () => {
      slideToValue(sliderInstance, 19, Thumb.START);
      expect(startInputInstance.value).toBe(19);
    });

    it('should update the end value on a slide', () => {
      slideToValue(sliderInstance, 27, Thumb.END);
      expect(endInputInstance.value).toBe(27);
    });

    it('should update the start value on mousedown behind the start thumb', () => {
      sliderInstance._setValue(19, Thumb.START);
      setValueByClick(sliderInstance, 12);
      expect(startInputInstance.value).toBe(12);
    });

    it('should update the end value on mousedown in front of the end thumb', () => {
      sliderInstance._setValue(27, Thumb.END);
      setValueByClick(sliderInstance, 55);
      expect(endInputInstance.value).toBe(55);
    });

    it('should set the start value as min when sliding before the track', () => {
      slideToValue(sliderInstance, -1, Thumb.START);
      expect(startInputInstance.value).toBe(0);
    });

    it('should set the end value as max when sliding past the track', () => {
      slideToValue(sliderInstance, 101, Thumb.START);
      expect(startInputInstance.value).toBe(100);
    });

    it('should not let the start thumb slide past the end thumb', () => {
      sliderInstance._setValue(50, Thumb.END);
      slideToValue(sliderInstance, 75, Thumb.START);
      expect(startInputInstance.value).toBe(50);
    });

    it('should not let the end thumb slide before the start thumb', () => {
      sliderInstance._setValue(50, Thumb.START);
      slideToValue(sliderInstance, 25, Thumb.END);
      expect(startInputInstance.value).toBe(50);
    });
  });

  describe('ripple states', () => {
    let fixture: ComponentFixture<StandardSlider>;
    let inputInstance: MatSliderThumb;
    let thumbInstance: MatSliderVisualThumb;
    let thumbElement: HTMLElement;
    let thumbX: number;
    let thumbY: number;

    beforeEach(() => {
      fixture = createComponent(StandardSlider);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      const sliderInstance = sliderDebugElement.componentInstance;
      inputInstance = sliderInstance._getInput(Thumb.END);
      thumbInstance = sliderInstance._getThumb();
      thumbElement = thumbInstance._getHostElement();
    });

    beforeEach(done => {
      fixture.whenStable().then(() => done());
    });

    beforeEach(() => {
      const thumbDimensions = thumbElement.getBoundingClientRect();
      thumbX = thumbDimensions.left - (thumbDimensions.width / 2);
      thumbY = thumbDimensions.top - (thumbDimensions.height / 2);
    });

    function isRippleVisible(rippleRef: RippleRef) {
      return rippleRef?.state === RippleState.FADING_IN
        || rippleRef?.state === RippleState.VISIBLE;
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
      dispatchPointerEvent(thumbElement, 'pointerdown', thumbX, thumbY);
    }

    function pointerup() {
      dispatchPointerEvent(thumbElement, 'pointerup', thumbX, thumbY);
    }

    it('should show the hover ripple on mouseenter', () => {
      expect(isRippleVisible(thumbInstance._hoverRippleRef)).toBe(false);
      mouseenter();
      expect(isRippleVisible(thumbInstance._hoverRippleRef)).toBe(true);
    });

    it('should hide the hover ripple on mouseleave', () => {
      mouseenter();
      mouseleave();
      expect(isRippleVisible(thumbInstance._hoverRippleRef)).toBe(false);
    });

    it('should show the focus ripple on pointerdown', () => {
      expect(isRippleVisible(thumbInstance._focusRippleRef)).toBe(false);
      pointerdown();
      expect(isRippleVisible(thumbInstance._focusRippleRef)).toBe(true);
    });

    it('should continue to show the focus ripple on pointerup', () => {
      pointerdown();
      pointerup();
      expect(isRippleVisible(thumbInstance._focusRippleRef)).toBe(true);
    });

    it('should hide the focus ripple on blur', () => {
      pointerdown();
      pointerup();
      blur();
      expect(isRippleVisible(thumbInstance._focusRippleRef)).toBe(false);
    });

    it('should show the active ripple on pointerdown', () => {
      expect(isRippleVisible(thumbInstance._activeRippleRef)).toBe(false);
      pointerdown();
      expect(isRippleVisible(thumbInstance._activeRippleRef)).toBe(true);
    });

    it('should hide the active ripple on pointerup', () => {
      pointerdown();
      pointerup();
      expect(isRippleVisible(thumbInstance._activeRippleRef)).toBe(false);
    });

    // Edge cases.

    it('should not show the hover ripple if the thumb is already focused', () => {
      pointerdown();
      mouseenter();
      expect(isRippleVisible(thumbInstance._hoverRippleRef)).toBe(false);
    });

    it('should hide the hover ripple if the thumb is focused', () => {
      mouseenter();
      pointerdown();
      expect(isRippleVisible(thumbInstance._hoverRippleRef)).toBe(false);
    });

    it('should not hide the focus ripple if the thumb is pressed', () => {
      pointerdown();
      blur();
      expect(isRippleVisible(thumbInstance._focusRippleRef)).toBe(true);
    });

    it('should not hide the hover ripple on blur if the cursor is thumb being hovered', () => {
      mouseenter();
      pointerdown();
      pointerup();
      blur();
      expect(isRippleVisible(thumbInstance._hoverRippleRef)).toBe(true);
    });

    it('should hide the focus ripple on drag end if the thumb already lost focus', () => {
      pointerdown();
      blur();
      pointerup();
      expect(isRippleVisible(thumbInstance._focusRippleRef)).toBe(false);
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

/** Clicks on the MatSlider at the coordinates corresponding to the given value. */
function setValueByClick(slider: MatSlider, value: number) {
  const {min, max} = slider;
  const percent = (value - min) / (max - min);

  const sliderElement = slider._elementRef.nativeElement;
  const {top, left, width, height} = sliderElement.getBoundingClientRect();
  const x = left + (width * percent);
  const y = top + (height / 2);

  dispatchPointerEvent(sliderElement, 'pointerdown', x, y);
  dispatchPointerEvent(sliderElement, 'pointerup', x, y);
}

/** Slides the MatSlider's thumb to the given value. */
function slideToValue(slider: MatSlider, value: number, thumbPosition: Thumb = Thumb.END) {
  const {min, max} = slider;
  const percent = (value - min) / (max - min);

  const sliderElement = slider._elementRef.nativeElement;
  const thumbElement = slider._getThumbElement(thumbPosition);

  const sliderDimensions = sliderElement.getBoundingClientRect();
  let thumbDimensions = thumbElement.getBoundingClientRect();

  const startX = thumbDimensions.left + (thumbDimensions.width / 2);
  const startY = thumbDimensions.top + (thumbDimensions.height / 2);

  const endX = sliderDimensions.left + (sliderDimensions.width * percent);
  const endY = sliderDimensions.top + (sliderDimensions.height / 2);

  dispatchPointerEvent(sliderElement, 'pointerdown', startX, startY);
  dispatchPointerEvent(sliderElement, 'pointermove', endX, endY);
  dispatchPointerEvent(sliderElement, 'pointerup', endX, endY);
}
