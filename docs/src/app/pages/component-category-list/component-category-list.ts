/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute, Params, RouterLink} from '@angular/router';
import {MatRipple} from '@angular/material/core';
import {NgTemplateOutlet} from '@angular/common';
import {combineLatest} from 'rxjs';
import {map} from 'rxjs/operators';

import {
  DocItem,
  DocumentationItems,
  SECTIONS,
} from '../../shared/documentation-items/documentation-items';
import {NavigationFocus} from '../../shared/navigation-focus/navigation-focus';

import {ComponentPageTitle} from '../page-title/page-title';

@Component({
  selector: 'app-component-category-list',
  templateUrl: './component-category-list.html',
  styleUrls: ['./component-category-list.scss'],
  imports: [NavigationFocus, RouterLink, MatRipple, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ComponentCategoryList implements OnInit {
  private readonly _docItems = inject(DocumentationItems);
  private readonly _componentPageTitle = inject(ComponentPageTitle);
  private readonly _route = inject(ActivatedRoute);
  private readonly _destroyRef = inject(DestroyRef);

  items: DocItem[] = [];
  section = '';
  _categoryListSummary: string | undefined;

  ngOnInit() {
    combineLatest(this._route.pathFromRoot.map(route => route.params))
      .pipe(
        map(allParams =>
          allParams.reduce((merged, params) => ({...merged, ...params}), {} as Params),
        ),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(async params => {
        const sectionName = params['section'];
        const section = SECTIONS[sectionName];
        this._componentPageTitle.title = section.name;
        this._categoryListSummary = section.summary;
        this.section = sectionName;
        this.items = await this._docItems.getItems(sectionName);
      });
  }
}
