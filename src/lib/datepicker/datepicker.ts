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
//import {Md2Calendar} from './calendar';

const noop = () => { };

let nextId = 0;

export const MD2_DATEPICKER_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => Md2Datepicker),
  multi: true
};

@Component({
  moduleId: module.id,
  selector: 'md2-datepicker',
  template: `<input [(ngModel)]="value"
                    [type]="type"
                    [disabled]="disabled"
                    [readonly]="readonly"
                    [name]="name"
                    [id]="id"
                    [min]="min"
                    [max]="max"
                    [placeholder]="placeholder"
                    [tabindex]="tabindex" />
  `,
  styleUrls: ['datepicker.css'],
  providers: [MD2_DATEPICKER_CONTROL_VALUE_ACCESSOR],
  encapsulation: ViewEncapsulation.None
})
export class Md2Datepicker implements ControlValueAccessor {

  constructor() { }

  @Output() change: EventEmitter<any> = new EventEmitter<any>();

  private _value: any = '';
  private _isInitialized: boolean = false;
  private _onTouchedCallback: () => void = noop;
  private _onChangeCallback: (_: any) => void = noop;

  @Input() type: 'date' | 'time' | 'datetime' | 'month' = 'date';
  @Input() disabled: boolean;
  @Input() readonly: boolean;
  @Input() required: boolean;
  @Input() name: string = '';
  @Input() id: string = 'md2-datepicker-' + (++nextId);
  @Input() min: number;
  @Input() max: number;
  @Input() placeholder: string;
  @Input() format: string;
  @Input() tabindex: number = 0;

  get value(): any { return this._value; }
  @Input() set value(value: any) {
    if (this._value !== value) {
      this._value = value;
      this.updateValue();
    }
  }

  private updateValue() {
    this._onChangeCallback(this._value);
    this.change.emit(this._value);
  }

  private isFocused: boolean;
  private openCalendarPane(event: Event) { }
  private setFocused(value: boolean) { }

  writeValue(value: any): void { this._value = value; }

  registerOnChange(fn: any) { this._onChangeCallback = fn; }

  registerOnTouched(fn: any) { this._onTouchedCallback = fn; }

}

export const MD2_DATEPICKER_DIRECTIVES = [Md2Datepicker];

@NgModule({
  declarations: MD2_DATEPICKER_DIRECTIVES,
  imports: [CommonModule, FormsModule],
  exports: MD2_DATEPICKER_DIRECTIVES,
})
export class Md2DatepickerModule { }