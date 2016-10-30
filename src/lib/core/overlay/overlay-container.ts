/**
 * The OverlayContainer is the container in which all overlays will load.
 * It should be provided in the root component to ensure it is properly shared.
 */
export class OverlayContainer {
  private _containerElement: HTMLElement;

  /**
   * This method returns the overlay container element.  It will lazily
   * create the element the first time  it is called to facilitate using
   * the container in non-browser environments.
   * @returns {HTMLElement} the container element
   */
  getContainerElement(): HTMLElement {
    if (!this._containerElement) { this._createContainer(); }
    return this._containerElement;
  }

  /**
   * Create the overlay container element, which is simply a div
   * with the 'md-overlay-container' class on the document body.
   */
  private _createContainer(): void {
    let container = document.createElement('div');
    container.classList.add('md-overlay-container');
    document.addEventListener('fullscreenchange', () => this._adjustContainerParent());
    document.addEventListener('webkitfullscreenchange', () => this._adjustContainerParent());
    document.addEventListener('mozfullscreenchange', () => this._adjustContainerParent());
    document.addEventListener('MSFullscreenChange', () => this._adjustContainerParent());
    this._containerElement = container;
    this._adjustContainerParent();
  }

  private _adjustContainerParent() {
    // use any type because document type doesn't declare full screen variables
    let currentDocument: any = document;
    if (currentDocument.fullscreenElement) {
      currentDocument.fullScreenElement.appendChild(this._containerElement);
    } else if (currentDocument.mozFullScreenElement) {
      currentDocument.mozFullScreenElement.appendChild(this._containerElement);
    } else if (currentDocument.webkitFullscreenElement) {
      currentDocument.webkitCurrentFullScreenElement.appendChild(this._containerElement);
    } else if (currentDocument.msFullscreenElement) {
      currentDocument.msFullscreenElement.appendChild(this._containerElement);
    } else {
      document.body.appendChild(this._containerElement);
    }
  }
}
