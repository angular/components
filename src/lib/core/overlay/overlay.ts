import {
  ComponentFactoryResolver,
  Injectable,
  ApplicationRef,
  Injector,
  NgZone,
  Provider,
  ReflectiveInjector,
} from '@angular/core';
import {OverlayState} from './overlay-state';
import {DomPortalHost} from '../portal/dom-portal-host';
import {OverlayRef} from './overlay-ref';
import {OverlayPositionBuilder} from './position/overlay-position-builder';
import {VIEWPORT_RULER_PROVIDER} from './position/viewport-ruler';
import {OverlayContainer, OVERLAY_CONTAINER_PROVIDER} from './overlay-container';
import {ScrollStrategy} from './scroll/scroll-strategy';
import {RepositionScrollStrategy} from './scroll/reposition-scroll-strategy';
import {BlockScrollStrategy} from './scroll/block-scroll-strategy';
import {CloseScrollStrategy} from './scroll/close-scroll-strategy';
import {NoopScrollStrategy} from './scroll/noop-scroll-strategy';


/** Next overlay unique ID. */
let nextUniqueId = 0;

/** The default state for newly created overlays. */
let defaultState = new OverlayState();


/**
 * Service to create Overlays. Overlays are dynamically added pieces of floating UI, meant to be
 * used as a low-level building building block for other components. Dialogs, tooltips, menus,
 * selects, etc. can all be built using overlays. The service should primarily be used by authors
 * of re-usable components rather than developers building end-user applications.
 *
 * An overlay *is* a PortalHost, so any kind of Portal can be loaded into one.
 */
@Injectable()
export class Overlay {
  // Create a child ReflectiveInjector, allowing us to instantiate scroll
  // strategies without going throught the injector cache.
  private _reflectiveInjector = ReflectiveInjector.resolveAndCreate([], this._injector);
  private _scrollStrategies = {
    reposition: RepositionScrollStrategy,
    block: BlockScrollStrategy,
    close: CloseScrollStrategy,
    noop: NoopScrollStrategy
  };

  constructor(private _overlayContainer: OverlayContainer,
              private _componentFactoryResolver: ComponentFactoryResolver,
              private _positionBuilder: OverlayPositionBuilder,
              private _appRef: ApplicationRef,
              private _injector: Injector,
              private _ngZone: NgZone) { }

  /**
   * Creates an overlay.
   * @param state State to apply to the overlay.
   * @returns Reference to the created overlay.
   */
  create(state: OverlayState = defaultState): OverlayRef {
    return this._createOverlayRef(this._createPaneElement(), state);
  }

  /**
   * Returns a position builder that can be used, via fluent API,
   * to construct and configure a position strategy.
   */
  position(): OverlayPositionBuilder {
    return this._positionBuilder;
  }

  /**
   * Registers a scroll strategy to be available for use when creating an overlay.
   * @param name Name of the scroll strategy.
   * @param constructor Class to be used to instantiate the scroll strategy.
   */
  registerScrollStrategy(name: string, constructor: Function): void {
    if (name && constructor) {
      this._scrollStrategies[name] = constructor;
    }
  }

  /**
   * Creates the DOM element for an overlay and appends it to the overlay container.
   * @returns Newly-created pane element
   */
  private _createPaneElement(): HTMLElement {
    let pane = document.createElement('div');

    pane.id = `cdk-overlay-${nextUniqueId++}`;
    pane.classList.add('cdk-overlay-pane');
    this._overlayContainer.getContainerElement().appendChild(pane);

    return pane;
  }

  /**
   * Create a DomPortalHost into which the overlay content can be loaded.
   * @param pane The DOM element to turn into a portal host.
   * @returns A portal host for the given DOM element.
   */
  private _createPortalHost(pane: HTMLElement): DomPortalHost {
    return new DomPortalHost(pane, this._componentFactoryResolver, this._appRef, this._injector);
  }

  /**
   * Creates an OverlayRef for an overlay in the given DOM element.
   * @param pane DOM element for the overlay
   * @param state
   */
  private _createOverlayRef(pane: HTMLElement, state: OverlayState): OverlayRef {
    let portalHost = this._createPortalHost(pane);
    let scrollStrategy = this._createScrollStrategy(state);
    return new OverlayRef(portalHost, pane, state, scrollStrategy, this._ngZone);
  }

  /**
   * Resolves the scroll strategy of an overlay state.
   * @param state State for which to resolve the scroll strategy.
   */
  private _createScrollStrategy(state: OverlayState): ScrollStrategy {
    let strategyName = typeof state.scrollStrategy === 'string' ?
        state.scrollStrategy :
        state.scrollStrategy.name;

    if (!this._scrollStrategies.hasOwnProperty(strategyName)) {
      throw new Error(`Unsupported scroll strategy "${strategyName}". The available scroll ` +
                      `strategies are ${Object.keys(this._scrollStrategies).join(', ')}.`);
    }

    // Note that we use `resolveAndInstantiate` which will instantiate
    // the scroll strategy without putting it in the injector cache.
    return this._reflectiveInjector.resolveAndInstantiate(this._scrollStrategies[strategyName]);
  }
}

/** Providers for Overlay and its related injectables. */
export const OVERLAY_PROVIDERS: Provider[] = [
  Overlay,
  OverlayPositionBuilder,
  VIEWPORT_RULER_PROVIDER,
  OVERLAY_CONTAINER_PROVIDER,
];
