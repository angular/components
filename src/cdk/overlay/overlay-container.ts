/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {
  Injectable,
  OnDestroy,
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import {_CdkPrivateStyleLoader} from '@angular/cdk/private';
import {Platform, _isTestEnvironment} from '@angular/cdk/platform';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  styleUrl: 'overlay-structure.css',
  host: {'cdk-overlay-style-loader': ''},
})
export class _CdkOverlayStyleLoader {}

/** Container inside which all overlays will render. */
@Injectable({providedIn: 'root'})
export class OverlayContainer implements OnDestroy {
  protected _platform = inject(Platform);

  protected _containerElement: HTMLElement;
  protected _document = inject(DOCUMENT);
  protected _styleLoader = inject(_CdkPrivateStyleLoader);

  constructor(...args: unknown[]);
  constructor() {}

  ngOnDestroy() {
    this._containerElement?.remove();
  }

  /**
   * This method returns the overlay container element. It will lazily
   * create the element the first time it is called to facilitate using
   * the container in non-browser environments.
   * @returns the container element
   */
  getContainerElement(): HTMLElement {
    this._loadStyles();

    if (!this._containerElement) {
      this._createContainer();
    }

    return this._containerElement;
  }

  /**
   * Create the overlay container element, which is simply a div
   * with the 'cdk-overlay-container' class on the document body.
   */
  protected _createContainer(): void {
    const containerClass = 'cdk-overlay-container';

    // TODO(crisbeto): remove the testing check once we have an overlay testing
    // module or Angular starts tearing down the testing `NgModule`. See:
    // https://github.com/angular/angular/issues/18831
    if (this._platform.isBrowser || _isTestEnvironment()) {
      const oppositePlatformContainers = this._document.querySelectorAll(
        `.${containerClass}[platform="server"], ` + `.${containerClass}[platform="test"]`,
      );

      // Remove any old containers from the opposite platform.
      // This can happen when transitioning from the server to the client.
      for (let i = 0; i < oppositePlatformContainers.length; i++) {
        oppositePlatformContainers[i].remove();
      }
    }

    const container = this._document.createElement('div');
    container.classList.add(containerClass);

    // A long time ago we kept adding new overlay containers whenever a new app was instantiated,
    // but at some point we added logic which clears the duplicate ones in order to avoid leaks.
    // The new logic was a little too aggressive since it was breaking some legitimate use cases.
    // To mitigate the problem we made it so that only containers from a different platform are
    // cleared, but the side-effect was that people started depending on the overly-aggressive
    // logic to clean up their tests for them. Until we can introduce an overlay-specific testing
    // module which does the cleanup, we try to detect that we're in a test environment and we
    // always clear the container. See #17006.
    // TODO(crisbeto): remove the test environment check once we have an overlay testing module.
    if (_isTestEnvironment()) {
      container.setAttribute('platform', 'test');
    } else if (!this._platform.isBrowser) {
      container.setAttribute('platform', 'server');
    }

    this._document.body.appendChild(container);
    this._containerElement = container;
  }

  /** Loads the structural styles necessary for the overlay to work. */
  protected _loadStyles(): void {
    this._styleLoader.load(_CdkOverlayStyleLoader);
  }
}
