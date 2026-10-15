/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, effect, inject, input} from '@angular/core';
import {GuideItem} from '../../shared/guide-items/guide-items';
import {Footer} from '../../shared/footer/footer';

import {ComponentPageTitle} from '../page-title/page-title';
import {NavigationFocus} from '../../shared/navigation-focus/navigation-focus';
import {TableOfContents} from '../../shared/table-of-contents/table-of-contents';
import {DocViewer} from '../../shared/doc-viewer/doc-viewer';

@Component({
  selector: 'guide-viewer',
  templateUrl: './guide-viewer.html',
  styleUrls: ['./guide-viewer.scss'],
  imports: [DocViewer, NavigationFocus, TableOfContents, Footer],
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'docs-main-content',
  },
})
export class GuideViewer {
  private readonly _componentPageTitle = inject(ComponentPageTitle);

  /** Guide to display. Bound from the route's resolved `guide`. */
  readonly guide = input.required<GuideItem>();

  constructor() {
    effect(() => {
      this._componentPageTitle.title = this.guide().name;
    });
  }
}
