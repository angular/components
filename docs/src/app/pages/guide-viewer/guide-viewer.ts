/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute, Router} from '@angular/router';
import {GuideItem, GuideItems} from '../../shared/guide-items/guide-items';
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

  guide = signal<GuideItem | undefined>(undefined);

  constructor() {
    const _route = inject(ActivatedRoute);
    const guideItems = this.guideItems;

    _route.params.pipe(takeUntilDestroyed()).subscribe(p => {
      const guideItem = guideItems.getItemById(p['id']);
      if (guideItem) {
        this.guide.set(guideItem);
        this._componentPageTitle.title = guideItem.name;
      }

      if (!this.guide()) {
        this._router.navigate(['/guides']);
      }
    });
  }
}
