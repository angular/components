/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbstractConstructor, Constructor} from './constructor';
import {Directive, ElementRef} from '@angular/core';

/** @docs-private */
export interface CanColor {
  /** Theme color palette for the component. */
  color: ThemePalette;

  /** Default color to fall back to if no value is set. */
  defaultColor: ThemePalette | undefined;
}

type CanColorCtor = Constructor<CanColor> & AbstractConstructor<CanColor>;

/** @docs-private */
export interface HasElementRef {
  _elementRef: ElementRef;
}

/** Possible color palette values. */
export type ThemePalette = 'primary' | 'accent' | 'warn' | undefined;

/** Mixin to augment a directive with a `color` property. */
export function mixinColor<T extends AbstractConstructor<HasElementRef>>(
  base: T,
  defaultColor?: ThemePalette,
): CanColorCtor & T;
export function mixinColor<T extends Constructor<HasElementRef>>(
  base: T,
  defaultColor?: ThemePalette,
): CanColorCtor & T {
  @Directive({
    host: {
      // tslint:disable-next-line:validate-decorators
      '[class]': 'colorClass',
    },
    inputs: ['color'],
  })
  class MixinColorBase extends base {
    private _color: ThemePalette;
    defaultColor = defaultColor;

    get color(): ThemePalette {
      return this._color;
    }
    set color(value: ThemePalette) {
      this._color = value || this.defaultColor;
    }

    get colorClass() {
      return this.color ? `mat-${this.color}` : '';
    }

    constructor(...args: any[]) {
      super(...args);

      // Set the default color that can be specified from the mixin.
      this.color = defaultColor;
    }
  }
  return MixinColorBase;
}
