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
import {ToolbarPattern, RadioButtonPattern, ToolbarWidgetPattern} from '../ui-patterns';
import {Directionality} from '@angular/cdk/bidi';
import {_IdGenerator} from '@angular/cdk/a11y';

/** Interface for a radio button that can be used with a toolbar. Based on radio-button in ui-patterns */
interface CdkRadioButtonInterface<V> {
  /** The HTML element associated with the radio button. */
  element: Signal<HTMLElement>;
  /** Whether the radio button is disabled. */
  disabled: Signal<boolean>;

  pattern: RadioButtonPattern<V>;
}

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
 * place of reference for focus and navigation. The CdkToolbar is meant to be used in conjunction
 * with CdkToolbarWidget and CdkRadioGroup as follows:
 *
 * ```html
 * <div cdkToolbar>
 *  <button cdkToolbarWidget>Button</button>
 *  <div cdkRadioGroup>
 *    <label cdkRadioButton value="1">Option 1</label>
 *    <label cdkRadioButton value="2">Option 2</label>
 *    <label cdkRadioButton value="3">Option 3</label>
 *  </div>
 * </div>
 * ```
 */
@Directive({
  selector: '[cdkToolbar]',
  exportAs: 'cdkToolbar',
  host: {
    'role': 'toolbar',
    'class': 'cdk-toolbar',
    '[attr.tabindex]': 'pattern.tabindex()',
    '[attr.aria-disabled]': 'pattern.disabled()',
    '[attr.aria-orientation]': 'pattern.orientation()',
    '[attr.aria-activedescendant]': 'pattern.activedescendant()',
    '(keydown)': 'pattern.onKeydown($event)',
    '(pointerdown)': 'pattern.onPointerdown($event)',
    '(focusin)': 'onFocus()',
  },
})
export class CdkToolbar<V> {
  /** The CdkTabList nested inside of the container. */
  private readonly _cdkWidgets = signal(new Set<CdkRadioButtonInterface<V> | CdkToolbarWidget>());

  /** A signal wrapper for directionality. */
  textDirection = inject(Directionality).valueSignal;

  /** Sorted UIPatterns of the child widgets */
  items = computed(() =>
    [...this._cdkWidgets()].sort(sortDirectives).map(widget => widget.pattern),
  );

  /** Whether the toolbar is vertically or horizontally oriented. */
  orientation = input<'vertical' | 'horizontal'>('horizontal');

  /** Whether disabled items in the group should be skipped when navigating. */
  skipDisabled = input(false, {transform: booleanAttribute});

  /** Whether the toolbar is disabled. */
  disabled = input(false, {transform: booleanAttribute});

  /** Whether focus should wrap when navigating. */
  readonly wrap = input(true, {transform: booleanAttribute});

  /** The toolbar UIPattern. */
  pattern: ToolbarPattern<V> = new ToolbarPattern<V>({
    ...this,
    activeItem: signal(undefined),
    textDirection: this.textDirection,
    focusMode: signal('roving'),
  });

  /** Whether the toolbar has received focus yet. */
  private _hasFocused = signal(false);

  onFocus() {
    this._hasFocused.set(true);
  }

  constructor() {
    afterRenderEffect(() => {
      if (!this._hasFocused()) {
        this.pattern.setDefaultState();
      }
    });

    afterRenderEffect(() => {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        const violations = this.pattern.validate();
        for (const violation of violations) {
          console.error(violation);
        }
      }
    });
  }

  register(widget: CdkRadioButtonInterface<V> | CdkToolbarWidget) {
    const widgets = this._cdkWidgets();
    if (!widgets.has(widget)) {
      widgets.add(widget);
      this._cdkWidgets.set(new Set(widgets));
    }
  }

  unregister(widget: CdkRadioButtonInterface<V> | CdkToolbarWidget) {
    const widgets = this._cdkWidgets();
    if (widgets.delete(widget)) {
      this._cdkWidgets.set(new Set(widgets));
    }
  }
}

/**
 * A widget within a toolbar.
 *
 * A widget is anything that is within a toolbar. It should be applied to any native HTML element
 * that has the purpose of acting as a widget navigatable within a toolbar.
 */
@Directive({
  selector: '[cdkToolbarWidget]',
  exportAs: 'cdkToolbarWidget',
  host: {
    'role': 'button',
    'class': 'cdk-toolbar-widget',
    '[class.cdk-active]': 'pattern.active()',
    '[attr.tabindex]': 'pattern.tabindex()',
    '[attr.inert]': 'hardDisabled() ? true : null',
    '[attr.disabled]': 'hardDisabled() ? true : null',
    '[attr.aria-disabled]': 'pattern.disabled()',
    '[id]': 'pattern.id()',
  },
})
export class CdkToolbarWidget implements OnInit, OnDestroy {
  /** A reference to the widget element. */
  private readonly _elementRef = inject(ElementRef);

  /** The parent CdkToolbar. */
  private readonly _cdkToolbar = inject(CdkToolbar);

  /** A unique identifier for the widget. */
  private readonly _generatedId = inject(_IdGenerator).getId('cdk-toolbar-widget-');

  /** A unique identifier for the widget. */
  protected id = computed(() => this._generatedId);

  /** The parent Toolbar UIPattern. */
  protected parentToolbar = computed(() => this._cdkToolbar.pattern);

  /** A reference to the widget element to be focused on navigation. */
  element = computed(() => this._elementRef.nativeElement);

  /** Whether the widget is disabled. */
  disabled = input(false, {transform: booleanAttribute});

  readonly hardDisabled = computed(
    () => this.pattern.disabled() && this._cdkToolbar.skipDisabled(),
  );

  pattern = new ToolbarWidgetPattern({
    ...this,
    id: this.id,
    element: this.element,
    disabled: computed(() => this._cdkToolbar.disabled() || this.disabled()),
    parentToolbar: this.parentToolbar,
  });

  ngOnInit() {
    this._cdkToolbar.register(this);
  }

  ngOnDestroy() {
    this._cdkToolbar.unregister(this);
  }
}
