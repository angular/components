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
   * Sets the canonical link in the header. If the link already exists,
   * it will be updated. Otherwise, a new link will be created and inserted
   * after the title tag.
   *
   * The function behave invariably and will always point to angular.dev,
   * no matter if it's a specific version build
   */
  setCanonical(absolutePath: string): void {
    const pathWithoutFragment = this._normalizePath(absolutePath).split('#')[0];
    const fullPath = `${MAT_ANGULAR_DEV}/${pathWithoutFragment}`;
    let canonicalLink = this._document.querySelector<HTMLLinkElement>('link[rel=canonical]');

    if (canonicalLink) {
      canonicalLink.setAttribute('href', fullPath);
    } else {
      canonicalLink = this._document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', fullPath);

      const title = this._document.head.querySelector('title');
      if (title) {
        title.insertAdjacentElement('afterend', canonicalLink);
      } else {
        this._document.head.appendChild(canonicalLink);
      }
    }
  }

  private _normalizePath(path: string): string {
    if (path[0] === '/') {
      return path.substring(1);
    }
    return path;
  }
}
