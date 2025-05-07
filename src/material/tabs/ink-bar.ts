/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Directive,
  ElementRef,
  InjectionToken,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  booleanAttribute,
  inject,
} from '@angular/core';

/**
 * Item inside a tab header relative to which the ink bar can be aligned.
 * @nodoc
 */
export interface MatInkBarItem extends OnInit, OnDestroy {
  elementRef: ElementRef<HTMLElement>;
  activateInkBar(previousIndicatorClientRect?: DOMRect): void;
  deactivateInkBar(): void;
  fitInkBarToContent: boolean;
}

/** Class that is applied when a tab indicator is active. */
const ACTIVE_CLASS = 'mdc-tab-indicator--active';

/** Class that is applied when the tab indicator should not transition. */
const NO_TRANSITION_CLASS = 'mdc-tab-indicator--no-transition';

/**
 * Abstraction around the MDC tab indicator that acts as the tab header's ink bar.
 * @nodoc
 */
export class MatInkBar {
  /** Item to which the ink bar is aligned currently. */
  private _currentItem: MatInkBarItem | undefined;

  constructor(private _items: QueryList<MatInkBarItem>) {}

  /** Hides the ink bar. */
  hide() {
    this._items.forEach(item => item.deactivateInkBar());
    this._currentItem = undefined;
  }

  /** Aligns the ink bar to a DOM node. */
  alignToElement(element: HTMLElement) {
    const correspondingItem = this._items.find(item => item.elementRef.nativeElement === element);
    const currentItem = this._currentItem;

    if (correspondingItem === currentItem) {
      return;
    }

    currentItem?.deactivateInkBar();

    if (correspondingItem) {
      const domRect = currentItem?.elementRef.nativeElement.getBoundingClientRect?.();

      // The ink bar won't animate unless we give it the `DOMRect` of the previous item.
      correspondingItem.activateInkBar(domRect);
      this._currentItem = correspondingItem;
    }
  }
}

@Directive()
export abstract class InkBarItem implements OnInit, OnDestroy {
  private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _inkBarElement: HTMLElement | null;
  private _inkBarContentElement: HTMLElement | null;
  private _fitToContent = false;

  /** Whether the ink bar should fit to the entire tab or just its content. */
  @Input({transform: booleanAttribute})
  get fitInkBarToContent(): boolean {
    return this._fitToContent;
  }
  set fitInkBarToContent(newValue: boolean) {
    if (this._fitToContent !== newValue) {
      this._fitToContent = newValue;

      if (this._inkBarElement) {
        this._appendInkBarElement();
      }
    }
  }

  /** Aligns the ink bar to the current item. */
  activateInkBar(previousIndicatorClientRect?: DOMRect) {
    const element = this._elementRef.nativeElement;

    // Early exit if no indicator is present to handle cases where an indicator
    // may be activated without a prior indicator state
    if (
      !previousIndicatorClientRect ||
      !element.getBoundingClientRect ||
      !this._inkBarContentElement
    ) {
      element.classList.add(ACTIVE_CLASS);
      return;
    }

    // This animation uses the FLIP approach. You can read more about it at the link below:
    // https://aerotwist.com/blog/flip-your-animations/

    // Calculate the dimensions based on the dimensions of the previous indicator
    const currentClientRect = element.getBoundingClientRect();
    const widthDelta = previousIndicatorClientRect.width / currentClientRect.width;
    const xPosition = previousIndicatorClientRect.left - currentClientRect.left;
    element.classList.add(NO_TRANSITION_CLASS);
    this._inkBarContentElement.style.setProperty(
      'transform',
      `translateX(${xPosition}px) scaleX(${widthDelta})`,
    );

    // Force repaint before updating classes and transform to ensure the transform properly takes effect
    element.getBoundingClientRect();

    element.classList.remove(NO_TRANSITION_CLASS);
    element.classList.add(ACTIVE_CLASS);
    this._inkBarContentElement.style.setProperty('transform', '');
  }

  /** Removes the ink bar from the current item. */
  deactivateInkBar() {
    this._elementRef.nativeElement.classList.remove(ACTIVE_CLASS);
  }

  /** Initializes the foundation. */
  ngOnInit() {
    this._createInkBarElement();
  }

  /** Destroys the foundation. */
  ngOnDestroy() {
    this._inkBarElement?.remove();
    this._inkBarElement = this._inkBarContentElement = null!;
  }

  /** Creates and appends the ink bar element. */
  private _createInkBarElement() {
    const documentNode = this._elementRef.nativeElement.ownerDocument || document;
    const inkBarElement = (this._inkBarElement = documentNode.createElement('span'));
    const inkBarContentElement = (this._inkBarContentElement = documentNode.createElement('span'));

    inkBarElement.className = 'mdc-tab-indicator';
    inkBarContentElement.className =
      'mdc-tab-indicator__content mdc-tab-indicator__content--underline';

    inkBarElement.appendChild(this._inkBarContentElement);
    this._appendInkBarElement();
  }

  /**
   * Appends the ink bar to the tab host element or content, depending on whether
   * the ink bar should fit to content.
   */
  private _appendInkBarElement() {
    if (!this._inkBarElement && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('Ink bar element has not been created and cannot be appended');
    }

    const parentElement = this._fitToContent
      ? this._elementRef.nativeElement.querySelector('.mdc-tab__content')
      : this._elementRef.nativeElement;

    if (!parentElement && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('Missing element to host the ink bar');
    }

    parentElement!.appendChild(this._inkBarElement!);
  }
}

/**
 * Interface for a MatInkBar positioner method, defining the positioning and width of the ink
 * bar in a set of tabs.
 */
export interface _MatInkBarPositioner {
  (element: HTMLElement): {left: string; width: string};
}

/**
 * The default positioner function for the MatInkBar.
 * @nodoc
 * @deprecated No longer used, will be removed.
 * @breaking-change 21.0.0
 */
export function _MAT_INK_BAR_POSITIONER_FACTORY(): _MatInkBarPositioner {
  const method = (element: HTMLElement) => ({
    left: element ? (element.offsetLeft || 0) + 'px' : '0',
    width: element ? (element.offsetWidth || 0) + 'px' : '0',
  });

  return method;
}

/** Injection token for the MatInkBar's Positioner. */
export const _MAT_INK_BAR_POSITIONER = new InjectionToken<_MatInkBarPositioner>(
  'MatInkBarPositioner',
  {
    providedIn: 'root',
    factory: _MAT_INK_BAR_POSITIONER_FACTORY,
  },
);
