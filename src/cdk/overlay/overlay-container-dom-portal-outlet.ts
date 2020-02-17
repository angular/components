import {OverlayContainer} from '@angular/cdk/overlay';
import {PortalOutlet} from '@angular/cdk/portal';

export class OverlayContainerDomPortalOutlet implements PortalOutlet {

  constructor(private readonly _delegate: PortalOutlet, private readonly _overlayContainer: OverlayContainer) {
  }

  attach(portal: any): any {
    // Ensure the container element is up
    this._overlayContainer.getContainerElement();
    return this._delegate.attach(portal);
  }

  detach(): any {
    return this._delegate.detach();
  }

  dispose(): void {
    return this._delegate.dispose();
  }

  hasAttached(): boolean {
    return this._delegate.hasAttached();
  }

}
