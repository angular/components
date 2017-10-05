/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input, Renderer2, ElementRef} from '@angular/core';
import {MatIconRegistry} from '@angular/material/icon';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ThemePalette} from '@angular/material/core';

let nextId = 0;

 /** @docs-private */
export class MatBadgeBase {

  /** Theme for the badge */
  get matBadgeColor(): ThemePalette { return this._color; }
  set matBadgeColor(value: ThemePalette) {
    const colorPalette = value;

    if (colorPalette !== this._color) {
      if (this._color) {
        this._renderer.removeClass(this._elementRef.nativeElement, `mat-badge-${this._color}`);
      }
      if (colorPalette) {
        this._renderer.addClass(this._elementRef.nativeElement, `mat-badge-${colorPalette}`);
      }

      this._color = colorPalette;
    }
  }
  private _color: ThemePalette = 'primary';

  /** Whether the badge should overlap its contents or not */
  set matBadgeOverlap(val: boolean) {
    this._overlap = coerceBooleanProperty(val);
  }
  get matBadgeOverlap(): boolean {
    return this._overlap;
  }
  private _overlap: boolean = true;

  /** Position the badge should reside; 'above|below before|after' */
  set matBadgePosition(val: string) {
    this._position = val;
    this._isAbove = val.indexOf('below') === -1;
    this._isAfter = val.indexOf('before') === -1;
  }
  get matBadgePosition(): string {
    return this._position;
  }
  private _position: string = 'above after';

  _id: number = nextId++;
  _isAbove: boolean = true;
  _isBelow: boolean = false;
  _isBefore: boolean = false;
  _isAfter: boolean = true;

  constructor(public _renderer: Renderer2, public _elementRef: ElementRef) {}

  /** Clears the previous badge content */
  _clearContents(): void {
    const contents = document.getElementById(`badge-content-${this._id}`);
    if (contents) {
      this._renderer.removeChild(this._elementRef.nativeElement, contents);
    }
  }
}

/** Directive to display a text badge. */
@Directive({
  selector: '[matBadge]',
  inputs: ['matBadgeColor', 'matBadgeOverlap', 'matBadgePosition'],
  host: {
    'class': 'mat-badge',
    '[class.mat-badge-overlap]': '_overlap',
    '[class.mat-badge-above]': '_isAbove',
    '[class.mat-badge-below]': '!_isAbove',
    '[class.mat-badge-before]': '!_isAfter',
    '[class.mat-badge-after]': '_isAfter',
  },
})
export class MatBadge extends MatBadgeBase {

  @Input('matBadge')
  set content(val: string) {
    this._content = val;
    this._clearContents();
    this._setContent();
  }
  get content(): string { return this._content; }
  private _content: string;

  constructor(_renderer: Renderer2, _elementRef: ElementRef) {
    super(_renderer, _elementRef);
  }

  /** Injects a span element into the DOM with the content. */
  private _setContent(): void {
    let pane = document.createElement('span');
    pane.setAttribute('id', `badge-content-${this._id}`);
    pane.classList.add('mat-badge-content');
    pane.innerText = this.content;
    this._elementRef.nativeElement.appendChild(pane);
  }
}

/** Directive to display a font icon badge. */
@Directive({
  selector: '[matIconBadge]',
  inputs: ['matBadgeColor', 'matBadgeOverlap', 'matBadgePosition'],
  host: {
    'class': 'mat-badge',
    '[class.mat-badge-overlap]': '_overlap',
    '[class.mat-badge-above]': '_isAbove',
    '[class.mat-badge-below]': '!_isAbove',
    '[class.mat-badge-before]': '!_isAfter',
    '[class.mat-badge-after]': '_isAfter',
  },
})
export class MatIconBadge extends MatBadgeBase {

  @Input('matIconBadge')
  set icon(val: string) {
    this._icon = val;
    this._clearContents();
    this._setFontIcon();
  }
  get icon(): string { return this._icon; }
  private _icon: string;

  /** Font set to use for the icon */
  @Input() matBadgeFontSet: string;

  constructor(
      private _iconRegistry: MatIconRegistry,
      _elementRef: ElementRef,
      _renderer: Renderer2) {
    super(_renderer, _elementRef);
  }

  /**  Gets the font icon set to use. */
  private _getFontSet(): string {
    return this.matBadgeFontSet ?
        this._iconRegistry.classNameForFontAlias(this.matBadgeFontSet) :
        this._iconRegistry.getDefaultFontSetClass();
  }

  /**
   * Gets the font icon from the icon registery and injects it into the document.
   */
  private _setFontIcon(): void {
    let pane = document.createElement('span');
    pane.setAttribute('id', `badge-content-${this._id}`);
    pane.classList.add(this._getFontSet());
    pane.classList.add('mat-badge-icon');
    pane.innerText = this.icon;
    this._elementRef.nativeElement.appendChild(pane);
  }
}

/**  Directive to display a SVG icon badge. */
@Directive({
  selector: '[matSvgIconBadge]',
  inputs: ['matBadgeColor', 'matBadgeOverlap', 'matBadgePosition'],
  host: {
    'class': 'mat-badge',
    '[class.mat-badge-overlap]': '_overlap',
    '[class.mat-badge-above]': '_isAbove',
    '[class.mat-badge-below]': '!_isAbove',
    '[class.mat-badge-before]': '!_isAfter',
    '[class.mat-badge-after]': '_isAfter',
  },
})
export class MatSvgIconBadge extends MatBadgeBase {

  @Input('matSvgIconBadge')
  set icon(val: string) {
    this._icon = val;
    this._clearContents();
    this._setSvgIcon();
  }
  get icon(): string { return this._icon; }
  private _icon: string;

  constructor(
      private _iconRegistry: MatIconRegistry,
      _elementRef: ElementRef,
      _renderer: Renderer2) {
    super(_renderer, _elementRef);
  }

  /**
   * Splits an svgIcon binding value into its icon set and icon name components.
   */
  private _splitIconName(iconName: string): [string, string] {
    if (!iconName) {
      return ['', ''];
    }
    const parts = iconName.split(':');
    switch (parts.length) {
      case 1: return ['', parts[0]]; // Use default namespace.
      case 2: return <[string, string]>parts;
      default: throw Error(`Invalid icon name: "${iconName}"`);
    }
  }

  /**
   * Gets the icon from the icon registery and injects it into the document.
   */
  private _setSvgIcon(): void {
    const [namespace, iconName] = this._splitIconName(this.icon);
    this._iconRegistry.getNamedSvgIcon(iconName, namespace).subscribe((svg) => {
      svg.setAttribute('id', `badge-content-${this._id}`);
      svg.classList.add('mat-badge-svg-icon');
      this._elementRef.nativeElement.appendChild(svg);
    });
  }
}
