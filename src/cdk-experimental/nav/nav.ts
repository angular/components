/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {_IdGenerator} from '@angular/cdk/a11y';
import {
  AfterViewInit,
  booleanAttribute,
  computed,
  contentChildren,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  model,
  signal,
  WritableSignal,
} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {LinkPattern, NavPattern} from '../ui-patterns';

/**
 * A Nav container.
 *
 * Represents a list of navigational links. The CdkNav is a container meant to be used with
 * CdkLink as follows:
 *
 * ```html
 * <nav cdkNav [(value)]="selectedRoute">
 *   <a [value]="'/home'" cdkLink>Home</a>
 *   <a [value]="'/settings'" cdkLink>Settings</a>
 *   <a [value]="'/profile'" cdkLink [disabled]="true">Profile</a>
 * </nav>
 * ```
 */
@Directive({
  selector: '[cdkNav]',
  exportAs: 'cdkNav',
  standalone: true,
  host: {
    'role': 'navigation', // Common role for <nav> elements or nav groups
    'class': 'cdk-nav',
    '[attr.tabindex]': 'pattern.tabindex()',
    '[attr.aria-disabled]': 'pattern.disabled()',
    // aria-orientation is not typically used directly on role="navigation"
    '[attr.aria-activedescendant]': 'pattern.activedescendant()',
    '(keydown)': 'pattern.onKeydown($event)',
    '(pointerdown)': 'pattern.onPointerdown($event)',
  },
})
export class CdkNav<V> implements AfterViewInit {
  /** The directionality (LTR / RTL) context for the application (or a subtree of it). */
  private readonly _directionality = inject(Directionality);

  /** The CdkLinks nested inside of the CdkNav. */
  private readonly _cdkLinks = contentChildren(CdkLink, {descendants: true});

  /** A signal wrapper for directionality. */
  protected textDirection = toSignal(this._directionality.change, {
    initialValue: this._directionality.value,
  });

  /** The Link UIPatterns of the child CdkLinks. */
  protected items = computed(() => this._cdkLinks().map(link => link.pattern as LinkPattern<V>));

  /** Whether the nav is vertically or horizontally oriented. Affects Arrow Key navigation. */
  orientation = input<'vertical' | 'horizontal'>('vertical');

  /** Whether focus should wrap when navigating past the first or last link. */
  wrap = input(false, {transform: booleanAttribute});

  /** Whether disabled items in the list should be skipped when navigating. */
  skipDisabled = input(true, {transform: booleanAttribute});

  /** The focus strategy used by the nav ('roving' or 'activedescendant'). */
  focusMode = input<'roving' | 'activedescendant'>('roving');

  /** Whether the entire nav is disabled. */
  disabled = input(false, {transform: booleanAttribute});

  /** The value of the currently selected link. */
  value = model<V[]>([]);

  /** The index of the currently focused link. */
  activeIndex = model<number>(0);

  /** The internal selection value signal used by the ListSelection behavior (always V[]). */
  private readonly _selectionValue: WritableSignal<V[]> = signal([]);

  /** The amount of time before the typeahead search is reset. */
  typeaheadDelay = input<number>(0.5); // Picked arbitrarily.

  /** The Nav UIPattern instance providing the core logic. */
  pattern: NavPattern<V> = new NavPattern<V>({
    ...this,
    textDirection: this.textDirection,
    items: this.items,
    multi: signal(false),
    selectionMode: signal('explicit'),
  });

  /** Whether the listbox has received focus yet. */
  private _hasFocused = signal(false);

  /** Whether the options in the listbox have been initialized. */
  private _isViewInitialized = signal(false);

  constructor() {
    effect(() => {
      if (this._isViewInitialized() && !this._hasFocused()) {
        this.pattern.setDefaultState();
      }
    });
  }

  ngAfterViewInit() {
    this._isViewInitialized.set(true);
  }

  onFocus() {
    this._hasFocused.set(true);
  }
}

/** A selectable link within a CdkNav container. */
@Directive({
  selector: '[cdkLink]',
  exportAs: 'cdkLink',
  standalone: true,
  host: {
    'role': 'link',
    'class': 'cdk-link',
    // cdk-active reflects focus/active descendant state
    '[class.cdk-active]': 'pattern.active()',
    '[attr.id]': 'pattern.id()',
    '[attr.tabindex]': 'pattern.tabindex()',
    // Use aria-current="page" for the selected/activated link, common for navigation
    '[attr.aria-current]': 'pattern.selected() ? "page" : null',
    '[attr.aria-disabled]': 'pattern.disabled()',
  },
})
export class CdkLink<V> {
  /** A reference to the host link element. */
  private readonly _elementRef = inject(ElementRef<HTMLElement>);

  /** The parent CdkNav instance. */
  private readonly _cdkNav = inject(CdkNav<V>);

  /** A unique identifier for the link, lazily generated. */
  private readonly _idSignal = signal(inject(_IdGenerator).getId('cdk-link-'));

  /** The parent Nav UIPattern from the CdkNav container. */
  protected nav = computed(() => this._cdkNav.pattern);

  /** A signal reference to the host link element. */
  protected element = computed(() => this._elementRef.nativeElement);

  /** Whether the link is disabled. Disabled links cannot be selected or navigated to. */
  disabled = input(false, {transform: booleanAttribute});

  /** The unique value associated with this link (e.g., a route path or identifier). */
  value = input.required<V>();

  /** Optional text used for typeahead matching. Defaults to the element's textContent. */
  label = input<string>();

  /** The text used by the typeahead functionality. */
  protected searchTerm = computed(() => this.label() ?? this.element().textContent?.trim() ?? '');

  /** The Link UIPattern instance providing the core logic for this link. */
  pattern: LinkPattern<V> = new LinkPattern<V>({
    id: this._idSignal,
    value: this.value,
    disabled: this.disabled,
    searchTerm: this.searchTerm,
    nav: this.nav,
    element: this.element,
  });
}
