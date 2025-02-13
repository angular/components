import {
  Component,
  NgModule,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  forwardRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
import {BreakpointObserver} from '@angular/cdk/layout';
import {AsyncPipe} from '@angular/common';
import {MatListItem, MatNavList} from '@angular/material/list';
import {MatSidenav, MatSidenavContainer} from '@angular/material/sidenav';
import {
  ActivatedRoute,
  Params,
  RouterModule,
  Routes,
  RouterOutlet,
  RouterLinkActive,
  RouterLink,
} from '@angular/router';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

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
  selector: 'app-component-sidenav',
  templateUrl: './component-sidenav.html',
  styleUrls: ['./component-sidenav.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    MatSidenav,
    MatSidenavContainer,
    forwardRef(() => ComponentNav),
    ComponentPageHeader,
    RouterOutlet,
    Footer,
    AsyncPipe,
  ],
})
export class ComponentSidenav implements OnInit, OnDestroy {
  readonly sidenav = viewChild(MatSidenav);
  params: Observable<Params>;
  isExtraScreenSmall: Observable<boolean>;
  isScreenSmall: Observable<boolean>;
  private _subscriptions = new Subscription();

  constructor(
    public docItems: DocumentationItems,
    private _route: ActivatedRoute,
    private _navigationFocusService: NavigationFocusService,
    breakpoints: BreakpointObserver,
  ) {
    this.isExtraScreenSmall = breakpoints
      .observe(`(max-width: ${EXTRA_SMALL_WIDTH_BREAKPOINT}px)`)
      .pipe(map(breakpoint => breakpoint.matches));
    this.isScreenSmall = breakpoints
      .observe(`(max-width: ${SMALL_WIDTH_BREAKPOINT}px)`)
      .pipe(map(breakpoint => breakpoint.matches));

    this.params = combineLatest(
      this._route.pathFromRoot.map(route => route.params),
      Object.assign,
    );
  }

  ngOnInit() {
    this._subscriptions.add(
      this._navigationFocusService.navigationEndEvents
        .pipe(map(() => this.isScreenSmall))
        .subscribe(shouldCloseSideNav => {
          const sidenav = this.sidenav();
          if (shouldCloseSideNav && sidenav) {
            sidenav.close();
          }
        }),
    );
  }

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }

  toggleSidenav(): void {
    this.sidenav()?.toggle();
  }
}

@Component({
  selector: 'app-component-nav',
  templateUrl: './component-nav.html',
  standalone: true,
  imports: [MatNavList, MatListItem, RouterLinkActive, RouterLink, AsyncPipe],
})
export class ComponentNav {
  private _docItems = inject(DocumentationItems);
  readonly params = input<Params | null>();

  items = toObservable(this.params).pipe(
    switchMap(params =>
      params?.section ? this._docItems.getItems(params.section) : Promise.resolve(null),
    ),
  );
}

const routes: Routes = [
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class ComponentSidenavModule {}
