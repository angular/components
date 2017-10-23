/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input, Renderer2, ElementRef} from '@angular/core';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ThemePalette} from '@angular/material/core';

let nextId = 0;

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

  /** Theme for the badge */
  @Input()
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
  @Input()
  set matBadgeOverlap(val: boolean) {
    this._overlap = coerceBooleanProperty(val);
  }
  get matBadgeOverlap(): boolean {
    return this._overlap;
  }
  private _overlap: boolean = true;

  /** Position the badge should reside; 'above|below before|after' */
  @Input()
  set matBadgePosition(val: string) {
    this._position = val;
    this._isAbove = val.indexOf('below') === -1;
    this._isAfter = val.indexOf('before') === -1;
  }
  get matBadgePosition(): string {
    return this._position;
  }
  private _position: string = 'above after';

  @Input('matBadge')
  set content(val: string) {
    this._content = val;
    this._setContent();
  }
  get content(): string { return this._content; }
  private _content: string;

  /** Aria description */
  @Input()
  set matBadgeDescription(val: string) {
    this._description = val;
    this._setLabel();
  }
  get matBadgeDescription(): string { return this._description; }
  private _description: string;

  /** Size of the badge */
  @Input() matBadgeSize: string = 'medium';

  @Input()
  set matBadgeHidden(val: boolean) {
    this._hidden = coerceBooleanProperty(val);
  }
  get matBadgeHidden(): boolean {
    return this._hidden;
  }
  private _hidden: boolean;

  _id: number = nextId++;
  _isAbove: boolean = true;
  _isAfter: boolean = true;

  constructor(private _renderer: Renderer2, private _elementRef: ElementRef) {}

  /** Injects a span element into the DOM with the content. */
  private _setContent(): HTMLSpanElement {
    let content = document.getElementById(`badge-content-${this._id}`);

    if (!content) {
      content = document.createElement('span');
      content.setAttribute('id', `badge-content-${this._id}`);
      content.classList.add('mat-badge-content');
      content.textContent = this.content;

      if (this.matBadgeDescription) {
        content.setAttribute('aria-label', this.matBadgeDescription);
      }

      this._elementRef.nativeElement.appendChild(content);

      // animate in after insertion
      setTimeout(() => {
        // ensure content available
        if (content !== null) {
          content.classList.add('mat-badge-active');
        }
      }, 100);
    } else if (content.textContent !== this.content) {
      content.textContent = this.content;
    }

    return content;
  }

  /** Sets the aria-label property on the element */
  private _setLabel(): void {
    // ensure content available before setting label
    const content = this._setContent();
    content.setAttribute('aria-label', this.matBadgeDescription);
  }

}
