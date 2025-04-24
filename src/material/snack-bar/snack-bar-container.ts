/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {_IdGenerator, AriaLivePoliteness} from '@angular/cdk/a11y';
import {Platform} from '@angular/cdk/platform';
import {
  BasePortalOutlet,
  CdkPortalOutlet,
  ComponentPortal,
  DomPortal,
  TemplatePortal,
} from '@angular/cdk/portal';

import {
  afterNextRender,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  ElementRef,
  EmbeddedViewRef,
  inject,
  Injector,
  NgZone,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
  DOCUMENT,
} from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {_animationsDisabled} from '../core';
import {MatSnackBarConfig} from './snack-bar-config';

const ENTER_ANIMATION = '_mat-snack-bar-enter';
const EXIT_ANIMATION = '_mat-snack-bar-exit';

/**
 * Internal component that wraps user-provided snack bar content.
 * @docs-private
 */
@Component({
  selector: 'mat-snack-bar-container',
  templateUrl: 'snack-bar-container.html',
  styleUrl: 'snack-bar-container.css',
  // In Ivy embedded views will be change detected from their declaration place, rather than
  // where they were stamped out. This means that we can't have the snack bar container be OnPush,
  // because it might cause snack bars that were opened from a template not to be out of date.
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  imports: [CdkPortalOutlet],
  host: {
    'class': 'mdc-snackbar mat-mdc-snack-bar-container',
    '[class.mat-snack-bar-container-enter]': '_animationState === "visible"',
    '[class.mat-snack-bar-container-exit]': '_animationState === "hidden"',
    '[class.mat-snack-bar-container-animations-enabled]': '!_animationsDisabled',
    '(animationend)': 'onAnimationEnd($event.animationName)',
    '(animationcancel)': 'onAnimationEnd($event.animationName)',
  },
})
export class MatSnackBarContainer extends BasePortalOutlet implements OnDestroy {
  private _ngZone = inject(NgZone);
  readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _platform = inject(Platform);
  protected _animationsDisabled = _animationsDisabled();
  snackBarConfig = inject(MatSnackBarConfig);

  private _document = inject(DOCUMENT);
  private _trackedModals = new Set<Element>();
  private _enterFallback: ReturnType<typeof setTimeout> | undefined;
  private _exitFallback: ReturnType<typeof setTimeout> | undefined;
  private _injector = inject(Injector);

  /** The number of milliseconds to wait before announcing the snack bar's content. */
  private readonly _announceDelay: number = 150;

  /** The timeout for announcing the snack bar's content. */
  private _announceTimeoutId: ReturnType<typeof setTimeout>;

  /** Whether the component has been destroyed. */
  private _destroyed = false;

  /** The portal outlet inside of this container into which the snack bar content will be loaded. */
  @ViewChild(CdkPortalOutlet, {static: true}) _portalOutlet: CdkPortalOutlet;

  /** Subject for notifying that the snack bar has announced to screen readers. */
  readonly _onAnnounce: Subject<void> = new Subject();

  /** Subject for notifying that the snack bar has exited from view. */
  readonly _onExit: Subject<void> = new Subject();

  /** Subject for notifying that the snack bar has finished entering the view. */
  readonly _onEnter: Subject<void> = new Subject();

  /** The state of the snack bar animations. */
  _animationState = 'void';

  /** aria-live value for the live region. */
  _live: AriaLivePoliteness;

  /**
   * Element that will have the `mdc-snackbar__label` class applied if the attached component
   * or template does not have it. This ensures that the appropriate structure, typography, and
   * color is applied to the attached view.
   */
  @ViewChild('label', {static: true}) _label: ElementRef;

  /**
   * Role of the live region. This is only for Firefox as there is a known issue where Firefox +
   * JAWS does not read out aria-live message.
   */
  _role?: 'status' | 'alert';

  /** Unique ID of the aria-live element. */
  readonly _liveElementId = inject(_IdGenerator).getId('mat-snack-bar-container-live-');

  constructor(...args: unknown[]);

  constructor() {
    super();
    const config = this.snackBarConfig;

    // Use aria-live rather than a live role like 'alert' or 'status'
    // because NVDA and JAWS have show inconsistent behavior with live roles.
    if (config.politeness === 'assertive' && !config.announcementMessage) {
      this._live = 'assertive';
    } else if (config.politeness === 'off') {
      this._live = 'off';
    } else {
      this._live = 'polite';
    }

    // Only set role for Firefox. Set role based on aria-live because setting role="alert" implies
    // aria-live="assertive" which may cause issues if aria-live is set to "polite" above.
    if (this._platform.FIREFOX) {
      if (this._live === 'polite') {
        this._role = 'status';
      }
      if (this._live === 'assertive') {
        this._role = 'alert';
      }
    }
  }

  /** Attach a component portal as content to this snack bar container. */
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    this._assertNotAttached();
    const result = this._portalOutlet.attachComponentPortal(portal);
    this._afterPortalAttached();
    return result;
  }

  /** Attach a template portal as content to this snack bar container. */
  attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
    this._assertNotAttached();
    const result = this._portalOutlet.attachTemplatePortal(portal);
    this._afterPortalAttached();
    return result;
  }

  /**
   * Attaches a DOM portal to the snack bar container.
   * @deprecated To be turned into a method.
   * @breaking-change 10.0.0
   */
  override attachDomPortal = (portal: DomPortal) => {
    this._assertNotAttached();
    const result = this._portalOutlet.attachDomPortal(portal);
    this._afterPortalAttached();
    return result;
  };

  /** Handle end of animations, updating the state of the snackbar. */
  onAnimationEnd(animationName: string) {
    if (animationName === EXIT_ANIMATION) {
      this._completeExit();
    } else if (animationName === ENTER_ANIMATION) {
      clearTimeout(this._enterFallback);
      this._ngZone.run(() => {
        this._onEnter.next();
        this._onEnter.complete();
      });
    }
  }

  /** Begin animation of snack bar entrance into view. */
  enter(): void {
    if (!this._destroyed) {
      this._animationState = 'visible';
      // _animationState lives in host bindings and `detectChanges` does not refresh host bindings
      // so we have to call `markForCheck` to ensure the host view is refreshed eventually.
      this._changeDetectorRef.markForCheck();
      this._changeDetectorRef.detectChanges();
      this._screenReaderAnnounce();

      if (this._animationsDisabled) {
        afterNextRender(
          () => {
            this._ngZone.run(() => queueMicrotask(() => this.onAnimationEnd(ENTER_ANIMATION)));
          },
          {injector: this._injector},
        );
      } else {
        clearTimeout(this._enterFallback);
        this._enterFallback = setTimeout(() => {
          // The snack bar will stay invisible if it fails to animate. Add a fallback class so it
          // becomes visible. This can happen in some apps that do `* {animation: none !important}`.
          this._elementRef.nativeElement.classList.add('mat-snack-bar-fallback-visible');
          this.onAnimationEnd(ENTER_ANIMATION);
        }, 200);
      }
    }
  }

  /** Begin animation of the snack bar exiting from view. */
  exit(): Observable<void> {
    if (this._destroyed) {
      return of(undefined);
    }

    // It's common for snack bars to be opened by random outside calls like HTTP requests or
    // errors. Run inside the NgZone to ensure that it functions correctly.
    this._ngZone.run(() => {
      // Note: this one transitions to `hidden`, rather than `void`, in order to handle the case
      // where multiple snack bars are opened in quick succession (e.g. two consecutive calls to
      // `MatSnackBar.open`).
      this._animationState = 'hidden';
      this._changeDetectorRef.markForCheck();

      // Mark this element with an 'exit' attribute to indicate that the snackbar has
      // been dismissed and will soon be removed from the DOM. This is used by the snackbar
      // test harness.
      this._elementRef.nativeElement.setAttribute('mat-exit', '');

      // If the snack bar hasn't been announced by the time it exits it wouldn't have been open
      // long enough to visually read it either, so clear the timeout for announcing.
      clearTimeout(this._announceTimeoutId);

      if (this._animationsDisabled) {
        afterNextRender(
          () => {
            this._ngZone.run(() => queueMicrotask(() => this.onAnimationEnd(EXIT_ANIMATION)));
          },
          {injector: this._injector},
        );
      } else {
        clearTimeout(this._exitFallback);
        this._exitFallback = setTimeout(() => this.onAnimationEnd(EXIT_ANIMATION), 200);
      }
    });

    return this._onExit;
  }

  /** Makes sure the exit callbacks have been invoked when the element is destroyed. */
  ngOnDestroy() {
    this._destroyed = true;
    this._clearFromModals();
    this._completeExit();
  }

  private _completeExit() {
    clearTimeout(this._exitFallback);
    queueMicrotask(() => {
      this._onExit.next();
      this._onExit.complete();
    });
  }

  /**
   * Called after the portal contents have been attached. Can be
   * used to modify the DOM once it's guaranteed to be in place.
   */
  private _afterPortalAttached() {
    const element: HTMLElement = this._elementRef.nativeElement;
    const panelClasses = this.snackBarConfig.panelClass;

    if (panelClasses) {
      if (Array.isArray(panelClasses)) {
        // Note that we can't use a spread here, because IE doesn't support multiple arguments.
        panelClasses.forEach(cssClass => element.classList.add(cssClass));
      } else {
        element.classList.add(panelClasses);
      }
    }

    this._exposeToModals();

    // Check to see if the attached component or template uses the MDC template structure,
    // specifically the MDC label. If not, the container should apply the MDC label class to this
    // component's label container, which will apply MDC's label styles to the attached view.
    const label = this._label.nativeElement;
    const labelClass = 'mdc-snackbar__label';
    label.classList.toggle(labelClass, !label.querySelector(`.${labelClass}`));
  }

  /**
   * Some browsers won't expose the accessibility node of the live element if there is an
   * `aria-modal` and the live element is outside of it. This method works around the issue by
   * pointing the `aria-owns` of all modals to the live element.
   */
  private _exposeToModals() {
    // TODO(http://github.com/angular/components/issues/26853): consider de-duplicating this with the
    // `LiveAnnouncer` and any other usages.
    //
    // Note that the selector here is limited to CDK overlays at the moment in order to reduce the
    // section of the DOM we need to look through. This should cover all the cases we support, but
    // the selector can be expanded if it turns out to be too narrow.
    const id = this._liveElementId;
    const modals = this._document.querySelectorAll(
      'body > .cdk-overlay-container [aria-modal="true"]',
    );

    for (let i = 0; i < modals.length; i++) {
      const modal = modals[i];
      const ariaOwns = modal.getAttribute('aria-owns');
      this._trackedModals.add(modal);

      if (!ariaOwns) {
        modal.setAttribute('aria-owns', id);
      } else if (ariaOwns.indexOf(id) === -1) {
        modal.setAttribute('aria-owns', ariaOwns + ' ' + id);
      }
    }
  }

  /** Clears the references to the live element from any modals it was added to. */
  private _clearFromModals() {
    this._trackedModals.forEach(modal => {
      const ariaOwns = modal.getAttribute('aria-owns');

      if (ariaOwns) {
        const newValue = ariaOwns.replace(this._liveElementId, '').trim();

        if (newValue.length > 0) {
          modal.setAttribute('aria-owns', newValue);
        } else {
          modal.removeAttribute('aria-owns');
        }
      }
    });
    this._trackedModals.clear();
  }

  /** Asserts that no content is already attached to the container. */
  private _assertNotAttached() {
    if (this._portalOutlet.hasAttached() && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('Attempting to attach snack bar content after content is already attached');
    }
  }

  /**
   * Starts a timeout to move the snack bar content to the live region so screen readers will
   * announce it.
   */
  private _screenReaderAnnounce() {
    if (this._announceTimeoutId) {
      return;
    }

    this._ngZone.runOutsideAngular(() => {
      this._announceTimeoutId = setTimeout(() => {
        if (this._destroyed) {
          return;
        }

        const element = this._elementRef.nativeElement;
        const inertElement = element.querySelector('[aria-hidden]');
        const liveElement = element.querySelector('[aria-live]');

        if (inertElement && liveElement) {
          // If an element in the snack bar content is focused before being moved
          // track it and restore focus after moving to the live region.
          let focusedElement: HTMLElement | null = null;
          if (
            this._platform.isBrowser &&
            document.activeElement instanceof HTMLElement &&
            inertElement.contains(document.activeElement)
          ) {
            focusedElement = document.activeElement;
          }

          inertElement.removeAttribute('aria-hidden');
          liveElement.appendChild(inertElement);
          focusedElement?.focus();

          this._onAnnounce.next();
          this._onAnnounce.complete();
        }
      }, this._announceDelay);
    });
  }
}
