/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {OverlayRef} from '@angular/cdk/overlay';
import {ESCAPE, hasModifierKey} from '@angular/cdk/keycodes';
import {Observable, Subject, Subscription} from 'rxjs';
import {DialogConfig} from './dialog-config';
import {FocusOrigin} from '@angular/cdk/a11y';
import {BasePortalOutlet} from '@angular/cdk/portal';
import {ComponentRef} from '@angular/core';

/** Additional options that can be passed in when closing a dialog. */
export interface DialogCloseOptions {
  /** Focus original to use when restoring focus. */
  focusOrigin?: FocusOrigin;
}

/**
 * Reference to a dialog opened via the Dialog service.
 */
export class DialogRef<R = unknown, C = unknown> {
  /**
   * Instance of component opened into the dialog. Will be
   * null when the dialog is opened using a `TemplateRef`.
   */
  readonly componentInstance: C | null;

  /**
   * `ComponentRef` of the component opened into the dialog. Will be
   * null when the dialog is opened using a `TemplateRef`.
   */
  readonly componentRef: ComponentRef<C> | null;

  /** Instance of the container that is rendering out the dialog content. */
  readonly containerInstance: BasePortalOutlet & {_closeInteractionType?: FocusOrigin};

  /** Whether the user is allowed to close the dialog. */
  disableClose: boolean | undefined;

  /** Emits when the dialog has been closed. */
  readonly closed: Observable<R | undefined> = new Subject<R | undefined>();

  /** Emits when the backdrop of the dialog is clicked. */
  readonly backdropClick: Observable<MouseEvent>;

  /** Emits when on keyboard events within the dialog. */
  readonly keydownEvents: Observable<KeyboardEvent>;

  /** Emits on pointer events that happen outside of the dialog. */
  readonly outsidePointerEvents: Observable<MouseEvent>;

  /** Unique ID for the dialog. */
  readonly id: string;

  /** Subscription to external detachments of the dialog. */
  private _detachSubscription: Subscription;

  constructor(
    readonly overlayRef: OverlayRef,
    readonly config: DialogConfig<any, DialogRef<R, C>, BasePortalOutlet>,
  ) {
    this.disableClose = config.disableClose;
    this.backdropClick = overlayRef.backdropClick();
    this.keydownEvents = overlayRef.keydownEvents();
    this.outsidePointerEvents = overlayRef.outsidePointerEvents();
    this.id = config.id!; // By the time the dialog is created we are guaranteed to have an ID.

    this.keydownEvents.subscribe(event => {
      if (event.keyCode === ESCAPE && !this.disableClose && !hasModifierKey(event)) {
        event.preventDefault();
        this.close(undefined, {focusOrigin: 'keyboard'});
      }
    });

    this.backdropClick.subscribe(() => {
      if (!this.disableClose) {
        this.close(undefined, {focusOrigin: 'mouse'});
      }
    });

    this._detachSubscription = overlayRef.detachments().subscribe(() => {
      // Check specifically for `false`, because we want `undefined` to be treated like `true`.
      if (config.closeOnOverlayDetachments !== false) {
        this.close();
      }
    });
  }

  /**
   * Close the dialog.
   * @param result Optional result to return to the dialog opener.
   * @param options Additional options to customize the closing behavior.
   */
  close(result?: R, options?: DialogCloseOptions): void {
    if (this.containerInstance) {
      const closedSubject = this.closed as Subject<R | undefined>;
      this.containerInstance._closeInteractionType = options?.focusOrigin || 'program';
      // Drop the detach subscription first since it can be triggered by the
      // `dispose` call and override the result of this closing sequence.
      this._detachSubscription.unsubscribe();
      this.overlayRef.dispose();
      closedSubject.next(result);
      closedSubject.complete();
      (this as {componentInstance: C}).componentInstance = (
        this as {containerInstance: BasePortalOutlet}
      ).containerInstance = null!;
    }
  }

  /** Updates the position of the dialog based on the current position strategy. */
  updatePosition(): this {
    this.overlayRef.updatePosition();
    return this;
  }

  /**
   * Updates the dialog's width and height.
   * @param width New width of the dialog.
   * @param height New height of the dialog.
   */
  updateSize(width: string | number = '', height: string | number = ''): this {
    this.overlayRef.updateSize({width, height});
    return this;
  }

  /** Add a CSS class or an array of classes to the overlay pane. */
  addPanelClass(classes: string | string[]): this {
    this.overlayRef.addPanelClass(classes);
    return this;
  }

  /** Remove a CSS class or an array of classes from the overlay pane. */
  removePanelClass(classes: string | string[]): this {
    this.overlayRef.removePanelClass(classes);
    return this;
  }
}
