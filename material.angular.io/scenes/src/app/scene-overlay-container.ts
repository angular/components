import {OverlayContainer} from '@angular/cdk/overlay';

export class SceneOverlayContainer extends OverlayContainer {
  _createContainer(): void {
    const container = this._document.createElement('div');
    container.classList.add('scene-overlay-container');

    this._document.querySelector('#scene-content-container')?.appendChild(container);
    this._containerElement = container;
  }
}
