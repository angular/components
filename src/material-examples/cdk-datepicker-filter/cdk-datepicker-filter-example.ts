import {Component, Directive, ElementRef, forwardRef, Inject, Input, Optional} from '@angular/core';
import {CDK_DATE_FORMATS, CdkDateFormats, CdkDatepicker, CdkDatepickerInput, DateAdapter} from '@angular/cdk/datetime';
import {NG_VALIDATORS, NG_VALUE_ACCESSOR} from '@angular/forms';
import {MAT_INPUT_VALUE_ACCESSOR} from "@angular/material/input";

/** @title CDK Datepicker with filter validation */
@Component({
  selector: 'cdk-datepicker-filter-example',
  templateUrl: 'cdk-datepicker-filter-example.html',
  styleUrls: ['cdk-datepicker-filter-example.css'],
})
export class CdkDatepickerFilterExample {
  myFilter = (d: Date): boolean => {
    const day = d.getDay();
    // Prevent Saturday and Sunday from being selected.
    return day !== 0 && day !== 6;
  }
}

const DATEPICKER_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CdkDatepickerInput),
    multi: true
};

const DATEPICKER_VALIDATORS: any = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => CdkDatepickerInput),
    multi: true
};

@Component({
  selector: 'my-filter-datepicker',
  inputs: ['startAt', 'disabled'],
  template: `
  `,
})
export class MyFilterDatepicker<D> extends CdkDatepicker<D> {

    constructor(_dateAdapter: DateAdapter<D>) {
        super(_dateAdapter);
    }
    /** The input element this datepicker is associated with. */
    _datepickerInput: MyFilterDatepickerInput<D>;

    /**
     * Register an input with this datepicker.
     * @param input The datepicker input to register with this datepicker.
     */
    _registerInput(input: MyFilterDatepickerInput<D>): void {
        if (this._datepickerInput) {
            throw Error('A MyFilterDatepicker can only be associated with a single input.');
        }
        this._datepickerInput = input;
        this._inputSubscription =
            this._datepickerInput._valueChange.subscribe((value: D | null) => this._selected = value);
    }
}

/** Directive used to connect an input to a CdkDatepicker. */
@Directive({
    selector: 'input[myFilterDatepicker]',
    providers: [
        DATEPICKER_VALUE_ACCESSOR,
        DATEPICKER_VALIDATORS,
        {provide: MAT_INPUT_VALUE_ACCESSOR, useExisting: MyFilterDatepickerInput},
    ],
    host: {
        '[attr.aria-owns]': '(_datepicker.id) || null',
        '[attr.min]': 'min ? _dateAdapter.toIso8601(min) : null',
        '[attr.max]': 'max ? _dateAdapter.toIso8601(max) : null',
        '[disabled]': 'disabled',
        '(input)': '_onInput($event.target.value)',
        '(change)': '_onChange()',
        '(blur)': '_onBlur()',
    },
    exportAs: 'myFilterDatepickerInput',
})
class MyFilterDatepickerInput<D> extends CdkDatepickerInput<D> {
    /** The datepicker that this input is associated with. */
    protected _formControlValidatorPrefix = 'myFilter';

    @Input()
    set myFilterDatepicker(value: MyFilterDatepicker<D>) {
        this.registerDatepicker(value);
    }
    _datepicker: MyFilterDatepicker<D>;

    private registerDatepicker(value: MyFilterDatepicker<D>) {
        if (value) {
            this._datepicker = value;
            this._datepicker._registerInput(this);
        }
    }

    /** Function that can be used to filter out dates within the datepicker. */
    @Input()
    set myFilterDatepickerFilter(value: (date: D | null) => boolean) {
        this.filter = value;
    }
    constructor(
        _elementRef: ElementRef,
        @Optional() _dateAdapter: DateAdapter<D>,
        @Optional() @Inject(CDK_DATE_FORMATS) _cdkDateFormats: CdkDateFormats) {
        super(_elementRef, _dateAdapter, _cdkDateFormats);
    }
}
