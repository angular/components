import {PortalHost, Portal} from '../portal/portal';
import {OverlayState} from './overlay-state';

/**
 * Reference to an overlay that has been created with the Overlay service.
 * Used to manipulate or dispose of said overlay.
 */
export class OverlayRef implements PortalHost {
  constructor(
    private _portalHost: PortalHost,
    private _pane: HTMLElement,
    private _state: OverlayState) { }

  attach(portal: Portal<any>): Promise<any> {
    return this._portalHost.attach(portal);
  }

  detach(): Promise<any> {
    return this._portalHost.detach();
  }

  dispose(): void {
    this._portalHost.dispose();
  }
}
