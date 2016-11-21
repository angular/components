import {Injectable} from '@angular/core';

/**
 * The OverlayContainer is the container in which all overlays will load.
 * It should be provided in the root component to ensure it is properly shared.
 */
@Injectable()
export class OverlayContainer {
  protected _containerElement: HTMLElement;

  /**
   * This method returns the overlay container element.  It will lazily
   * create the element the first time  it is called to facilitate using
   * the container in non-browser environments.
   * @returns the container element
   */
  getContainerElement(): HTMLElement {
    if (!this._containerElement) { this._createContainer(); }
    return this._containerElement;
  }

  /**
   * Create the overlay container element, which is simply a div
   * with the 'cdk-overlay-container' class on the document body.
   */
  protected _createContainer(): void {
    let container = document.createElement('div');
    container.classList.add('cdk-overlay-container');
    document.body.appendChild(container);
    this._containerElement = container;
  }
}

/**
 * The OverlayContainer is the container in which all overlays will load.
 * It should be provided in the root component to ensure it is properly shared.
 */
@Injectable()
export class FullscreenFriendlyOverlayContainer extends OverlayContainer {
  protected _createContainer(): void {
    super._createContainer();

    this._addFullscreenChangeListener(() => this._adjustParentForFullscreenChange());
  }

  private _adjustParentForFullscreenChange(): void {
    if (!this._containerElement) {
      return;
    }

    let fullscreenElement = this._getFullscreenElement();
    let parent = fullscreenElement || document.body;
    parent.appendChild(this._containerElement);
  }

  private _addFullscreenChangeListener(fn: () => void) {
    if (document.fullscreenEnabled) {
      document.addEventListener('fullscreenchange', fn);
    } else if (document.webkitFullscreenEnabled) {
      document.addEventListener('webkitfullscreenchange', fn);
    } else if ((document as any).mozFullScreenEnabled) {
      document.addEventListener('mozfullscreenchange', fn);
    } else if ((document as any).msFullscreenEnabled) {
      document.addEventListener('MSFullscreenChange', fn);
    }
  }

  private _getFullscreenElement(): Element {
    return document.fullscreenElement ||
        document.webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement ||
        null;
  }
}
