import {Constructor} from './constructor';
import {ElementRef, Renderer2} from '@angular/core';

/** List of possible color values that can be set. */
const AVAILABLE_COLOR_VALUES = ['primary', 'accent', 'warn'];

/** @docs-private */
export interface IsColorable {
  color: string;
}

/** @docs-private */
export interface ColorableBase {
  _renderer: Renderer2;
  _elementRef: ElementRef;
}

/** Mixin to augment a directive with a `color` property. */
export function mixinColor<T extends Constructor<ColorableBase>>(base: T, allowNoColor = false)
    : Constructor<IsColorable> & T {
  return class extends base {
    private _color: string = null;

    constructor(...args: any[]) { super(...args); }

    get color(): string { return this._color; }
    set color(value: string) {
      if (AVAILABLE_COLOR_VALUES.indexOf(value) !== -1 || (allowNoColor && !value)) {
        this._setColorClass(this._color, false);
        this._setColorClass(value, true);
        this._color = value;
      }
    }

    /** Method that changes the color classes on the host element. */
    private _setColorClass(colorName: string, isAdd: boolean) {
      if (colorName) {
        if (isAdd) {
          this._renderer.addClass(this._elementRef.nativeElement, `mat-${colorName}`);
        } else {
          this._renderer.removeClass(this._elementRef.nativeElement, `mat-${colorName}`);
        }
      }
    }
  };
}

