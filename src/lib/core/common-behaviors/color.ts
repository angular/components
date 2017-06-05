import {Constructor} from './constructor';
import {ElementRef, Renderer2} from '@angular/core';

/** @docs-private */
export interface CanColor {
  color: string;
}

/** @docs-private */
export interface HasRenderer {
  _renderer: Renderer2;
  _elementRef: ElementRef;
}

/** Possible color palette values.  */
export type ThemePalette = 'primary' | 'accent' | 'warn' | null;

/** Mixin to augment a directive with a `color` property. */
export function mixinColor<T extends Constructor<HasRenderer>>(base: T, allowNoColor = false)
    : Constructor<CanColor> & T {
  return class extends base {
    private _color: ThemePalette = undefined;

    constructor(...args: any[]) { super(...args); }

    get color(): ThemePalette { return this._color; }
    set color(value: ThemePalette) {
      if (value || allowNoColor && !value) {
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

