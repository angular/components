/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {MatIcon} from '@angular/material/icon';

/**
 * Header link is a component that handles normalizing
 * the anchor jump tags with the current route url.
 */
@Component({
  selector: 'header-link',
  template: `
    <a aria-label="Link to this heading" class="docs-markdown-a"
      [attr.aria-describedby]="example()" [href]="_fragmentUrl()">
      <mat-icon>link</mat-icon>
    </a>
  `,
  imports: [MatIcon],
})
export class HeaderLink {
  /**
   * Id of the anchor element. Note that is uses "example" because we instantiate the
   * header link components through the ComponentPortal.
   */
  readonly example = signal('');

  /** Base URL that is used to build an absolute fragment URL. */
  private _baseUrl = inject(Router).url.split('#')[0];

  protected readonly _fragmentUrl = computed(() => {
    return `${this._baseUrl}#${this.example()}`;
  });
}
