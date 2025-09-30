import {Component, Input, forwardRef} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatOptionModule} from '@angular/material/core';

/**
 * @title Custom wrapper components for Material form controls
 */
@Component({
  selector: 'form-field-custom-wrapper-example',
  templateUrl: 'form-field-custom-wrapper-example.html',
  styleUrl: 'form-field-custom-wrapper-example.css',
  imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    forwardRef(() => PermissionSelectComponent),
    forwardRef(() => PhoneInputComponent),
  ],
})
export class FormFieldCustomWrapperExample {
  permissionControl = new FormControl('read');
  phoneControl = new FormControl('');
}

@Component({
  selector: 'app-permission-select',
  template: `
    <mat-select
      [value]="value"
      [placeholder]="placeholder"
      [disabled]="disabled"
      (selectionChange)="onSelectionChange($event)">
      <mat-option value="read">Read Only</mat-option>
      <mat-option value="write">Read & Write</mat-option>
      <mat-option value="admin">Administrator</mat-option>
    </mat-select>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PermissionSelectComponent),
      multi: true,
    },
  ],
  imports: [MatSelectModule, MatOptionModule],
})
export class PermissionSelectComponent implements ControlValueAccessor {
  @Input() placeholder = 'Select permission';
  @Input() disabled = false;

  value: string | null = null;

  private _onChange = (value: any) => {};
  private _onTouched = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelectionChange(event: any): void {
    this.value = event.value;
    this._onChange(this.value);
    this._onTouched();
  }
}

@Component({
  selector: 'app-phone-input',
  template: `
    <input
      matInput
      [value]="value || ''"
      [placeholder]="placeholder"
      [disabled]="disabled"
      (input)="onInput($event)"
      (blur)="onBlur()"
      type="tel">
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true,
    },
  ],
  imports: [MatInputModule],
})
export class PhoneInputComponent implements ControlValueAccessor {
  @Input() placeholder = 'Enter phone number';
  @Input() disabled = false;

  value: string | null = null;

  private _onChange = (value: any) => {};
  private _onTouched = () => {};

  writeValue(value: any): void {
    this.value = this._formatPhoneNumber(value);
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: any): void {
    const rawValue = event.target.value;
    this.value = this._formatPhoneNumber(rawValue);
    this._onChange(this.value);
  }

  onBlur(): void {
    this._onTouched();
  }

  private _formatPhoneNumber(value: string): string {
    if (!value) return '';

    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX
    if (digits.length >= 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }

    return digits;
  }
}
