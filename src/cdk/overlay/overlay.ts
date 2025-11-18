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
  InjectionToken,
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

/** Object used to configure the default options for overlays. */
export interface OverlayDefaultConfig {
  alwaysInline?: boolean;
  usePopover?: boolean;
}

/** Injection token used to configure the default options for CDK overlays. */
export const OVERLAY_DEFAULT_CONFIG = new InjectionToken<OverlayDefaultConfig>(
  'OVERLAY_DEFAULT_CONFIG',
);

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
  const renderer =
    injector.get(Renderer2, null, {optional: true}) ||
    injector.get(RendererFactory2).createRenderer(null, null);

  const overlayConfig = new OverlayConfig(config);
  const defaultUsePopover =
    injector.get(OVERLAY_DEFAULT_CONFIG, null, {optional: true})?.usePopover ?? true;

  overlayConfig.direction = overlayConfig.direction || directionality.value;

  if (!('showPopover' in doc.body)) {
    overlayConfig.usePopover = false;
  } else {
    overlayConfig.usePopover = config?.usePopover ?? defaultUsePopover;
  }

  const pane = doc.createElement('div');
  const host = doc.createElement('div');
  pane.id = idGenerator.getId('cdk-overlay-');
  pane.classList.add('cdk-overlay-pane');
  host.appendChild(pane);

  if (overlayConfig.usePopover) {
    host.setAttribute('popover', 'manual');
    host.classList.add('cdk-overlay-popover');
  }

  const customInsertionPoint = overlayConfig.usePopover
    ? overlayConfig.positionStrategy?.getPopoverInsertionPoint?.()
    : null;

  overlayContainer.getContainerElement().appendChild(host);

  // Note: it's redundant to pass the `host` through the container element above if
  // it's going to end up at the custom insertion point anyways. We need to do it,
  // because some internal clients depend on the host passing through the container first.
  if (customInsertionPoint) {
    if (customInsertionPoint instanceof Element) {
      customInsertionPoint.after(host);
    } else {
      if (customInsertionPoint.type === 'parent') {
        customInsertionPoint.element?.appendChild(host);
      }
    }
  }

  return new OverlayRef(
    new DomPortalOutlet(pane, appRef, injector),
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
