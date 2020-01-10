/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OverlayRef} from '@angular/cdk/overlay';
import {Observable, Subject} from 'rxjs';
import {filter} from 'rxjs/operators';

import {FeatureHighlightConfig} from './feature-highlight-config';
import {FeatureHighlightContainer} from './feature-highlight-container';

/** Reference to a feature highlight component opened via the service. */
export class FeatureHighlightRef<C = unknown> implements
    FeatureHighlightRefBase {
  /**
   * The instance of the component making up the content of the feature
   * highlight.
   */
  calloutInstance!: C;

  private readonly afterAcceptedSubject = new Subject<void>();
  private readonly afterDismissedSubject = new Subject<void>();

  constructor(
      readonly containerInstance: FeatureHighlightContainer,
      private readonly _overlayRef: OverlayRef|undefined,
  ) {
    this.containerInstance.afterAccepted.subscribe(() => {
      this.afterAcceptedSubject.next();
      this.afterAcceptedSubject.complete();
      if (_overlayRef) {
        _overlayRef.dispose();
      }
    });

    this.containerInstance.afterDismissed.subscribe(() => {
      this.afterDismissedSubject.next();
      this.afterDismissedSubject.complete();
      if (_overlayRef) {
        _overlayRef.dispose();
      }
    });

    if (_overlayRef) {
      _overlayRef.detachments().subscribe(() => {
        this.afterAcceptedSubject.complete();
        this.afterDismissedSubject.next();
        this.afterDismissedSubject.complete();
        this.calloutInstance = null!;
        _overlayRef.dispose();
      });

      // Support hitting escape button to dismiss feature highlight when outer
      // circle is unbounded. In the case of bounded outer circle, users of
      // feature highlight should add a close button in the callout template
      // or component, and have the button auto focused after feature highlight
      // is opened to achieve better a11y.
      _overlayRef.keydownEvents()
          .pipe(filter(event => event.key === 'Escape'))
          .subscribe(() => {
            this.dismiss();
          });
    }
  }

  /**
   * Close feature highlight by accepting it, i.e. clicking on the inner circle.
   */
  accept() {
    this.containerInstance.accept();
  }

  /** Dismiss feature highlight. */
  dismiss() {
    this.containerInstance.dismiss();
  }

  /**
   * Return an observable that emits when feature highlight has finished
   * the opening animation.
   */
  afterOpened:
      () => Observable<void> = () => this.containerInstance.afterOpened;

  /**
   * Return an observable that emits when feature highlight has finished
   * the accepting animation.
   */
  afterAccepted: () => Observable<void> = () => this.afterAcceptedSubject;

  /**
   * Return an observable that emits when feature highlight has finished
   * the dismissing animation.
   */
  afterDismissed: () => Observable<void> = () => this.afterDismissedSubject;

  /**
   * Update layout of feature highlight, e.g. position of the elements, while
   * it's still activated.
   */
  updateLayout(newConfig: Partial<FeatureHighlightConfig>) {
    this.containerInstance.updateConfig(newConfig);
    this.containerInstance.layout();
    if (this._overlayRef) {
      this._overlayRef.updatePosition();
    }
  }
}

/** Base interface for referencing to feature highlight. */
export interface FeatureHighlightRefBase {
  /** Close feature highlight by accepting it. */
  accept(): void;

  /** Dismiss feature highlight. */
  dismiss(): void;

  /** Triggered after feature highlight is opened. */
  afterOpened(): void;

  /** Triggered after feature highlight is closed by accepting it. */
  afterAccepted(): void;

  /** Triggered after feature highlight is dismissed. */
  afterDismissed(): void;
}
