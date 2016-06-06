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
    'tabindex': '0',
    '(click)': 'onClick($event)',
    '(drag)': 'onDrag($event)',
    '(dragstart)': 'onDragStart($event)',
    '(dragend)': 'onDragEnd()',
    '(window:resize)': 'onResize()',
    '(blur)': 'blurListener()',
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

  public isDragging: boolean = false;

  public isActive: boolean = false;

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
    this._renderer.updateThumbPosition(this._percent, this._sliderDimensions.width);
  }

  onClick(event: MouseEvent) {
    this.isActive = true;
    this.isDragging = false;
    this._renderer.addFocus();

    this.updatePosition(event.clientX);
  }

  onDrag(event: HammerInput) {
    event.preventDefault();
    this.updatePosition(event.center.x);
  }

  onDragStart(event: HammerInput) {
    event.preventDefault();
    this.isDragging = true;
    this.isActive = true;
    this._renderer.addFocus();
    this.updatePosition(event.center.x);
  }

  onDragEnd() {
    this.isDragging = false;
  }

  onResize() {
    this.isDragging = true;
    this._sliderDimensions = this._renderer.getSliderDimensions();
    this._renderer.updateThumbPosition(this._percent, this._sliderDimensions.width);
  }

  blurListener() {
    this.isActive = false;
  }

  updatePosition(pos: number) {
    let offset = this._sliderDimensions.left;
    let size = this._sliderDimensions.width;
    this._percent = this.clamp((pos - offset) / size);
    let value = this._minValue + (this._percent * (this._maxValue - this._minValue));

    this.value = value;

    this._renderer.updateThumbPosition(this._percent, this._sliderDimensions.width);
  }

  clamp(value: number, min = 0, max = 1) {
    return Math.max(min, Math.min(value, max));
  }
}

export class SliderRenderer {
  constructor(private _elementRef: ElementRef) { }

  getSliderDimensions() {
    return this._elementRef.nativeElement.getBoundingClientRect();
  }

  updateThumbPosition(percent: number, width: number) {
    let thumbElement = this._elementRef.nativeElement.querySelector('.md-slider-thumb');
    let activeTrackElement = this._elementRef.nativeElement.querySelector('.md-slider-track-fill');
    let thumbWidth = thumbElement.getBoundingClientRect().width;

    let position = percent * width;
    let thumbPosition = position - (thumbWidth / 2);
    activeTrackElement.style.width = `${position}px`;
    thumbElement.style.left = `${thumbPosition}px`;
  }

  addFocus() {
    this._elementRef.nativeElement.focus();
  }
}
