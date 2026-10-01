/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
  input,
  resource,
  viewChild,
} from '@angular/core';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {BreakpointObserver} from '@angular/cdk/layout';
import {MatListItem, MatNavList} from '@angular/material/list';
import {MatSidenav, MatSidenavContainer} from '@angular/material/sidenav';
import {Routes, RouterOutlet, RouterLinkActive, RouterLink} from '@angular/router';
import {map} from 'rxjs/operators';

import {DocumentationItems} from '../../shared/documentation-items/documentation-items';
import {Footer} from '../../shared/footer/footer';

import {NavigationFocusService} from '../../shared/navigation-focus/navigation-focus.service';

import {ComponentCategoryList} from '../component-category-list/component-category-list';
import {ComponentPageHeader} from '../component-page-header/component-page-header';
import {
  ComponentApi,
  ComponentExamples,
  ComponentOverview,
  ComponentViewer,
} from '../component-viewer/component-viewer';
import {ComponentStyling} from '../component-viewer/component-styling';

// These constants are used by the ComponentSidenav for orchestrating the MatSidenav in a responsive
// way. This includes hiding the sidenav, defaulting it to open, changing the mode from over to
// side, determining the size of the top gap, and whether the sidenav is fixed in the viewport.
// The values were determined through the combination of Material Design breakpoints and careful
// testing of the application across a range of common device widths (360px+).
// These breakpoint values need to stay in sync with the related Sass variables in
// src/styles/_constants.scss.
const EXTRA_SMALL_WIDTH_BREAKPOINT = 720;
const SMALL_WIDTH_BREAKPOINT = 959;

@Component({
  selector: 'app-component-nav',
  templateUrl: './component-nav.html',
  imports: [MatNavList, MatListItem, RouterLinkActive, RouterLink],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ComponentNav {
  private readonly _docItems = inject(DocumentationItems);

  /** Section (material/cdk) whose items are listed. */
  readonly section = input<string>();

  /** Doc items of the section. */
  readonly items = resource({
    params: () => this.section(),
    loader: ({params: section}) => this._docItems.getItems(section),
    defaultValue: [],
  });
}

@Component({
  selector: 'app-component-sidenav',
  templateUrl: './component-sidenav.html',
  styleUrl: './component-sidenav.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatSidenav,
    MatSidenavContainer,
    ComponentNav,
    ComponentPageHeader,
    RouterOutlet,
    Footer,
  ],
})
export class ComponentSidenav {
  private readonly _breakpoints = inject(BreakpointObserver);

  /** Section (material/cdk) of the current route. Bound from the route params. */
  readonly section = input<string>();

  readonly docItems = inject(DocumentationItems);

  readonly sidenav = viewChild(MatSidenav);
  readonly isExtraScreenSmall = this._matchesMaxWidth(EXTRA_SMALL_WIDTH_BREAKPOINT);
  readonly isScreenSmall = this._matchesMaxWidth(SMALL_WIDTH_BREAKPOINT);

  constructor() {
    // Close the sidenav on navigation when the screen is small.
    inject(NavigationFocusService)
      .navigationEndEvents.pipe(takeUntilDestroyed())
      .subscribe(() => {
        if (this.isScreenSmall()) {
          this.sidenav()?.close();
        }
      });
  }

  toggleSidenav(): void {
    this.sidenav()?.toggle();
  }

  private _matchesMaxWidth(width: number) {
    return toSignal(
      this._breakpoints
        .observe(`(max-width: ${width}px)`)
        .pipe(map(breakpoint => breakpoint.matches)),
      {requireSync: true},
    );
  }
}

export const componentSidenavRoutes: Routes = [
  {
    path: '',
    component: ComponentSidenav,
    children: [
      {path: 'component/:id', redirectTo: ':id', pathMatch: 'full'},
      {path: 'category/:id', redirectTo: '/categories/:id', pathMatch: 'full'},
      {
        path: 'categories',
        children: [{path: '', component: ComponentCategoryList}],
      },
      {
        path: ':id',
        component: ComponentViewer,
        children: [
          {path: '', redirectTo: 'overview', pathMatch: 'full'},
          {path: 'overview', component: ComponentOverview, pathMatch: 'full'},
          {path: 'api', component: ComponentApi, pathMatch: 'full'},
          {path: 'styling', component: ComponentStyling, pathMatch: 'full'},
          {path: 'examples', component: ComponentExamples, pathMatch: 'full'},
        ],
      },
      {path: '**', redirectTo: '/404'},
    ],
  },
];
