import {
  ComponentResolver,
  OpaqueToken,
  Inject,
  Injectable,
} from '@angular/core';
import {OverlayState} from './overlay-state';
import {DomPortalHost} from '../portal/dom-portal-host';
import {OverlayRef} from './overlay-ref';

/** Token used to inject the DOM element that serves as the overlay container. */
export const OVERLAY_CONTAINER_TOKEN = new OpaqueToken('overlayContainer');

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
  private _overlayContainerElement: HTMLElement;

  constructor(
    @Inject(OVERLAY_CONTAINER_TOKEN) overlayContainerElement: any,
    private _componentResolver: ComponentResolver) {

    this._overlayContainerElement = overlayContainerElement;
  }

  /**
   * Creates an overlay.
   * @param state State to apply to the overlay.
   * @returns A reference to the created overlay.
   */
  create(state: OverlayState = defaultState): Promise<OverlayRef> {
    return this._createPaneElement().then(pane => this._createOverlayRef(pane, state));
  }

  /**
   * Creates the DOM element for an overlay and appends it to the overlay container.
   * @returns Promise resolving to the created element.
   */
  private _createPaneElement(): Promise<HTMLElement> {
    var pane = document.createElement('div');
    pane.id = 'md2-overlay-' + (nextUniqueId++);
    pane.classList.add('md2-overlay-pane');

    this._overlayContainerElement.appendChild(pane);

    return Promise.resolve(pane);
  }

  /**
   * Create a DomPortalHost into which the overlay content can be loaded.
   * @param pane The DOM element to turn into a portal host.
   * @returns A portal host for the given DOM element.
   */
  private _createPortalHost(pane: HTMLElement): DomPortalHost {
    return new DomPortalHost(
      pane,
      this._componentResolver);
  }

  /**
   * Creates an OverlayRef for an overlay in the given DOM element.
   * @param pane DOM element for the overlay
   * @param state
   * @returns {OverlayRef}
   */
  private _createOverlayRef(pane: HTMLElement, state: OverlayState): OverlayRef {
    return new OverlayRef(this._createPortalHost(pane), pane, state);
  }
}
