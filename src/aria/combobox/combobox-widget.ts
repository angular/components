/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterNextRender,
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';
import {COMBOBOX_POPUP} from './combobox-tokens';

/**
 * Identifies an element as a widget within a combobox popup.
 *
 * This directive should be applied to the element that contains the options or content
 * of the popup. It handles the communication of ID and active descendant information
 * to the combobox.
 */
@Directive({
  selector: '[ngComboboxWidget]',
  exportAs: 'ngComboboxWidget',
  host: {
    '(focusin)': 'onFocusin()',
    '(focusout)': 'onFocusout($event)',
  },
})
export class ComboboxWidget implements OnInit, OnDestroy {
  /** The element that the popup widget is attached to. */
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _popup = inject(COMBOBOX_POPUP);
  private readonly _idGenerator = inject(_IdGenerator);

  /** A reference to the popup widget element. */
  readonly element = this._elementRef.nativeElement;

  /** The ID of the popup widget. */
  readonly popupId = signal<string | undefined>(undefined);

  /** The ID of the active descendant in the widget. */
  readonly activeDescendant = input<string | undefined>(undefined);

  private _observer: MutationObserver | undefined;

  constructor() {
    const el = this.element;
    this._observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'id') {
          this.popupId.set(el.id);
        }
      }
    });

    this._observer.observe(el, {
      attributes: true,
      attributeFilter: ['id'],
    });

    afterNextRender(() => {
      if (!el.id) {
        el.id = this._idGenerator.getId('ng-combobox-widget-', true);
      }
      this.popupId.set(el.id);
    });
  }

  ngOnInit() {
    this.popupId.set(this.element.id);
    this._popup._registerWidget(this);
  }

  ngOnDestroy(): void {
    this._observer?.disconnect();
    this._popup._unregisterWidget();
  }

  /** Handles focus in events for the widget. */
  onFocusin() {
    this._popup._pattern.onFocusin();
  }

  /** Handles focus out events for the widget. */
  onFocusout(event: FocusEvent) {
    this._popup._pattern.onFocusout(event);
  }
}
