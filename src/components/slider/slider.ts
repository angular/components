import {
  Component,
  ElementRef,
  HostBinding,
  Input,
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
    '(blur)': 'onBlur()',
  },
  templateUrl: 'slider.html',
  styleUrls: ['slider.css'],
  encapsulation: ViewEncapsulation.None,
})
export class MdSlider implements AfterContentInit {
  private _renderer: SliderRenderer = null;

  private _sliderDimensions: ClientRect = null;

  private _disabled: boolean = false;

  @HostBinding('class.md-slider-disabled')
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value) {
    this._disabled = (value != null && value !== false) ? true : null;
  }

  private _min: number = 0;

  @Input()
  @HostBinding('attr.min')
  get min() {
    return this._min;
  }

  set min(v: number) {
    this._min = Number(v);
  }

  private _max: number = 100;

  @Input()
  @HostBinding('attr.max')
  get max() {
    return this._max;
  }

  set max(v: number) {
    this._max = Number(v);
  }

  private _percent: number = 0;

  public isDragging: boolean = false;

  public isActive: boolean = false;

  private _value: number;

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
    this.value = this.min;
    this._sliderDimensions = this._renderer.getSliderDimensions();
    this._renderer.updateThumbPosition(this._percent, this._sliderDimensions.width);
  }

  onClick(event: MouseEvent) {
    if (this.disabled) {
      return;
    }
    this.isActive = true;
    this.isDragging = false;
    this._renderer.addFocus();

    this.updatePosition(event.clientX);
  }

  onDrag(event: HammerInput) {
    if (this.disabled) {
      return;
    }
    event.preventDefault();
    this.updatePosition(event.center.x);
  }

  onDragStart(event: HammerInput) {
    if (this.disabled) {
      return;
    }
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

  onBlur() {
    this.isActive = false;
  }

  updatePosition(pos: number) {
    let offset = this._sliderDimensions.left;
    let size = this._sliderDimensions.width;
    this._percent = this.clamp((pos - offset) / size);
    this.value = this.min + (this._percent * (this.max - this.min));

    this._renderer.updateThumbPosition(this._percent, this._sliderDimensions.width);
  }

  clamp(value: number, min = 0, max = 1) {
    return Math.max(min, Math.min(value, max));
  }
}

export class SliderRenderer {
  constructor(private _elementRef: ElementRef) { }

  getSliderDimensions() {
    let trackElement = this._elementRef.nativeElement.querySelector('.md-slider-track');
    return trackElement.getBoundingClientRect();
  }

  updateThumbPosition(percent: number, width: number) {
    let thumbElement = this._elementRef.nativeElement.querySelector('.md-slider-thumb');
    let thumbPositionElement =
        this._elementRef.nativeElement.querySelector('.md-slider-thumb-position');
    let activeTrackElement = this._elementRef.nativeElement.querySelector('.md-slider-track-fill');
    let thumbWidth = thumbElement.getBoundingClientRect().width;

    let position = percent * width;
    let thumbPosition = position - (thumbWidth / 2);
    activeTrackElement.style.width = `${position}px`;
    thumbPositionElement.style.transform = `translateX(${thumbPosition}px)`;
  }

  addFocus() {
    this._elementRef.nativeElement.focus();
  }
}
