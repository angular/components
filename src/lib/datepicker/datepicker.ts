import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ViewEncapsulation,
  NgModule
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormsModule
} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MdCalendar} from './calendar';

const noop = () => { };

let nextId = 0;

export const MD_DATEPICKER_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MdDatepicker),
  multi: true
};

@Component({
  moduleId: module.id,
  selector: 'md2-datepicker',
  templateUrl: 'datepicker.html',
  styleUrls: ['datepicker.css'],
  providers: [MD_DATEPICKER_CONTROL_VALUE_ACCESSOR],
  encapsulation: ViewEncapsulation.None
})
export class MdDatepicker implements ControlValueAccessor {

  constructor() { }

  @Output() change: EventEmitter<any> = new EventEmitter<any>();

  private _value: any = '';
  private _isInitialized: boolean = false;
  private _onTouchedCallback: () => void = noop;
  private _onChangeCallback: (_: any) => void = noop;

  @Input() id: string = 'md-datepicker-' + (++nextId);
  @Input() disabled: boolean = false;
  @Input() tabindex: number = 0;
  @Input() placeholder: string = '';

  get value(): any { return this._value; }
  @Input() set value(value: any) { this._value = value; }


  //private updateValue() {
  //  this._value = this.selectedItem ? this.selectedItem.value : this.selectedItem;
  //  this._onChangeCallback(this._value);
  //  this.change.emit(this._value);
  //  this.onFocus();
  //}







  private isFocused: boolean;
  private openCalendarPane(event: Event) { }
  private setFocused(value: boolean) { }

  writeValue(value: any): void { this._value = value; }

  registerOnChange(fn: any) { this._onChangeCallback = fn; }

  registerOnTouched(fn: any) { this._onTouchedCallback = fn; }

}

export const MD_DATEPICKER_DIRECTIVES = [MdDatepicker, MdCalendar];

@NgModule({
  declarations: MD_DATEPICKER_DIRECTIVES,
  imports: [CommonModule, FormsModule],
  exports: MD_DATEPICKER_DIRECTIVES,
})
export class Md2DatepickerModule { }