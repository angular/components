/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {_IdGenerator} from '@angular/cdk/a11y';
import {
  afterRenderEffect,
  booleanAttribute,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  output,
  Signal,
} from '@angular/core';
import {GridCellWidgetPattern} from '../private';
import {GRID_CELL} from './grid-tokens';

/**
 * Represents an interactive element inside a `GridCell`. It allows for pausing grid navigation to
 * interact with the widget.
 *
 * When the user interacts with the widget (e.g., by typing in an input or opening a menu), grid
 * navigation is temporarily suspended to allow the widget to handle keyboard
 * events.
 *
 * ```html
 * <td ngGridCell>
 *   <button ngGridCellWidget>Click Me</button>
 * </td>
 * ```
 *
 * @developerPreview 21.0
 *
 * @see [Grid](guide/aria/grid)
 */
@Directive({
  selector: '[ngGridCellWidget]',
  exportAs: 'ngGridCellWidget',
  host: {
    '[attr.data-active]': 'active()',
    '[attr.data-active-control]': 'isActivated() ? "widget" : "cell"',
    '[tabindex]': '_tabIndex()',
  },
})
export class GridCellWidget {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** Whether the widget is currently active (focused). */
  readonly active = computed(() => this._pattern.active());

  /** The parent cell. */
  private readonly _cell = inject(GRID_CELL);

  /** A unique identifier for the widget. */
  readonly id = input(inject(_IdGenerator).getId('ng-grid-cell-widget-', true));

  /** The type of widget, which determines how it is activated. */
  readonly widgetType = input<'simple' | 'complex' | 'editable'>('simple');

  /** Whether the widget is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** The target that will receive focus instead of the widget. */
  readonly focusTarget = input<ElementRef | HTMLElement | undefined>();

  /** Emits when the widget is activated. */
  readonly onActivate = output<KeyboardEvent | FocusEvent | undefined>();

  /** Emits when the widget is deactivated. */
  readonly onDeactivate = output<KeyboardEvent | FocusEvent | undefined>();

  /** The tabindex override. */
  readonly tabindex = input<number | undefined>();

  /**
   * The tabindex value set to the element.
   * If a focus target exists then return -1. Unless an override.
   */
  protected readonly _tabIndex: Signal<number> = computed(
    () => this.tabindex() ?? (this.focusTarget() ? -1 : this._pattern.tabIndex()),
  );

  /** The UI pattern for the grid cell widget. */
  readonly _pattern = new GridCellWidgetPattern({
    ...this,
    element: () => this.element,
    cell: () => this._cell._pattern,
    focusTarget: computed(() => {
      if (this.focusTarget() instanceof ElementRef) {
        return (this.focusTarget() as ElementRef).nativeElement;
      }
      return this.focusTarget();
    }),
  });

  /** Whether the widget is activated. */
  get isActivated(): Signal<boolean> {
    return computed(() => this._pattern.isActivated());
  }

  constructor() {
    afterRenderEffect(() => {
      const activateEvent = this._pattern.lastActivateEvent();
      if (activateEvent) {
        this.onActivate.emit(activateEvent);
      }
    });

    afterRenderEffect(() => {
      const deactivateEvent = this._pattern.lastDeactivateEvent();
      if (deactivateEvent) {
        this.onDeactivate.emit(deactivateEvent);
      }
    });
  }

  /** Activates the widget. */
  activate(): void {
    this._pattern.activate();
  }

  /** Deactivates the widget. */
  deactivate(): void {
    this._pattern.deactivate();
  }
}
