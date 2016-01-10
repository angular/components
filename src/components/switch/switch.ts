import {Component, ViewEncapsulation, ElementRef} from 'angular2/core';
import {MdDrag} from '../../core/services/drag/drag';
import {ControlValueAccessor} from "angular2/common";
import {NgControl} from "angular2/common";
import {Optional} from "angular2/core";
import {Renderer} from "angular2/core";

@Component({
  selector: 'md-switch',
  inputs: ['disabled'],
  host: {
    '[attr.aria-disabled]': 'disabled',
    '(click)': 'onClick()'
  },
  templateUrl: './components/switch/switch.html',
  styleUrls: ['./components/switch/switch.css'],
  encapsulation: ViewEncapsulation.None,
})
export class MdSwitch implements ControlValueAccessor {

  elementRef: ElementRef;
  componentElement: HTMLElement;
  switchContainer: HTMLElement;
  thumbContainer: HTMLElement;

  dragData: any;
  dragClick = false;

  // Accessor Values
  onChange = (_:any) => {};
  onTouched = () => {};

  // storage values
  checked_: any;
  disabled_: boolean;

  constructor(private _elementRef: ElementRef, private _renderer: Renderer, @Optional() ngControl: NgControl) {
    this.componentElement = _elementRef.nativeElement;
    this.elementRef = _elementRef;

    if (ngControl) {
      ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {
    this.switchContainer = <HTMLElement> this.componentElement.querySelector('.md-container');
    this.thumbContainer = <HTMLElement> this.componentElement.querySelector('.md-thumb-container');

    MdDrag.register(this.switchContainer);

    this.switchContainer.addEventListener('$md.dragstart', (ev: CustomEvent) => this.onDragStart(ev));
    this.switchContainer.addEventListener('$md.drag', (ev: CustomEvent) => this.onDrag(ev));
    this.switchContainer.addEventListener('$md.dragend', (ev: CustomEvent) => this.onDragEnd(ev));

  }


  onDragStart(event: CustomEvent) {
    if (this.disabled) return;

    this.componentElement.classList.add('md-dragging');

    this.dragData = {
      width: this.thumbContainer.offsetWidth
    };

    this.componentElement.classList.remove('transition')
  }

  onDrag(event: CustomEvent) {
    if (this.disabled) return;

    let percent = event.detail.pointer.distanceX / this.dragData.width;

    let translate = this.checked ? 1 + percent : percent;
    translate = Math.max(0, Math.min(1, translate));

    this.thumbContainer.style.transform = 'translate3d(' + (100 * translate) + '%,0,0)';
    this.dragData.translate = translate;
  }

  onDragEnd(event: CustomEvent) {
    if (this.disabled) return;

    this.componentElement.classList.remove('md-dragging');
    this.thumbContainer.style.transform = null;


    var isChanged = this.checked ? this.dragData.translate < 0.5 : this.dragData.translate > 0.5;
    if (isChanged || !this.dragData.translate) {
      this.checked = !this.checked;
    }

    this.dragData = null;

    // Wait for incoming mouseup click
    this.dragClick = true;
    setTimeout(() => this.dragClick = false, 1);
  }

  onClick() {
    if (!this.dragClick && !this.disabled) {
      this.checked = !this.checked;
    }
  }


  writeValue(value: any): void {
    this.checked = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  get disabled(): string|boolean {
    return this.disabled_;
  }

  set disabled(value: string|boolean) {
    if (typeof value == 'string') {
      this.disabled_ = (value === 'true' || value === '');
    } else {
      this.disabled_ = <boolean> value;
    }

    this._renderer.setElementAttribute(this._elementRef, 'disabled', this.disabled_ ? 'true' : undefined);
  }

  get checked() {
    return !!this.checked_;
  }

  set checked(value) {
    this.checked_ = !!value;
    this.onChange(this.checked_);

    this._renderer.setElementAttribute(this._elementRef, 'aria-checked', this.checked_);
    this.componentElement.classList.toggle('md-checked', this.checked);
  }

}