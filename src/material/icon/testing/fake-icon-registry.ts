/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, NgModule, OnDestroy} from '@angular/core';
import {MatIconRegistry} from '@angular/material/icon';
import {Observable, of as observableOf} from 'rxjs';

type PublicApi<T> = {
  [K in keyof T]: T[K] extends (...x: any[]) => T ? (...x: any[]) => PublicApi<T> : T[K];
};

/**
 * A null icon registry that must be imported to allow disabling of custom
 * icons.
 */
@Injectable()
export class FakeMatIconRegistry implements PublicApi<MatIconRegistry>, OnDestroy {
  addSvgIcon(): this {
    return this;
  }

  addSvgIconLiteral(): this {
    return this;
  }

  addSvgIconInNamespace(): this {
    return this;
  }

  addSvgIconLiteralInNamespace(): this {
    return this;
  }

  addSvgIconSet(): this {
    return this;
  }

  addSvgIconSetLiteral(): this {
    return this;
  }

  addSvgIconSetInNamespace(): this {
    return this;
  }

  addSvgIconSetLiteralInNamespace(): this {
    return this;
  }

  registerFontClassAlias(): this {
    return this;
  }

  classNameForFontAlias(alias: string): string {
    return alias;
  }

  getDefaultFontSetClass() {
    return ['material-symbols-outlined'];
  }

  getSvgIconFromUrl(): Observable<SVGElement> {
    return observableOf(this._generateEmptySvg());
  }

  getNamedSvgIcon(): Observable<SVGElement> {
    return observableOf(this._generateEmptySvg());
  }

  setDefaultFontSetClass(): this {
    return this;
  }

  addSvgIconResolver(): this {
    return this;
  }

  ngOnDestroy() {}

  private _generateEmptySvg(): SVGElement {
    const emptySvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    emptySvg.classList.add('fake-testing-svg');
    // Emulate real icon characteristics from `MatIconRegistry` so size remains consistent in tests.
    emptySvg.setAttribute('fit', '');
    emptySvg.setAttribute('height', '100%');
    emptySvg.setAttribute('width', '100%');
    emptySvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    emptySvg.setAttribute('focusable', 'false');
    return emptySvg;
  }
}

/** Import this module in tests to install the null icon registry. */
@NgModule({
  providers: [{provide: MatIconRegistry, useClass: FakeMatIconRegistry}],
})
export class MatIconTestingModule {}
