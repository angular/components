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
  Signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {
  ToolbarPattern,
  ToolbarWidgetPattern,
  ToolbarWidgetGroupPattern,
  ToolbarWidgetGroupControls,
} from '@angular/aria/private';
import {Directionality} from '@angular/cdk/bidi';
import {_IdGenerator} from '@angular/cdk/a11y';

interface HasElement {
  element: Signal<HTMLElement>;
}

/**
 * Sort directives by their document order.
 */
function sortDirectives(a: HasElement, b: HasElement) {
  return (a.element().compareDocumentPosition(b.element()) & Node.DOCUMENT_POSITION_PRECEDING) > 0
    ? 1
    : -1;
}

/**
 * A toolbar widget container.
 *
 * Widgets such as radio groups or buttons are nested within a toolbar to allow for a single
 * place of reference for focus and navigation. The Toolbar is meant to be used in conjunction
 * with ToolbarWidget and RadioGroup as follows:
 *
 * ```html
 * <div ngToolbar>
 *  <button ngToolbarWidget>Button</button>
 *  <div ngRadioGroup>
 *    <label ngRadioButton value="1">Option 1</label>
 *    <label ngRadioButton value="2">Option 2</label>
 *    <label ngRadioButton value="3">Option 3</label>
 *  </div>
 * </div>
 * ```
 */
@Directive({
  selector: '[ngToolbar]',
  exportAs: 'ngToolbar',
  host: {
    'role': 'toolbar',
    'class': 'ng-toolbar',
    '[attr.tabindex]': '_pattern.tabIndex()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.aria-orientation]': '_pattern.orientation()',
    '(keydown)': '_pattern.onKeydown($event)',
    '(pointerdown)': '_pattern.onPointerdown($event)',
    '(focusin)': 'onFocus()',
  },
})
export class Toolbar<V> {
  /** A reference to the toolbar element. */
  private readonly _elementRef = inject(ElementRef);

  /** The TabList nested inside of the container. */
  private readonly _widgets = signal(new Set<ToolbarWidget<V> | ToolbarWidgetGroup<V>>());

  /** A signal wrapper for directionality. */
  readonly textDirection = inject(Directionality).valueSignal;

  /** Sorted UIPatterns of the child widgets */
  readonly items = computed(() =>
    [...this._widgets()].sort(sortDirectives).map(widget => widget._pattern),
  );

  /** Whether the toolbar is vertically or horizontally oriented. */
  readonly orientation = input<'vertical' | 'horizontal'>('horizontal');

  /** Whether to allow disabled items to receive focus. */
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
  private _hasFocused = signal(false);

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
      if (!this._hasFocused()) {
        this._pattern.setDefaultState();
      }
    });
  }

  onFocus() {
    this._hasFocused.set(true);
  }

  register(widget: ToolbarWidget<V> | ToolbarWidgetGroup<V>) {
    const widgets = this._widgets();
    if (!widgets.has(widget)) {
      widgets.add(widget);
      this._widgets.set(new Set(widgets));
    }
  }

  unregister(widget: ToolbarWidget<V> | ToolbarWidgetGroup<V>) {
    const widgets = this._widgets();
    if (widgets.delete(widget)) {
      this._widgets.set(new Set(widgets));
    }
  }

  /** Finds the toolbar item associated with a given element. */
  private _getItem(element: Element) {
    const widgetTarget = element.closest('.ng-toolbar-widget');
    const groupTarget = element.closest('.ng-toolbar-widget-group');
    return this.items().find(
      widget => widget.element() === widgetTarget || widget.element() === groupTarget,
    );
  }
}

/**
 * A widget within a toolbar.
 *
 * A widget is anything that is within a toolbar. It should be applied to any native HTML element
 * that has the purpose of acting as a widget navigatable within a toolbar.
 */
@Directive({
  selector: '[ngToolbarWidget]',
  exportAs: 'ngToolbarWidget',
  host: {
    'class': 'ng-toolbar-widget',
    '[attr.data-active]': '_pattern.active()',
    '[attr.tabindex]': '_pattern.tabIndex()',
    '[attr.inert]': 'hardDisabled() ? true : null',
    '[attr.disabled]': 'hardDisabled() ? true : null',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[id]': '_pattern.id()',
  },
})
export class ToolbarWidget<V> implements OnInit, OnDestroy {
  /** A reference to the widget element. */
  private readonly _elementRef = inject(ElementRef);

  /** The parent Toolbar. */
  private readonly _toolbar = inject(Toolbar);

  /** A unique identifier for the widget. */
  private readonly _generatedId = inject(_IdGenerator).getId('ng-toolbar-widget-', true);

  /** A unique identifier for the widget. */
  readonly id = computed(() => this._generatedId);

  /** The parent Toolbar UIPattern. */
  readonly toolbar = computed(() => this._toolbar._pattern);

  /** A reference to the widget element to be focused on navigation. */
  readonly element = computed(() => this._elementRef.nativeElement);

  /** Whether the widget is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Whether the widget is 'hard' disabled, which is different from `aria-disabled`. A hard disabled widget cannot receive focus. */
  readonly hardDisabled = computed(() => this._pattern.disabled() && !this._toolbar.softDisabled());

  /** The ToolbarWidget UIPattern. */
  readonly _pattern = new ToolbarWidgetPattern<V>({
    ...this,
    id: this.id,
    element: this.element,
    disabled: computed(() => this._toolbar.disabled() || this.disabled()),
  });

  ngOnInit() {
    this._toolbar.register(this);
  }

  ngOnDestroy() {
    this._toolbar.unregister(this);
  }
}

/**
 * A directive that groups toolbar widgets, used for more complex widgets like radio groups that
 * have their own internal navigation.
 */
@Directive({
  host: {
    '[class.ng-toolbar-widget-group]': '!!toolbar()',
  },
})
export class ToolbarWidgetGroup<V> implements OnInit, OnDestroy {
  /** A reference to the widget element. */
  private readonly _elementRef = inject(ElementRef);

  /** The parent Toolbar. */
  private readonly _toolbar = inject(Toolbar, {optional: true});

  /** A unique identifier for the widget. */
  private readonly _generatedId = inject(_IdGenerator).getId('ng-toolbar-widget-group-', true);

  /** A unique identifier for the widget. */
  readonly id = computed(() => this._generatedId);

  /** The parent Toolbar UIPattern. */
  readonly toolbar = computed(() => this._toolbar?._pattern);

  /** A reference to the widget element to be focused on navigation. */
  readonly element = computed(() => this._elementRef.nativeElement);

  /** Whether the widget group is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** The controls that can be performed on the widget group. */
  readonly controls = signal<ToolbarWidgetGroupControls | undefined>(undefined);

  /** The ToolbarWidgetGroup UIPattern. */
  readonly _pattern = new ToolbarWidgetGroupPattern<V>({
    ...this,
    id: this.id,
    element: this.element,
  });

  ngOnInit() {
    this._toolbar?.register(this);
  }

  ngOnDestroy() {
    this._toolbar?.unregister(this);
  }
}
