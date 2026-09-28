/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, effect, inject, input} from '@angular/core';
import {Router} from '@angular/router';
import {GuideItems} from '../../shared/guide-items/guide-items';
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
  private readonly _router = inject(Router);
  guideItems = inject(GuideItems);

  /** Id of the guide to display. Bound from the `:id` route param. */
  readonly id = input.required<string>();

  readonly guide = computed(() => this.guideItems.getItemById(this.id()));

  constructor() {
    effect(() => {
      const guide = this.guide();

      if (guide) {
        this._componentPageTitle.title = guide.name;
      } else {
        this._router.navigate(['/guides']);
      }
    });
  }
}
