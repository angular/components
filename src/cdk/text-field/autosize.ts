/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NumberInput, coerceNumberProperty} from '@angular/cdk/coercion';
import {
  Directive,
  ElementRef,
  Input,
  AfterViewInit,
  DoCheck,
  OnDestroy,
  NgZone,
  booleanAttribute,
  inject,
  Renderer2,
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {Platform} from '@angular/cdk/platform';
import {_CdkPrivateStyleLoader} from '@angular/cdk/private';
import {auditTime} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {_CdkTextFieldStyleLoader} from './text-field-style-loader';

/** Directive to automatically resize a textarea to fit its content. */
@Directive({
  selector: 'textarea[cdkTextareaAutosize]',
  exportAs: 'cdkTextareaAutosize',
  host: {
    'class': 'cdk-textarea-autosize',
    // Textarea elements that have the directive applied should have a single row by default.
    // Browsers normally show two rows by default and therefore this limits the minRows binding.
    'rows': '1',
    '(input)': '_noopInputHandler()',
  },
})
export class CdkTextareaAutosize implements AfterViewInit, DoCheck, OnDestroy {
  private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _platform = inject(Platform);
  private _ngZone = inject(NgZone);
  private _renderer = inject(Renderer2);
  private _resizeEvents = new Subject<void>();

  /** Keep track of the previous textarea value to avoid resizing when the value hasn't changed. */
  private _previousValue?: string;
  private _initialHeight: string | undefined;
  private readonly _destroyed = new Subject<void>();
  private _listenerCleanups: (() => void)[] | undefined;

  private _minRows: number;
  private _maxRows: number;
  private _enabled: boolean = true;

  /**
   * Value of minRows as of last resize. If the minRows has decreased, the
   * height of the textarea needs to be recomputed to reflect the new minimum. The maxHeight
   * does not have the same problem because it does not affect the textarea's scrollHeight.
   */
  private _previousMinRows: number = -1;

  private _textareaElement: HTMLTextAreaElement;

  /** Minimum amount of rows in the textarea. */
  @Input('cdkAutosizeMinRows')
  get minRows(): number {
    return this._minRows;
  }
  set minRows(value: NumberInput) {
    this._minRows = coerceNumberProperty(value);
    this._setMinHeight();
  }

  /** Maximum amount of rows in the textarea. */
  @Input('cdkAutosizeMaxRows')
  get maxRows(): number {
    return this._maxRows;
  }
  set maxRows(value: NumberInput) {
    this._maxRows = coerceNumberProperty(value);
    this._setMaxHeight();
  }

  /** Whether autosizing is enabled or not */
  @Input({alias: 'cdkTextareaAutosize', transform: booleanAttribute})
  get enabled(): boolean {
    return this._enabled;
  }
  set enabled(value: boolean) {
    // Only act if the actual value changed. This specifically helps to not run
    // resizeToFitContent too early (i.e. before ngAfterViewInit)
    if (this._enabled !== value) {
      (this._enabled = value) ? this.resizeToFitContent(true) : this.reset();
    }
  }

  @Input()
  get placeholder(): string {
    return this._textareaElement.placeholder;
  }
  set placeholder(value: string) {
    this._cachedPlaceholderHeight = undefined;

    if (value) {
      this._textareaElement.setAttribute('placeholder', value);
    } else {
      this._textareaElement.removeAttribute('placeholder');
    }

    this._cacheTextareaPlaceholderHeight();
  }

  /** Cached height of a textarea with a single row. */
  private _cachedLineHeight?: number;
  /** Cached height of a textarea with only the placeholder. */
  private _cachedPlaceholderHeight?: number;

  /** Used to reference correct document/window */
  protected _document? = inject(DOCUMENT, {optional: true});

  private _hasFocus: boolean;

  private _isViewInited = false;

  constructor(...args: unknown[]);

  constructor() {
    const styleLoader = inject(_CdkPrivateStyleLoader);
    styleLoader.load(_CdkTextFieldStyleLoader);
    this._textareaElement = this._elementRef.nativeElement as HTMLTextAreaElement;
  }

  /** Sets the minimum height of the textarea as determined by minRows. */
  _setMinHeight(): void {
    const minHeight =
      this.minRows && this._cachedLineHeight ? `${this.minRows * this._cachedLineHeight}px` : null;

    if (minHeight) {
      this._textareaElement.style.minHeight = minHeight;
    }
  }

  /** Sets the maximum height of the textarea as determined by maxRows. */
  _setMaxHeight(): void {
    const maxHeight =
      this.maxRows && this._cachedLineHeight ? `${this.maxRows * this._cachedLineHeight}px` : null;

    if (maxHeight) {
      this._textareaElement.style.maxHeight = maxHeight;
    }
  }

  ngAfterViewInit() {
    if (this._platform.isBrowser) {
      // Remember the height which we started with in case autosizing is disabled
      this._initialHeight = this._textareaElement.style.height;
      this.resizeToFitContent();

      this._ngZone.runOutsideAngular(() => {
        this._listenerCleanups = [
          this._renderer.listen('window', 'resize', () => this._resizeEvents.next()),
          this._renderer.listen(this._textareaElement, 'focus', this._handleFocusEvent),
          this._renderer.listen(this._textareaElement, 'blur', this._handleFocusEvent),
        ];
        this._resizeEvents.pipe(auditTime(16)).subscribe(() => {
          // Clear the cached heights since the styles can change
          // when the window is resized (e.g. by media queries).
          this._cachedLineHeight = this._cachedPlaceholderHeight = undefined;
          this.resizeToFitContent(true);
        });
      });

      this._isViewInited = true;
      this.resizeToFitContent(true);
    }
  }

  ngOnDestroy() {
    this._listenerCleanups?.forEach(cleanup => cleanup());
    this._resizeEvents.complete();
    this._destroyed.next();
    this._destroyed.complete();
  }

  /**
   * Cache the height of a single-row textarea if it has not already been cached.
   *
   * We need to know how large a single "row" of a textarea is in order to apply minRows and
   * maxRows. For the initial version, we will assume that the height of a single line in the
   * textarea does not ever change.
   */
  private _cacheTextareaLineHeight(): void {
    if (this._cachedLineHeight) {
      return;
    }

    // Use a clone element because we have to override some styles.
    const textareaClone = this._textareaElement.cloneNode(false) as HTMLTextAreaElement;
    const cloneStyles = textareaClone.style;
    textareaClone.rows = 1;

    // Use `position: absolute` so that this doesn't cause a browser layout and use
    // `visibility: hidden` so that nothing is rendered. Clear any other styles that
    // would affect the height.
    cloneStyles.position = 'absolute';
    cloneStyles.visibility = 'hidden';
    cloneStyles.border = 'none';
    cloneStyles.padding = '0';
    cloneStyles.height = '';
    cloneStyles.minHeight = '';
    cloneStyles.maxHeight = '';

    // App styles might be messing with the height through the positioning properties.
    cloneStyles.top = cloneStyles.bottom = cloneStyles.left = cloneStyles.right = 'auto';

    // In Firefox it happens that textarea elements are always bigger than the specified amount
    // of rows. This is because Firefox tries to add extra space for the horizontal scrollbar.
    // As a workaround that removes the extra space for the scrollbar, we can just set overflow
    // to hidden. This ensures that there is no invalid calculation of the line height.
    // See Firefox bug report: https://bugzilla.mozilla.org/show_bug.cgi?id=33654
    cloneStyles.overflow = 'hidden';

    this._textareaElement.parentNode!.appendChild(textareaClone);
    this._cachedLineHeight = textareaClone.clientHeight;
    textareaClone.remove();

    // Min and max heights have to be re-calculated if the cached line height changes
    this._setMinHeight();
    this._setMaxHeight();
  }

  private _measureScrollHeight(): number {
    const element = this._textareaElement;
    const previousMargin = element.style.marginBottom || '';
    const isFirefox = this._platform.FIREFOX;
    const needsMarginFiller = isFirefox && this._hasFocus;
    const measuringClass = isFirefox
      ? 'cdk-textarea-autosize-measuring-firefox'
      : 'cdk-textarea-autosize-measuring';

    // In some cases the page might move around while we're measuring the `textarea` on Firefox. We
    // work around it by assigning a temporary margin with the same height as the `textarea` so that
    // it occupies the same amount of space. See #23233.
    if (needsMarginFiller) {
      element.style.marginBottom = `${element.clientHeight}px`;
    }

    // Reset the textarea height to auto in order to shrink back to its default size.
    // Also temporarily force overflow:hidden, so scroll bars do not interfere with calculations.
    element.classList.add(measuringClass);
    // The measuring class includes a 2px padding to workaround an issue with Chrome,
    // so we account for that extra space here by subtracting 4 (2px top + 2px bottom).
    const scrollHeight = element.scrollHeight - 4;
    element.classList.remove(measuringClass);

    if (needsMarginFiller) {
      element.style.marginBottom = previousMargin;
    }

    return scrollHeight;
  }

  private _cacheTextareaPlaceholderHeight(): void {
    if (!this._isViewInited || this._cachedPlaceholderHeight != undefined) {
      return;
    }
    if (!this.placeholder) {
      this._cachedPlaceholderHeight = 0;
      return;
    }

    const value = this._textareaElement.value;

    this._textareaElement.value = this._textareaElement.placeholder;
    this._cachedPlaceholderHeight = this._measureScrollHeight();
    this._textareaElement.value = value;
  }

  /** Handles `focus` and `blur` events. */
  private _handleFocusEvent = (event: FocusEvent) => {
    this._hasFocus = event.type === 'focus';
  };

  ngDoCheck() {
    if (this._platform.isBrowser) {
      this.resizeToFitContent();
    }
  }

  /**
   * Resize the textarea to fit its content.
   * @param force Whether to force a height recalculation. By default the height will be
   *    recalculated only if the value changed since the last call.
   */
  resizeToFitContent(force: boolean = false) {
    // If autosizing is disabled, just skip everything else
    if (!this._enabled) {
      return;
    }

    this._cacheTextareaLineHeight();
    this._cacheTextareaPlaceholderHeight();

    // If we haven't determined the line-height yet, we know we're still hidden and there's no point
    // in checking the height of the textarea.
    if (!this._cachedLineHeight) {
      return;
    }

    const textarea = this._elementRef.nativeElement as HTMLTextAreaElement;
    const value = textarea.value;

    // Only resize if the value or minRows have changed since these calculations can be expensive.
    if (!force && this._minRows === this._previousMinRows && value === this._previousValue) {
      return;
    }

    const scrollHeight = this._measureScrollHeight();
    const height = Math.max(scrollHeight, this._cachedPlaceholderHeight || 0);

    // Use the scrollHeight to know how large the textarea *would* be if fit its entire value.
    textarea.style.height = `${height}px`;

    this._ngZone.runOutsideAngular(() => {
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => this._scrollToCaretPosition(textarea));
      } else {
        setTimeout(() => this._scrollToCaretPosition(textarea));
      }
    });

    this._previousValue = value;
    this._previousMinRows = this._minRows;
  }

  /**
   * Resets the textarea to its original size
   */
  reset() {
    // Do not try to change the textarea, if the initialHeight has not been determined yet
    // This might potentially remove styles when reset() is called before ngAfterViewInit
    if (this._initialHeight !== undefined) {
      this._textareaElement.style.height = this._initialHeight;
    }
  }

  _noopInputHandler() {
    // no-op handler that ensures we're running change detection on input events.
  }

  /**
   * Scrolls a textarea to the caret position. On Firefox resizing the textarea will
   * prevent it from scrolling to the caret position. We need to re-set the selection
   * in order for it to scroll to the proper position.
   */
  private _scrollToCaretPosition(textarea: HTMLTextAreaElement) {
    const {selectionStart, selectionEnd} = textarea;

    // IE will throw an "Unspecified error" if we try to set the selection range after the
    // element has been removed from the DOM. Assert that the directive hasn't been destroyed
    // between the time we requested the animation frame and when it was executed.
    // Also note that we have to assert that the textarea is focused before we set the
    // selection range. Setting the selection range on a non-focused textarea will cause
    // it to receive focus on IE and Edge.
    if (!this._destroyed.isStopped && this._hasFocus) {
      textarea.setSelectionRange(selectionStart, selectionEnd);
      textarea.blur();
      textarea.focus();
    }
  }
}
