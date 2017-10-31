/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Input,
  Renderer2,
  ContentChild,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {
  CanColor,
  CanDisable,
  CanDisableRipple,
  mixinColor,
  mixinDisabled,
  mixinDisableRipple
} from '@angular/material/core';
import {animate, state, style, transition, trigger} from '@angular/animations';

// Boilerplate for applying mixins to MatFab.
/** @docs-private */
export class MatFabBase {
  constructor(public _renderer: Renderer2, public _elementRef: ElementRef) {}
}
export const _MatFabBase = mixinColor(mixinDisabled(mixinDisableRipple(MatFabBase)), 'accent');

@Directive({
  selector: `button[mat-mini-fab], a[mat-mini-fab]`,
  host: {
    'class': 'mat-mini-fab'
  }
})
export class MatFabMini {}


/**
 * Material design button.
 */
@Component({
  moduleId: module.id,
  selector: `button[mat-fab], a[mat-fab], button[mat-mini-fab], a[mat-mini-fab]`,
  exportAs: 'matFab, matButton, matAnchor',
  host: {
    'class': 'mat-fab',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.tabindex]': 'disabled ? null : 0',
    '[attr.disabled]': 'disabled || null',
    '[class.mat-fab-focused]': '_currentlyFocused',
    '[class.mat-fab-extended]': '_isExtended()',
    '(blur)': '_currentlyFocused = false',
    '(click)': '_haltDisabledEvents($event)',
    '(focus)': '_currentlyFocused = true',
    '(mouseover)': '_currentlyHovered = true',
    '(mouseleave)': '_currentlyHovered = false',
  },
  templateUrl: 'fab.html',
  styleUrls: ['fab.css'],
  inputs: ['disabled', 'disableRipple', 'color'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('extendContent', [
      state('false', style({'margin': '0', 'min-width': '*', width: '0'})),
      state('true', style({'margin': '*', 'min-width': '130px', width: '*'})),
      transition('false <=> true', animate(250)),
    ])
  ],
})
export class MatFab extends _MatFabBase implements CanDisable, CanColor, CanDisableRipple {
  /** The template to be used for the label in the FAB. */
  @ContentChild('label') label: TemplateRef<any>;

  /** Whether the FAB is currently hovered. */
  _currentlyHovered: boolean = false;

  /** Whether the FAB is currently focused. */
  _currentlyFocused: boolean = false;

  /** The location of the label in reference to the main content. */
  @Input() labelLocation: 'before'|'after' = 'after';

  /** Whether the FAB is currently extended. */
  @Input() extended = false;

  /** Whether the FAB should extend when hovered. */
  @Input()
  get extendOnHover(): boolean { return this._extendOnHover; }
  set extendOnHover(extend: boolean) { this._extendOnHover = coerceBooleanProperty(extend); }
  private _extendOnHover = false;

  /** Whether the FAB should extend when focused. */
  @Input()
  get extendOnFocus(): boolean { return this._extendOnFocus; }
  set extendOnFocus(extend: boolean) { this._extendOnFocus = coerceBooleanProperty(extend); }
  private _extendOnFocus = false;

  constructor(renderer: Renderer2, elementRef: ElementRef) {
    super(renderer, elementRef);
  }

  /** Focuses the FAB. */
  focus(): void {
    this._getHostElement().focus();
  }

  /** Retrieves the host element of the FAB. */
  _getHostElement() {
    return this._elementRef.nativeElement;
  }

  /** Whether the ripple is disabled. */
  _isRippleDisabled() {
    return this.disableRipple || this.disabled;
  }

  /** If the FAB is disabled, prevent the default events and propagation of events. */
  _haltDisabledEvents(event: Event) {
    // A disabled FAB shouldn't apply any actions
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  /** Whether the FAB is extended. */
  _isExtended(): boolean {
    return !!this.label && (this.extended  ||
           (this.extendOnHover && this._currentlyHovered) ||
           (this.extendOnFocus && this._currentlyFocused));
  }
}
