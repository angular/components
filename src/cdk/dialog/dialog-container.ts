/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  FocusMonitor,
  FocusOrigin,
  FocusTrap,
  FocusTrapFactory,
  InteractivityChecker,
} from '../a11y';
import {Platform, _getFocusedElementPierceShadowDom} from '../platform';
import {
  BasePortalOutlet,
  CdkPortalOutlet,
  ComponentPortal,
  DomPortal,
  TemplatePortal,
} from '../portal';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  DOCUMENT,
  ElementRef,
  EmbeddedViewRef,
  Injector,
  NgZone,
  OnDestroy,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
  afterNextRender,
  inject,
} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {DialogConfig, DialogContainer} from './dialog-config';

export function throwDialogContentAlreadyAttachedError() {
  throw Error('Attempting to attach dialog content after content is already attached');
}

/**
 * Internal component that wraps user-provided dialog content.
 * @nodoc
 */
@Component({
  selector: 'cdk-dialog-container',
  templateUrl: './dialog-container.html',
  styleUrl: 'dialog-container.css',
  encapsulation: ViewEncapsulation.None,
  // Using OnPush for dialogs caused some G3 sync issues. Disabled until we can track them down.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [CdkPortalOutlet],
  host: {
    'class': 'cdk-dialog-container',
    'tabindex': '-1',
    '[attr.id]': '_config.id || null',
    '[attr.role]': '_config.role',
    '[attr.aria-modal]': '_config.ariaModal',
    '[attr.aria-labelledby]': '_config.ariaLabel ? null : _ariaLabelledByQueue[0]',
    '[attr.aria-label]': '_config.ariaLabel',
    '[attr.aria-describedby]': '_config.ariaDescribedBy || null',
  },
})
export class CdkDialogContainer<C extends DialogConfig = DialogConfig>
  extends BasePortalOutlet
  implements DialogContainer, OnDestroy
{
  protected _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected _focusTrapFactory = inject(FocusTrapFactory);
  readonly _config: C;
  private _interactivityChecker = inject(InteractivityChecker);
  protected _ngZone = inject(NgZone);
  private _focusMonitor = inject(FocusMonitor);
  private _renderer = inject(Renderer2);
  protected readonly _changeDetectorRef = inject(ChangeDetectorRef);
  private _injector = inject(Injector);
  private _platform = inject(Platform);
  protected _document = inject(DOCUMENT, {optional: true})!;

  /** The portal outlet inside of this container into which the dialog content will be loaded. */
  @ViewChild(CdkPortalOutlet, {static: true}) _portalOutlet: CdkPortalOutlet;

  _focusTrapped: Observable<void> = new Subject<void>();

  /** The class that traps and manages focus within the dialog. */
  private _focusTrap: FocusTrap | null = null;

  /** Element that was focused before the dialog was opened. Save this to restore upon close. */
  private _elementFocusedBeforeDialogWasOpened: HTMLElement | null = null;

  /**
   * Type of interaction that led to the dialog being closed. This is used to determine
   * whether the focus style will be applied when returning focus to its original location
   * after the dialog is closed.
   */
  _closeInteractionType: FocusOrigin | null = null;

  /**
   * Queue of the IDs of the dialog's label element, based on their definition order. The first
   * ID will be used as the `aria-labelledby` value. We use a queue here to handle the case
   * where there are two or more titles in the DOM at a time and the first one is destroyed while
   * the rest are present.
   */
  _ariaLabelledByQueue: string[] = [];

  private _isDestroyed = false;

  constructor(...args: unknown[]);

  constructor() {
    super();

    // Callback is primarily for some internal tests
    // that were instantiating the dialog container manually.
    this._config = (inject(DialogConfig, {optional: true}) || new DialogConfig()) as C;

    if (this._config.ariaLabelledBy) {
      this._ariaLabelledByQueue.push(this._config.ariaLabelledBy);
    }
  }

  _addAriaLabelledBy(id: string) {
    this._ariaLabelledByQueue.push(id);
    this._changeDetectorRef.markForCheck();
  }

  _removeAriaLabelledBy(id: string) {
    const index = this._ariaLabelledByQueue.indexOf(id);

    if (index > -1) {
      this._ariaLabelledByQueue.splice(index, 1);
      this._changeDetectorRef.markForCheck();
    }
  }

  protected _contentAttached() {
    this._initializeFocusTrap();
    this._captureInitialFocus();
  }

  /**
   * Can be used by child classes to customize the initial focus
   * capturing behavior (e.g. if it's tied to an animation).
   */
  protected _captureInitialFocus() {
    this._trapFocus();
  }

  ngOnDestroy() {
    (this._focusTrapped as Subject<void>).complete();
    this._isDestroyed = true;
    this._restoreFocus();
  }

  /**
   * Attach a ComponentPortal as content to this dialog container.
   * @param portal Portal to be attached as the dialog content.
   */
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    if (this._portalOutlet.hasAttached() && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throwDialogContentAlreadyAttachedError();
    }

    const result = this._portalOutlet.attachComponentPortal(portal);
    this._contentAttached();
    return result;
  }

  /**
   * Attach a TemplatePortal as content to this dialog container.
   * @param portal Portal to be attached as the dialog content.
   */
  attachTemplatePortal<T>(portal: TemplatePortal<T>): EmbeddedViewRef<T> {
    if (this._portalOutlet.hasAttached() && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throwDialogContentAlreadyAttachedError();
    }

    const result = this._portalOutlet.attachTemplatePortal(portal);
    this._contentAttached();
    return result;
  }

  /**
   * Attaches a DOM portal to the dialog container.
   * @param portal Portal to be attached.
   * @deprecated To be turned into a method.
   * @breaking-change 10.0.0
   */
  override attachDomPortal = (portal: DomPortal) => {
    if (this._portalOutlet.hasAttached() && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throwDialogContentAlreadyAttachedError();
    }

    const result = this._portalOutlet.attachDomPortal(portal);
    this._contentAttached();
    return result;
  };

  // TODO(crisbeto): this shouldn't be exposed, but there are internal references to it.
  /** Captures focus if it isn't already inside the dialog. */
  _recaptureFocus() {
    if (!this._containsFocus()) {
      this._trapFocus();
    }
  }

  /**
   * Focuses the provided element. If the element is not focusable, it will add a tabIndex
   * attribute to forcefully focus it. The attribute is removed after focus is moved.
   * @param element The element to focus.
   */
  private _forceFocus(element: HTMLElement, options?: FocusOptions) {
    if (!this._interactivityChecker.isFocusable(element)) {
      element.tabIndex = -1;
      // The tabindex attribute should be removed to avoid navigating to that element again
      this._ngZone.runOutsideAngular(() => {
        const callback = () => {
          deregisterBlur();
          deregisterMousedown();
          element.removeAttribute('tabindex');
        };

        const deregisterBlur = this._renderer.listen(element, 'blur', callback);
        const deregisterMousedown = this._renderer.listen(element, 'mousedown', callback);
      });
    }
    element.focus(options);
  }

  /**
   * Focuses the first element that matches the given selector within the focus trap.
   * @param selector The CSS selector for the element to set focus to.
   */
  private _focusByCssSelector(selector: string, options?: FocusOptions) {
    let elementToFocus = this._elementRef.nativeElement.querySelector(
      selector,
    ) as HTMLElement | null;
    if (elementToFocus) {
      this._forceFocus(elementToFocus, options);
    }
  }

  /**
   * Moves the focus inside the focus trap. When autoFocus is not set to 'dialog', if focus
   * cannot be moved then focus will go to the dialog container.
   */
  protected _trapFocus(options?: FocusOptions) {
    if (this._isDestroyed) {
      return;
    }

    // If were to attempt to focus immediately, then the content of the dialog would not yet be
    // ready in instances where change detection has to run first. To deal with this, we simply
    // wait until after the next render.
    afterNextRender(
      () => {
        const element = this._elementRef.nativeElement;
        switch (this._config.autoFocus) {
          case false:
          case 'dialog':
            // Ensure that focus is on the dialog container. It's possible that a different
            // component tried to move focus while the open animation was running. See:
            // https://github.com/angular/components/issues/16215. Note that we only want to do this
            // if the focus isn't inside the dialog already, because it's possible that the consumer
            // turned off `autoFocus` in order to move focus themselves.
            if (!this._containsFocus()) {
              element.focus(options);
            }
            break;
          case true:
          case 'first-tabbable':
            const focusedSuccessfully = this._focusTrap?.focusInitialElement(options);
            // If we weren't able to find a focusable element in the dialog, then focus the dialog
            // container instead.
            if (!focusedSuccessfully) {
              this._focusDialogContainer(options);
            }
            break;
          case 'first-heading':
            this._focusByCssSelector('h1, h2, h3, h4, h5, h6, [role="heading"]', options);
            break;
          default:
            this._focusByCssSelector(this._config.autoFocus!, options);
            break;
        }
        (this._focusTrapped as Subject<void>).next();
      },
      {injector: this._injector},
    );
  }

  /** Restores focus to the element that was focused before the dialog opened. */
  private _restoreFocus() {
    const focusConfig = this._config.restoreFocus;
    let focusTargetElement: HTMLElement | null = null;

    if (typeof focusConfig === 'string') {
      focusTargetElement = this._document.querySelector(focusConfig);
    } else if (typeof focusConfig === 'boolean') {
      focusTargetElement = focusConfig ? this._elementFocusedBeforeDialogWasOpened : null;
    } else if (focusConfig) {
      focusTargetElement = focusConfig;
    }

    // We need the extra check, because IE can set the `activeElement` to null in some cases.
    if (
      this._config.restoreFocus &&
      focusTargetElement &&
      typeof focusTargetElement.focus === 'function'
    ) {
      const activeElement = _getFocusedElementPierceShadowDom();
      const element = this._elementRef.nativeElement;

      // Make sure that focus is still inside the dialog or is on the body (usually because a
      // non-focusable element like the backdrop was clicked) before moving it. It's possible that
      // the consumer moved it themselves before the animation was done, in which case we shouldn't
      // do anything.
      if (
        !activeElement ||
        activeElement === this._document.body ||
        activeElement === element ||
        element.contains(activeElement)
      ) {
        if (this._focusMonitor) {
          this._focusMonitor.focusVia(focusTargetElement, this._closeInteractionType);
          this._closeInteractionType = null;
        } else {
          focusTargetElement.focus();
        }
      }
    }

    if (this._focusTrap) {
      this._focusTrap.destroy();
    }
  }

  /** Focuses the dialog container. */
  private _focusDialogContainer(options?: FocusOptions) {
    // Note that there is no focus method when rendering on the server.
    this._elementRef.nativeElement.focus?.(options);
  }

  /** Returns whether focus is inside the dialog. */
  private _containsFocus() {
    const element = this._elementRef.nativeElement;
    const activeElement = _getFocusedElementPierceShadowDom();
    return element === activeElement || element.contains(activeElement);
  }

  /** Sets up the focus trap. */
  private _initializeFocusTrap() {
    if (this._platform.isBrowser) {
      this._focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement);

      // Save the previously focused element. This element will be re-focused
      // when the dialog closes.
      if (this._document) {
        this._elementFocusedBeforeDialogWasOpened = _getFocusedElementPierceShadowDom();
      }
    }
  }
}
