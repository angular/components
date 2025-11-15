/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, inject, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatRipple} from '@angular/material/core';
import {combineLatest} from 'rxjs';

import {
  DocItem,
  DocumentationItems,
  SECTIONS,
} from '../../shared/documentation-items/documentation-items';
import {NavigationFocus} from '../../shared/navigation-focus/navigation-focus';

import {ComponentPageTitle} from '../page-title/page-title';
import {map, switchMap} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-component-category-list',
  templateUrl: './component-category-list.html',
  styleUrls: ['./component-category-list.scss'],
  imports: [NavigationFocus, RouterLink, MatRipple],
})
export class ComponentCategoryList {
  private readonly _docItems = inject(DocumentationItems);
  private readonly _componentPageTitle = inject(ComponentPageTitle);
  private readonly _route = inject(ActivatedRoute);

  readonly items = signal<DocItem[]>([]);
  readonly section = signal<string>('');
  readonly _categoryListSummary = signal<string | undefined>(undefined);

  constructor() {
    // Combine all route parameters from root to current route into a single observable
    // pathFromRoot gives us the entire route hierarchy (e.g., /docs/:category/:section)
    combineLatest(this._route.pathFromRoot.map(route => route.params))
      .pipe(
        // Merge all parameter objects into one, with child route params overriding parent params
        // Example: [{category: 'components'}, {section: 'button'}] becomes {category: 'components', section: 'button'}
        map(paramsArray => paramsArray.reduce((acc, curr) => ({...acc, ...curr}), {})),

        // Switch to a new observable when params change, canceling any pending requests
        // This prevents race conditions if the user navigates quickly between sections
        switchMap(params => {
          // Extract the section name from route parameters
          const sectionName = params['section'];

          // Look up section metadata from the SECTIONS configuration
          const section = SECTIONS[sectionName];

          // Update page title in browser tab/window
          this._componentPageTitle.title = section.name;

          // Update component state with section summary (displayed in UI)
          this._categoryListSummary.set(section.summary);

          // Store current section name
          this.section.set(sectionName);

          // Fetch documentation items for this section from the service
          // switchMap will cancel this request if route params change before completion
          return this._docItems.getItems(sectionName);
        }),

        // Automatically unsubscribe when component is destroyed (no manual cleanup needed)
        takeUntilDestroyed(),
      )
      .subscribe(items => {
        // Update the items signal with fetched documentation items
        // This triggers change detection and updates the template
        this.items.set(items);
      });
  }
}
