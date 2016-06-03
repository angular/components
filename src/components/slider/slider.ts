import {
  Component,
  ElementRef,
  ViewEncapsulation,
  AfterContentInit,
} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'md-slider',
  host: {
    '(click)': 'test($event)'
  },
  templateUrl: 'slider.html',
  styleUrls: ['slider.css'],
  encapsulation: ViewEncapsulation.None,
})
export class MdSlider implements AfterContentInit {
  private _renderer: SliderRenderer = null;

  private _sliderDimensions: ClientRect = null;

  private _value: number = 0;

  private _minValue: number = 0;

  private _maxValue: number = 100;

  private _percent: number = 0;

  get value() {
    return this._value;
  }

  set value(v: number) {
    this._value = v;
  }

  constructor(private _elementRef: ElementRef) {
    this._renderer = new SliderRenderer(_elementRef);
  }

  ngAfterContentInit() {
    this._sliderDimensions = this._renderer.getSliderDimensions();
  }

  test(event: MouseEvent) {
    let offset = this._sliderDimensions.left;
    let size = this._sliderDimensions.width;
    this._percent = (event.clientX - offset) / size;
    let value = this._minValue + (this._percent * (this._maxValue - this._minValue));

    this.value = value;
  }

  primaryTransform() {
    let position = (this._percent * this._sliderDimensions.width) - 10;
    return {transform: `translateX(${position}px) scale(1)`};
  }
}

export class SliderRenderer {
  constructor(private _elementRef: ElementRef) { }

  getSliderDimensions() {
    return this._elementRef.nativeElement.getBoundingClientRect();
  }
}
