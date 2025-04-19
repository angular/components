/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directionality} from '../bidi';
import {DomPortalOutlet} from '../portal';
import {Location} from '@angular/common';
import {
  ApplicationRef,
  Injectable,
  Injector,
  NgZone,
  ANIMATION_MODULE_TYPE,
  EnvironmentInjector,
  inject,
  RendererFactory2,
  DOCUMENT,
} from '@angular/core';
import {_IdGenerator} from '../a11y';
import {_CdkPrivateStyleLoader} from '../private';
import {OverlayKeyboardDispatcher} from './dispatchers/overlay-keyboard-dispatcher';
import {OverlayOutsideClickDispatcher} from './dispatchers/overlay-outside-click-dispatcher';
import {OverlayConfig} from './overlay-config';
import {_CdkOverlayStyleLoader, OverlayContainer} from './overlay-container';
import {OverlayRef} from './overlay-ref';
import {OverlayPositionBuilder} from './position/overlay-position-builder';
import {ScrollStrategyOptions} from './scroll/index';

/**
 * Service to create Overlays. Overlays are dynamically added pieces of floating UI, meant to be
 * used as a low-level building block for other components. Dialogs, tooltips, menus,
 * selects, etc. can all be built using overlays. The service should primarily be used by authors
 * of re-usable components rather than developers building end-user applications.
 *
 * An overlay *is* a PortalOutlet, so any kind of Portal can be loaded into one.
 */
@Injectable({providedIn: 'root'})
export class Overlay {
  scrollStrategies = inject(ScrollStrategyOptions);
  private _overlayContainer = inject(OverlayContainer);
  private _positionBuilder = inject(OverlayPositionBuilder);
  private _keyboardDispatcher = inject(OverlayKeyboardDispatcher);
  private _injector = inject(Injector);
  private _ngZone = inject(NgZone);
  private _document = inject(DOCUMENT);
  private _directionality = inject(Directionality);
  private _location = inject(Location);
  private _outsideClickDispatcher = inject(OverlayOutsideClickDispatcher);
  private _animationsModuleType = inject(ANIMATION_MODULE_TYPE, {optional: true});
  private _idGenerator = inject(_IdGenerator);
  private _renderer = inject(RendererFactory2).createRenderer(null, null);

  private _appRef: ApplicationRef;
  private _styleLoader = inject(_CdkPrivateStyleLoader);

  constructor(...args: unknown[]);
  constructor() {}

  /**
   * Creates an overlay.
   * @param config Configuration applied to the overlay.
   * @returns Reference to the created overlay.
   */
  create(config?: OverlayConfig): OverlayRef {
    // This is done in the overlay container as well, but we have it here
    // since it's common to mock out the overlay container in tests.
    this._styleLoader.load(_CdkOverlayStyleLoader);

    const host = this._createHostElement();
    const pane = this._createPaneElement(host);
    const portalOutlet = this._createPortalOutlet(pane);
    const overlayConfig = new OverlayConfig(config);

    overlayConfig.direction = overlayConfig.direction || this._directionality.value;

    return new OverlayRef(
      portalOutlet,
      host,
      pane,
      overlayConfig,
      this._ngZone,
      this._keyboardDispatcher,
      this._document,
      this._location,
      this._outsideClickDispatcher,
      config?.disableAnimations ?? this._animationsModuleType === 'NoopAnimations',
      this._injector.get(EnvironmentInjector),
      this._renderer,
    );
  }

  /**
   * Gets a position builder that can be used, via fluent API,
   * to construct and configure a position strategy.
   * @returns An overlay position builder.
   */
  position(): OverlayPositionBuilder {
    return this._positionBuilder;
  }

  /**
   * Creates the DOM element for an overlay and appends it to the overlay container.
   * @returns Newly-created pane element
   */
  private _createPaneElement(host: HTMLElement): HTMLElement {
    const pane = this._document.createElement('div');

    pane.id = this._idGenerator.getId('cdk-overlay-');
    pane.classList.add('cdk-overlay-pane');
    host.appendChild(pane);

    return pane;
  }

  /**
   * Creates the host element that wraps around an overlay
   * and can be used for advanced positioning.
   * @returns Newly-create host element.
   */
  private _createHostElement(): HTMLElement {
    const host = this._document.createElement('div');
    this._overlayContainer.getContainerElement().appendChild(host);
    return host;
  }

  /**
   * Create a DomPortalOutlet into which the overlay content can be loaded.
   * @param pane The DOM element to turn into a portal outlet.
   * @returns A portal outlet for the given DOM element.
   */
  private _createPortalOutlet(pane: HTMLElement): DomPortalOutlet {
    // We have to resolve the ApplicationRef later in order to allow people
    // to use overlay-based providers during app initialization.
    if (!this._appRef) {
      this._appRef = this._injector.get<ApplicationRef>(ApplicationRef);
    }

    return new DomPortalOutlet(pane, this._appRef, this._injector);
  }
}
