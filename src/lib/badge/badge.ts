/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input, ElementRef, Inject, Optional, NgZone} from '@angular/core';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ThemePalette} from '@angular/material/core';
import {AriaDescriber} from '@angular/cdk/a11y';
import {DOCUMENT} from '@angular/common';

let nextId = 0;

export type PositionTypes =
  'above after' |
  'below after' |
  'above before' |
  'above after';

export type BadgeSize =
  'small' |
  'medium' |
  'large';

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
    '[class.mat-badge-small]': 'matBadgeSize === "small"',
    '[class.mat-badge-medium]': 'matBadgeSize === "medium"',
    '[class.mat-badge-large]': 'matBadgeSize === "large"',
    '[class.mat-badge-hidden]': 'matBadgeHidden',
  },
})
export class MatBadge {

  /** The color of the badge. Can be `primary`, `accent`, or `warn`. */
  @Input('matBadgeColor')
  get color(): ThemePalette { return this._color; }
  set color(value: ThemePalette) {
    this._color = value;
    this._setColor(value);
  }
  private _color: ThemePalette = 'primary';

  /** Whether the badge should overlap its contents or not */
  @Input('matBadgeOverlap')
  get overlap(): boolean { return this._overlap; }
  set overlap(val: boolean) {
    this._overlap = coerceBooleanProperty(val);
  }
  private _overlap: boolean = true;

  /**
   * Position the badge should reside.
   * Accepts any combination of 'above'|'below' and 'before'|'after'
   */
  @Input('matBadgePosition')
  get position(): PositionTypes { return this._position; }
  set position(val: PositionTypes) {
    this._position = val;
    this._isAbove = val.indexOf('below') === -1;
    this._isAfter = val.indexOf('before') === -1;
  }
  private _position: PositionTypes = 'above after';

  /** The content for the badge */
  @Input('matBadge')
  get content(): string { return this._content; }
  set content(val: string) {
    this._content = val;
    this._updateTextContent();
  }
  private _content: string;

  /** Message used to describe the decorated element via aria-describedby */
  @Input('matBadgeDescription')
  get description(): string { return this._description; }
  set description(val: string) {
    this._updateHostAriaDescription(val, this._description);
    this._description = val;
  }
  private _description: string;

  /** Size of the badge. Can be 'small' , 'medium', or 'large'. */
  @Input() matBadgeSize: BadgeSize = 'medium';

  /** Whether the badge is hidden. */
  @Input()
  set matBadgeHidden(val: boolean) {
    this._hidden = coerceBooleanProperty(val);
  }
  get matBadgeHidden(): boolean {
    return this._hidden;
  }
  private _hidden: boolean;

  /** Unique id for the badge */
  _id: number = nextId++;

  /** Whether the badge is above the host or not */
  _isAbove: boolean = true;

  /** Whether the badge is after the host or not */
  _isAfter: boolean = true;

  private _badgeElement: HTMLElement;

  constructor(
      @Optional() @Inject(DOCUMENT) private _document: any,
      private _ngZone: NgZone,
      private _elementRef: ElementRef,
      private _ariaDescriber: AriaDescriber) {}

  /** Injects a span element into the DOM with the content. */
  private _updateTextContent(): HTMLSpanElement {
    if (!this._badgeElement) {
      this._badgeElement = this._createBadgeElement();
    } else {
      this._badgeElement.textContent = this.content;
    }
    return this._badgeElement;
  }

  /** Creates the badge element */
  private _createBadgeElement(): HTMLElement {
    let badgeElement = this._document.createElement('span');
    badgeElement.setAttribute('id', `mat-badge-content-${this._id}`);
    badgeElement.classList.add('mat-badge-content');
    badgeElement.textContent = this.content;

    if (this.description) {
      badgeElement.setAttribute('aria-label', this.description);
    }

    this._elementRef.nativeElement.appendChild(badgeElement);

    // animate in after insertion
    this._ngZone.runOutsideAngular(() => requestAnimationFrame(() => {
      // ensure content available
      if (badgeElement) {
        badgeElement.classList.add('mat-badge-active');
      }
    });

    return badgeElement;
  }

  /** Sets the aria-label property on the element */
  private _updateHostAriaDescription(val: string, prevVal: string): void {
    // ensure content available before setting label
    const content = this._updateTextContent();
    this._ariaDescriber.removeDescription(content, prevVal);
    this._ariaDescriber.describe(content, val);
  }

  /** Adds css theme class given the color to the component host */
  private _setColor(value: ThemePalette) {
    const colorPalette = value;
    if (colorPalette !== this._color) {
      if (this._color) {
        this._elementRef.nativeElement.removeClass(`mat-badge-${this._color}`);
      }
      if (colorPalette) {
        this._elementRef.nativeElement.addClass(`mat-badge-${colorPalette}`);
      }
    }
  }

}
