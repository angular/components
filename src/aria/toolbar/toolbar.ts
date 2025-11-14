/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterRenderEffect,
  Directive,
  ElementRef,
  inject,
  computed,
  input,
  booleanAttribute,
  signal,
  OnInit,
  OnDestroy,
  contentChildren,
} from '@angular/core';
import {
  ToolbarPattern,
  ToolbarWidgetPattern,
  ToolbarWidgetGroupPattern,
  SignalLike,
} from '@angular/aria/private';
import {Directionality} from '@angular/cdk/bidi';
import {_IdGenerator} from '@angular/cdk/a11y';

interface HasElement {
  element: HTMLElement;
}

/**
 * Sort directives by their document order.
 */
function sortDirectives(a: HasElement, b: HasElement) {
  return (a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_PRECEDING) > 0
    ? 1
    : -1;
}

/**
 * A toolbar widget container for a group of interactive widgets, such as
 * buttons or radio groups. It provides a single point of reference for keyboard navigation
 * and focus management. It supports various orientations and disabled states.
 *
 * ```html
 * <div ngToolbar orientation="horizontal" [wrap]="true">
 *   <button ngToolbarWidget value="save">Save</button>
 *   <button ngToolbarWidget value="print">Print</button>
 *
 *   <div ngToolbarWidgetGroup [(value)]="selectedAlignment">
 *     <button ngToolbarWidget value="left">Left</button>
 *     <button ngToolbarWidget value="center">Center</button>
 *     <button ngToolbarWidget value="right">Right</button>
 *   </div>
 * </div>
 * ```
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: '[ngToolbar]',
  exportAs: 'ngToolbar',
  host: {
    'role': 'toolbar',
    '[attr.tabindex]': '_pattern.tabIndex()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.aria-orientation]': '_pattern.orientation()',
    '(keydown)': '_pattern.onKeydown($event)',
    '(click)': '_pattern.onClick($event)',
    '(pointerdown)': '_pattern.onPointerdown($event)',
    '(focusin)': '_onFocus()',
  },
})
export class Toolbar<V> {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The TabList nested inside of the container. */
  private readonly _widgets = signal(new Set<ToolbarWidget<V>>());

  /** Text direction. */
  readonly textDirection = inject(Directionality).valueSignal;

  /** Sorted UIPatterns of the child widgets */
  readonly items = computed(() =>
    [...this._widgets()].sort(sortDirectives).map(widget => widget._pattern),
  );

  /** Whether the toolbar is vertically or horizontally oriented. */
  readonly orientation = input<'vertical' | 'horizontal'>('horizontal');

  /**
   * Whether to allow disabled items to receive focus. When `true`, disabled items are
   * focusable but not interactive. When `false`, disabled items are skipped during navigation.
   */
  softDisabled = input(true, {transform: booleanAttribute});

  /** Whether the toolbar is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Whether focus should wrap when navigating. */
  readonly wrap = input(true, {transform: booleanAttribute});

  /** The toolbar UIPattern. */
  readonly _pattern: ToolbarPattern<V> = new ToolbarPattern<V>({
    ...this,
    activeItem: signal(undefined),
    textDirection: this.textDirection,
    element: () => this._elementRef.nativeElement,
    getItem: e => this._getItem(e),
  });

  /** Whether the toolbar has received focus yet. */
  private _hasBeenFocused = signal(false);

  constructor() {
    afterRenderEffect(() => {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        const violations = this._pattern.validate();
        for (const violation of violations) {
          console.error(violation);
        }
      }
    });

    afterRenderEffect(() => {
      if (!this._hasBeenFocused()) {
        this._pattern.setDefaultState();
      }
    });
  }

  _onFocus() {
    this._hasBeenFocused.set(true);
  }

  register(widget: ToolbarWidget<V>) {
    const widgets = this._widgets();
    if (!widgets.has(widget)) {
      widgets.add(widget);
      this._widgets.set(new Set(widgets));
    }
  }

  unregister(widget: ToolbarWidget<V>) {
    const widgets = this._widgets();
    if (widgets.delete(widget)) {
      this._widgets.set(new Set(widgets));
    }
  }

  /** Finds the toolbar item associated with a given element. */
  private _getItem(element: Element) {
    const widgetTarget = element.closest('[ngToolbarWidget]');
    return this.items().find(widget => widget.element() === widgetTarget);
  }
}

/**
 * A widget within a toolbar.
 *
 * The `ngToolbarWidget` directive should be applied to any native HTML element that acts
 * as an interactive widget within an `ngToolbar` or `ngToolbarWidgetGroup`. It enables
 * keyboard navigation and selection within the toolbar.
 *
 * ```html
 * <button ngToolbarWidget value="action-id" [disabled]="isDisabled">
 *   Perform Action
 * </button>
 * ```
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: '[ngToolbarWidget]',
  exportAs: 'ngToolbarWidget',
  host: {
    '[attr.data-active]': 'active()',
    '[attr.tabindex]': '_pattern.tabIndex()',
    '[attr.inert]': 'hardDisabled() ? true : null',
    '[attr.disabled]': 'hardDisabled() ? true : null',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[id]': '_pattern.id()',
  },
})
export class ToolbarWidget<V> implements OnInit, OnDestroy {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The parent Toolbar. */
  private readonly _toolbar = inject(Toolbar);

  /** A unique identifier for the widget. */
  readonly id = input(inject(_IdGenerator).getId('ng-toolbar-widget-', true));

  /** The parent Toolbar UIPattern. */
  readonly toolbar = computed(() => this._toolbar._pattern);

  /** Whether the widget is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Whether the widget is 'hard' disabled, which is different from `aria-disabled`. A hard disabled widget cannot receive focus. */
  readonly hardDisabled = computed(() => this._pattern.disabled() && !this._toolbar.softDisabled());

  /** The optional ToolbarWidgetGroup this widget belongs to. */
  readonly _group = inject(ToolbarWidgetGroup, {optional: true});

  /** The value associated with the widget. */
  readonly value = input.required<V>();

  /** Whether the widget is currently active (focused). */
  readonly active = computed(() => this._pattern.active());

  /** Whether the widget is selected (only relevant in a selection group). */
  readonly selected = () => this._pattern.selected();

  readonly group: SignalLike<ToolbarWidgetGroupPattern<ToolbarWidgetPattern<V>, V> | undefined> =
    () => this._group?._pattern;

  /** The ToolbarWidget UIPattern. */
  readonly _pattern = new ToolbarWidgetPattern<V>({
    ...this,
    id: this.id,
    value: this.value,
    element: () => this.element,
  });

  ngOnInit() {
    this._toolbar.register(this);
  }

  ngOnDestroy() {
    this._toolbar.unregister(this);
  }
}

/**
 * A directive that groups toolbar widgets, used for more complex widgets like radio groups
 * that have their own internal navigation.
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: '[ngToolbarWidgetGroup]',
  exportAs: 'ngToolbarWidgetGroup',
})
export class ToolbarWidgetGroup<V> {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The parent Toolbar. */
  private readonly _toolbar = inject(Toolbar, {optional: true});

  /** The list of child widgets within the group. */
  private readonly _widgets = contentChildren(ToolbarWidget<V>, {descendants: true});

  /** The parent Toolbar UIPattern. */
  readonly toolbar = computed(() => this._toolbar?._pattern);

  /** Whether the widget group is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** The list of toolbar items within the group. */
  readonly items = () => this._widgets().map(w => w._pattern);

  /** Whether the group allows multiple widgets to be selected. */
  readonly multi = input(false, {transform: booleanAttribute});

  /** The ToolbarWidgetGroup UIPattern. */
  readonly _pattern = new ToolbarWidgetGroupPattern<ToolbarWidgetPattern<V>, V>(this);
}
