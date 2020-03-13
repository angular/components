/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface HTMLMarkerOptions {
  position: google.maps.LatLng | google.maps.LatLngLiteral;
  content: HTMLElement;
}

export class HTMLMarker extends google.maps.OverlayView {
  private _element: HTMLElement;
  private _isAppended = false;

  private _position!: google.maps.LatLng;

  constructor(options: HTMLMarkerOptions) {
    super();

    this.setPosition(options.position);

    this._element = document.createElement('div');
    this._element.style.position = 'absolute';
    this._element.appendChild(options.content);
  }

  appendDivToOverlay() {
    const panes = this.getPanes();
    panes.overlayMouseTarget.appendChild(this._element);
    this._isAppended = true;
  }

  positionDiv() {
    const point = this.getProjection().fromLatLngToDivPixel(this._position);
    if (point) {
      this._element.style.left = `${point.x}px`;
      this._element.style.top = `${point.y}px`;
    }
  }

  draw() {
    if (!this._isAppended) {
      this.appendDivToOverlay();
    }
    this.positionDiv();
  }

  remove(): void {
    this._element.parentNode?.removeChild(this._element);
    this._isAppended = false;
  }

  setPosition(position: google.maps.LatLng | google.maps.LatLngLiteral): void {
    if (!this._LatLngEquals(this._position, position)) {
      this._position = this._createLatLng(position);
    }
  }

  getPosition(): google.maps.LatLng {
    return this._position;
  }

  getDraggable(): boolean {
    return false;
  }

  private _createLatLng(
    position: google.maps.LatLng | google.maps.LatLngLiteral,
  ): google.maps.LatLng {
    if (position instanceof google.maps.LatLng) {
      return position;
    } else {
      return new google.maps.LatLng(position);
    }
  }

  private _LatLngEquals(
    positionA: google.maps.LatLng | undefined,
    positionB: google.maps.LatLng | google.maps.LatLngLiteral,
  ): boolean {
    if (!positionA) {
      return false;
    }

    if (positionB instanceof google.maps.LatLng) {
      return positionA.equals(positionB);
    } else {
      return positionA.lat() == positionB.lat && positionA.lng() == positionB.lng;
    }
  }
}
