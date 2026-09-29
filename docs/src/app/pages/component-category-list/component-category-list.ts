/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, effect, inject, input} from '@angular/core';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {RouterLink} from '@angular/router';
import {MatRipple} from '@angular/material/core';
import {NgTemplateOutlet} from '@angular/common';
import {switchMap} from 'rxjs/operators';

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
export class ComponentCategoryList {
  private readonly _docItems = inject(DocumentationItems);
  private readonly _componentPageTitle = inject(ComponentPageTitle);

  /** Section whose items are listed (material/cdk). Bound from the `:section` route param. */
  readonly section = input.required<string>();

  protected readonly _categoryListSummary = computed(() => SECTIONS[this.section()].summary);

  readonly items = toSignal(
    toObservable(this.section).pipe(switchMap(section => this._docItems.getItems(section))),
    {initialValue: [] as DocItem[]},
  );

  constructor() {
    effect(() => {
      this._componentPageTitle.title = SECTIONS[this.section()].name;
    });
  }
}
