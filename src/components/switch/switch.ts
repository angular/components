import {Component, ViewEncapsulation, ElementRef} from 'angular2/core';
import {MdDrag} from '../../core/services/drag/drag';
import {ControlValueAccessor} from "angular2/common";
import {NgControl} from "angular2/common";
import {Optional} from "angular2/core";

@Component({
  selector: 'md-switch',
  host: {
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

  // Model Values
  value: boolean;

  constructor(private _elementRef: ElementRef, @Optional() ngControl: NgControl) {
    this.elementRef = _elementRef;

    if (ngControl) {
      ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {
    this.componentElement = this.elementRef.nativeElement;
    this.switchContainer = <HTMLElement> this.componentElement.querySelector('.md-container');
    this.thumbContainer = <HTMLElement> this.componentElement.querySelector('.md-thumb-container');

    MdDrag.register(this.switchContainer);

    this.switchContainer.addEventListener('$md.dragstart', (ev: CustomEvent) => this.onDragStart(ev));
    this.switchContainer.addEventListener('$md.drag', (ev: CustomEvent) => this.onDrag(ev));
    this.switchContainer.addEventListener('$md.dragend', (ev: CustomEvent) => this.onDragEnd(ev));
  }


  onDragStart(event: CustomEvent) {
    this.componentElement.classList.add('md-dragging');

    this.dragData = {
      width: this.thumbContainer.offsetWidth
    };

    this.componentElement.classList.remove('transition')
  }

  onDrag(event: CustomEvent) {
    let percent = event.detail.pointer.distanceX / this.dragData.width;

    let translate = this.value ? 1 + percent : percent;
    translate = Math.max(0, Math.min(1, translate));

    this.thumbContainer.style.transform = 'translate3d(' + (100 * translate) + '%,0,0)';
    this.dragData.translate = translate;
  }

  onDragEnd(event: CustomEvent) {
    this.componentElement.classList.remove('md-dragging');
    this.thumbContainer.style.transform = null;


    var isChanged = this.value ? this.dragData.translate < 0.5 : this.dragData.translate > 0.5;
    if (isChanged || !this.dragData.translate) {
      this.changeValue(!this.value);
    }

    this.dragData = null;

    // Wait for incoming mouseup click
    this.dragClick = true;
    setTimeout(() => this.dragClick = false, 1);
  }

  onClick() {
    if (!this.dragClick) this.changeValue(!this.value);
  }

  changeValue(newValue: boolean) {
    this.onChange(newValue);
    this.writeValue(newValue);
  }

  writeValue(value: any): void {
    this.value = !!value;

    // Apply Checked Class
    this.componentElement.classList.toggle('md-checked', this.value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}