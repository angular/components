import {ElementRef, Input, Renderer} from '@angular/core';
import {MdError} from '../errors/error';

/** Possible color values for the color input. */
export type MdThemeColor = 'primary' | 'accent' | 'warn';

const VALID_COLOR_VALUES = ['primary', 'accent', 'warn'];

/**
 * Material components can extend the MdThemeable class to add an Input that can
 * developers use to switch palettes on the components.
 **/
export class MdThemeable {

  /** Stored color for the themeable component. */
  private _color: MdThemeColor;

  // Constructor initializers need to have the `protected` modifier to avoid interferences.
  // TypeScript throws if similar declarations, regardless of the modifier, have been
  // found across the different classes. Because of that, the child classes should just use
  // the protected properties from the superclass.
  // TODO(devversion): revisit this once TypeScript v2.2.1 is being used.
  constructor(protected _renderer: Renderer, protected _elementRef: ElementRef) {}

  /** Color of the component. Values are primary, accent, or warn. */
  @Input()
  get color(): MdThemeColor {
    return this._color;
  }
  set color(newColor: MdThemeColor) {
    this._validateColor(newColor);

    this._setElementColor(this._color, false);
    this._setElementColor(newColor, true);
    this._color = newColor;
  }

  /** Validates the specified color value and throws an error if invalid. */
  private _validateColor(color: string) {
    if (color && VALID_COLOR_VALUES.indexOf(color) === -1) {
      throw new MdInvalidColorValueError(color);
    }
  }

  /** Toggles a color class on the components host element. */
  private _setElementColor(color: string, isAdd: boolean) {
    if (color) {
      this._renderer.setElementClass(this._elementRef.nativeElement, `mat-${color}`, isAdd);
    }
  }

}

/** Error that will be thrown if the color input is set to an invalid value. */
export class MdInvalidColorValueError extends MdError {
  constructor(invalidColor: string) {
    super(
      `The color "${invalidColor}" for is not valid. ` +
      `Possible values are: ${VALID_COLOR_VALUES.join(', ')} or null.`
    );
  }
}
