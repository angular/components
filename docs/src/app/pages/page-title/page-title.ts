/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, inject} from '@angular/core';
import {Title} from '@angular/platform-browser';

/**
 * Service responsible for setting the title that appears above the components and guide pages.
 */
@Injectable({providedIn: 'root'})
export class ComponentPageTitle {
  private _bodyTitle = inject(Title);

  _title = '';
  _originalTitle = 'Angular Material UI component library';

  get title(): string {
    return this._title;
  }

  set title(title: string) {
    this._title = title;
    if (title !== '') {
      title = `${title} | Angular Material`;
    } else {
      title = this._originalTitle;
    }
    this._bodyTitle.setTitle(title);
  }
}
