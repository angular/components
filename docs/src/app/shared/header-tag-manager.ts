/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '@angular/common';
import {Injectable, inject} from '@angular/core';

const MAT_ANGULAR_DEV = 'https://material.angular.dev';

/**
 * Information about the deployment of this application.
 */
@Injectable({providedIn: 'root'})
export class HeaderTagManager {
  private readonly _document = inject(DOCUMENT);

  /**
   * Sets the canonical link in the header.
   * It supposes the header link is already present in the index.html
   *
   * The function behave invariably and will always point to angular.dev,
   * no matter if it's a specific version build
   */
  setCanonical(absolutePath: string): void {
    const pathWithoutFragment = this._normalizePath(absolutePath).split('#')[0];
    const fullPath = `${MAT_ANGULAR_DEV}/${pathWithoutFragment}`;
    this._document.querySelector('link[rel=canonical]')?.setAttribute('href', fullPath);
  }

  private _normalizePath(path: string): string {
    if (path[0] === '/') {
      return path.substring(1);
    }
    return path;
  }
}
