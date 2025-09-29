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
} from '@angular/aria/ui-patterns';
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
 * <div toolbar>
 *  <button toolbarWidget>Button</button>
 *  <div radioGroup>
 *    <label radioButton value="1">Option 1</label>
 *    <label radioButton value="2">Option 2</label>
 *    <label radioButton value="3">Option 3</label>
 *  </div>
 * </div>
 * ```
 */
@Directive({
  selector: '[toolbar]',
  exportAs: 'toolbar',
  host: {
    'role': 'toolbar',
    'class': 'toolbar',
    '[attr.tabindex]': 'pattern.tabindex()',
    '[attr.aria-disabled]': 'pattern.disabled()',
    '[attr.aria-orientation]': 'pattern.orientation()',
    '(keydown)': 'pattern.onKeydown($event)',
    '(pointerdown)': 'pattern.onPointerdown($event)',
    '(focusin)': 'onFocus()',
  },
})
export class Toolbar<V> {
  /** A reference to the toolbar element. */
  private readonly _elementRef = inject(ElementRef);

  /** The TabList nested inside of the container. */
  private readonly _Widgets = signal(new Set<ToolbarWidget<V> | ToolbarWidgetGroup<V>>());

  /** A signal wrapper for directionality. */
  readonly textDirection = inject(Directionality).valueSignal;

  /** Sorted UIPatterns of the child widgets */
  readonly items = computed(() =>
    [...this._Widgets()].sort(sortDirectives).map(widget => widget.pattern),
  );

  /** Whether the toolbar is vertically or horizontally oriented. */
  readonly orientation = input<'vertical' | 'horizontal'>('horizontal');

  /** Whether disabled items in the group should be skipped when navigating. */
  readonly skipDisabled = input(false, {transform: booleanAttribute});

  /** Whether the toolbar is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Whether focus should wrap when navigating. */
  readonly wrap = input(true, {transform: booleanAttribute});

  /** The toolbar UIPattern. */
  readonly pattern: ToolbarPattern<V> = new ToolbarPattern<V>({
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
        const violations = this.pattern.validate();
        for (const violation of violations) {
          console.error(violation);
        }
      }
    });

    afterRenderEffect(() => {
      if (!this._hasFocused()) {
        this.pattern.setDefaultState();
      }
    });
  }

  onFocus() {
    this._hasFocused.set(true);
  }

  register(widget: ToolbarWidget<V> | ToolbarWidgetGroup<V>) {
    const widgets = this._Widgets();
    if (!widgets.has(widget)) {
      widgets.add(widget);
      this._Widgets.set(new Set(widgets));
    }
  }

  unregister(widget: ToolbarWidget<V> | ToolbarWidgetGroup<V>) {
    const widgets = this._Widgets();
    if (widgets.delete(widget)) {
      this._Widgets.set(new Set(widgets));
    }
  }

  /** Finds the toolbar item associated with a given element. */
  private _getItem(element: Element) {
    const widgetTarget = element.closest('.toolbar-widget');
    const groupTarget = element.closest('.toolbar-widget-group');
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
  selector: '[toolbarWidget]',
  exportAs: 'toolbarWidget',
  host: {
    'class': 'toolbar-widget',
    '[attr.data-active]': 'pattern.active()',
    '[attr.tabindex]': 'pattern.tabindex()',
    '[attr.inert]': 'hardDisabled() ? true : null',
    '[attr.disabled]': 'hardDisabled() ? true : null',
    '[attr.aria-disabled]': 'pattern.disabled()',
    '[id]': 'pattern.id()',
  },
})
export class ToolbarWidget<V> implements OnInit, OnDestroy {
  /** A reference to the widget element. */
  private readonly _elementRef = inject(ElementRef);

  /** The parent Toolbar. */
  private readonly _Toolbar = inject(Toolbar);

  /** A unique identifier for the widget. */
  private readonly _generatedId = inject(_IdGenerator).getId('toolbar-widget-');

  /** A unique identifier for the widget. */
  readonly id = computed(() => this._generatedId);

  /** The parent Toolbar UIPattern. */
  readonly toolbar = computed(() => this._Toolbar.pattern);

  /** A reference to the widget element to be focused on navigation. */
  readonly element = computed(() => this._elementRef.nativeElement);

  /** Whether the widget is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Whether the widget is 'hard' disabled, which is different from `aria-disabled`. A hard disabled widget cannot receive focus. */
  readonly hardDisabled = computed(() => this.pattern.disabled() && this._Toolbar.skipDisabled());

  /** The ToolbarWidget UIPattern. */
  readonly pattern = new ToolbarWidgetPattern<V>({
    ...this,
    id: this.id,
    element: this.element,
    disabled: computed(() => this._Toolbar.disabled() || this.disabled()),
  });

  ngOnInit() {
    this._Toolbar.register(this);
  }

  ngOnDestroy() {
    this._Toolbar.unregister(this);
  }
}

/**
 * A directive that groups toolbar widgets, used for more complex widgets like radio groups that
 * have their own internal navigation.
 */
@Directive({
  host: {
    '[class.toolbar-widget-group]': '!!toolbar()',
  },
})
export class ToolbarWidgetGroup<V> implements OnInit, OnDestroy {
  /** A reference to the widget element. */
  private readonly _elementRef = inject(ElementRef);

  /** The parent Toolbar. */
  private readonly _Toolbar = inject(Toolbar, {optional: true});

  /** A unique identifier for the widget. */
  private readonly _generatedId = inject(_IdGenerator).getId('toolbar-widget-group-');

  /** A unique identifier for the widget. */
  readonly id = computed(() => this._generatedId);

  /** The parent Toolbar UIPattern. */
  readonly toolbar = computed(() => this._Toolbar?.pattern);

  /** A reference to the widget element to be focused on navigation. */
  readonly element = computed(() => this._elementRef.nativeElement);

  /** Whether the widget group is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** The controls that can be performed on the widget group. */
  readonly controls = signal<ToolbarWidgetGroupControls | undefined>(undefined);

  /** The ToolbarWidgetGroup UIPattern. */
  readonly pattern = new ToolbarWidgetGroupPattern<V>({
    ...this,
    id: this.id,
    element: this.element,
  });

  ngOnInit() {
    this._Toolbar?.register(this);
  }

  ngOnDestroy() {
    this._Toolbar?.unregister(this);
  }
}
