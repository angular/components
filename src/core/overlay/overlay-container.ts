

export class OverlayContainer {
  private _containerElement: Element;

  getContainerElement(): Element {
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
    document.body.appendChild(container);
    this._containerElement = container;
  }
}
