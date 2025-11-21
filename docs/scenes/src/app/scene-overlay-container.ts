/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable} from '@angular/core';
import {OverlayContainer} from '@angular/cdk/overlay';

@Injectable({providedIn: 'root'})
export class SceneOverlayContainer extends OverlayContainer {
  _createContainer(): void {
    const container = this._document.createElement('div');
    container.classList.add('scene-overlay-container');

    this._document.querySelector('#scene-content-container')?.appendChild(container);
    this._containerElement = container;
  }
}
