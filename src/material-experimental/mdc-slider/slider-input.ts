/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceNumberProperty} from '@angular/cdk/coercion';
import {AfterViewInit, ChangeDetectorRef, Directive, ElementRef, Input, OnInit} from '@angular/core';
import {Thumb} from '@material/slider';
import {MatSlider} from './slider';

@Directive({
	selector: '[matSliderInput]',
	host: {
		'class': 'mdc-slider__input',
		'type': 'range',
		'[min]': 'min',
		'[max]': 'max',
		'[step]': 'step',
		'[attr.value]': 'value',
	}
}) export class MatSliderInput {
	/** The current value of this slider input. */
	@Input()
	get value(): number { return this._value; };
	set value(v: number) {
		this._value = v;
		if (this._slider.initialized) {
			this._slider.setValue(v, this.thumb);
		}
	};
	private _value: number;

	/** The minimum value that this slider input can have. */
	get min(): number {
		if (this._slider.isRange && this.thumb === Thumb.END) {
			return this._slider.getValue(Thumb.START);
		}
		return this._slider.min;
	};

	/** The maximum value that this slider input can have. */
	get max(): number {
		return this.thumb === Thumb.END
			? this._slider.max
			: this._slider.getValue(Thumb.END);
	};

	/** The size of each increment between the values of the slider. */
	get step(): number { return this._slider.step; }

	/** Indicates which slider thumb this input corresponds to. */
	get thumb(): Thumb { return this._thumb; }
	set thumb(v: Thumb) {
		this._thumb = v;
		this._cdr.detectChanges();
	}
	private _thumb: Thumb;

	constructor(private _el: ElementRef, private _slider: MatSlider, private _cdr: ChangeDetectorRef) {}

	getRootEl(): HTMLInputElement { return this._el.nativeElement; };
}
