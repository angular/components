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
  Renderer2,
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
 * Creates an overlay.
 * @param injector Injector to use when resolving the overlay's dependencies.
 * @param config Configuration applied to the overlay.
 * @returns Reference to the created overlay.
 */
export function createOverlayRef(injector: Injector, config?: OverlayConfig): OverlayRef {
  // This is done in the overlay container as well, but we have it here
  // since it's common to mock out the overlay container in tests.
  injector.get(_CdkPrivateStyleLoader).load(_CdkOverlayStyleLoader);

  const overlayContainer = injector.get(OverlayContainer);
  const doc = injector.get(DOCUMENT);
  const idGenerator = injector.get(_IdGenerator);
  const appRef = injector.get(ApplicationRef);
  const directionality = injector.get(Directionality);

  const host = doc.createElement('div');
  const pane = doc.createElement('div');

  pane.id = idGenerator.getId('cdk-overlay-');
  pane.classList.add('cdk-overlay-pane');
  host.appendChild(pane);
  overlayContainer.getContainerElement().appendChild(host);

  const portalOutlet = new DomPortalOutlet(pane, appRef, injector);
  const overlayConfig = new OverlayConfig(config);
  const renderer =
    injector.get(Renderer2, null, {optional: true}) ||
    injector.get(RendererFactory2).createRenderer(null, null);

  overlayConfig.direction = overlayConfig.direction || directionality.value;

  return new OverlayRef(
    portalOutlet,
    host,
    pane,
    overlayConfig,
    injector.get(NgZone),
    injector.get(OverlayKeyboardDispatcher),
    doc,
    injector.get(Location),
    injector.get(OverlayOutsideClickDispatcher),
    config?.disableAnimations ??
      injector.get(ANIMATION_MODULE_TYPE, null, {optional: true}) === 'NoopAnimations',
    injector.get(EnvironmentInjector),
    renderer,
  );
}

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
  private _positionBuilder = inject(OverlayPositionBuilder);
  private _injector = inject(Injector);

  constructor(...args: unknown[]);
  constructor() {}

  /**
   * Creates an overlay.
   * @param config Configuration applied to the overlay.
   * @returns Reference to the created overlay.
   */
  create(config?: OverlayConfig): OverlayRef {
    return createOverlayRef(this._injector, config);
  }

  /**
   * Gets a position builder that can be used, via fluent API,
   * to construct and configure a position strategy.
   * @returns An overlay position builder.
   */
  position(): OverlayPositionBuilder {
    return this._positionBuilder;
  }
}
