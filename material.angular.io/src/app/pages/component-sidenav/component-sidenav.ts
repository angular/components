import {
  Component,
  Input,
  NgModule,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {DocumentationItems} from '../../shared/documentation-items/documentation-items';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenav, MatSidenavModule} from '@angular/material/sidenav';
import {ActivatedRoute, NavigationEnd, Params, Router, RouterModule, Routes} from '@angular/router';
import {CommonModule} from '@angular/common';
import {ComponentHeaderModule} from '../component-page-header/component-page-header';
import {FooterModule} from '../../shared/footer/footer';
import {combineLatest, Observable, Subject} from 'rxjs';
import {filter, map, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {CdkAccordionModule} from '@angular/cdk/accordion';
import {BreakpointObserver} from '@angular/cdk/layout';
import {
  ComponentCategoryList,
  ComponentCategoryListModule
} from '../component-category-list/component-category-list';
import {ComponentList, ComponentListModule} from '../component-list';
import {
  ComponentApi,
  ComponentExamples,
  ComponentOverview,
  ComponentViewer,
  ComponentViewerModule
} from '../component-viewer/component-viewer';
import {DocViewerModule} from '../../shared/doc-viewer/doc-viewer-module';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {StackBlitzButtonModule} from '../../shared/stack-blitz';
import {SvgViewerModule} from '../../shared/svg-viewer/svg-viewer';
import {MatDrawerToggleResult} from '@angular/material/sidenav/drawer';
import {MatListModule} from '@angular/material/list';
import {NavigationFocusModule} from '../../shared/navigation-focus/navigation-focus';

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
})
export class ComponentSidenav implements OnInit {
  @ViewChild(MatSidenav) sidenav: MatSidenav;
  params: Observable<Params>;
  isExtraScreenSmall: Observable<boolean>;
  isScreenSmall: Observable<boolean>;

  constructor(public docItems: DocumentationItems,
              private _route: ActivatedRoute,
              private _router: Router,
              zone: NgZone,
              breakpoints: BreakpointObserver) {
    this.isExtraScreenSmall =
        breakpoints.observe(`(max-width: ${EXTRA_SMALL_WIDTH_BREAKPOINT}px)`)
            .pipe(map(breakpoint => breakpoint.matches));
    this.isScreenSmall = breakpoints.observe(`(max-width: ${SMALL_WIDTH_BREAKPOINT}px)`)
    .pipe(map(breakpoint => breakpoint.matches));
  }

  ngOnInit() {
    // Combine params from all of the path into a single object.
    this.params = combineLatest(
        this._route.pathFromRoot.map(route => route.params), Object.assign);

    this._router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => this.isScreenSmall)
    ).subscribe((shouldCloseSideNav) => {
        if (shouldCloseSideNav && this.sidenav) {
          this.sidenav.close();
        }
      }
    );
  }

  toggleSidenav(sidenav: MatSidenav): Promise<MatDrawerToggleResult> {
    return sidenav.toggle();
  }
}

@Component({
  selector: 'app-component-nav',
  templateUrl: './component-nav.html',
  animations: [
    trigger('bodyExpansion', [
      state('collapsed', style({height: '0px', display: 'none'})),
      state('expanded', style({height: '*', display: 'block'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4,0.0,0.2,1)')),
    ]),
  ],
})
export class ComponentNav implements OnInit, OnDestroy {
  @Input() params: Observable<Params>;
  expansions: {[key: string]: boolean} = {};
  currentItemId: string;
  private _onDestroy = new Subject<void>();

  constructor(public docItems: DocumentationItems, private _router: Router) {}

  ngOnInit() {
    this._router.events.pipe(
      startWith(null),
      switchMap(() => this.params),
      takeUntil(this._onDestroy)
    ).subscribe(params => this.setExpansions(params));
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  /** Set the expansions based on the route url */
  setExpansions(params: Params) {
    const categories = this.docItems.getCategories(params.section);
    for (const category of (categories || [])) {

      let match = false;
      for (const item of category.items) {
        if (this._router.url.indexOf(item.id) > -1) {
          match = true;
          this.currentItemId = item.id;
          break;
        }
      }

      if (!this.expansions[category.id]) {
        this.expansions[category.id] = match;
      }
    }
  }

  /** Gets the expanded state */
  _getExpandedState(category: string) {
    return this.getExpanded(category) ? 'expanded' : 'collapsed';
  }

  /** Toggles the expanded state */
  toggleExpand(category: string) {
    this.expansions[category] = !this.expansions[category];
  }

  /** Gets whether expanded or not */
  getExpanded(category: string): boolean {
    return this.expansions[category] === undefined ? true : this.expansions[category];
  }
}

const routes: Routes = [ {
  path : '',
  component : ComponentSidenav,
  children : [
    {path : '', redirectTo : 'categories', pathMatch : 'full'},
    {path : 'component/:id', redirectTo : ':id', pathMatch : 'full'},
    {path : 'category/:id', redirectTo : '/categories/:id', pathMatch : 'full'},
    {
      path : 'categories',
      children : [
        {path : '', component : ComponentCategoryList},
        {path : ':id', component : ComponentList},
      ],
    },
    {
      path : ':id',
      component : ComponentViewer,
      children : [
        {path : '', redirectTo : 'overview', pathMatch : 'full'},
        {path : 'overview', component : ComponentOverview, pathMatch : 'full'},
        {path : 'api', component : ComponentApi, pathMatch : 'full'},
        {path : 'examples', component : ComponentExamples, pathMatch : 'full'},
        {path : '**', redirectTo : 'overview'},
      ],
    },
  ]
} ];

@NgModule({
  imports: [
    MatSidenavModule,
    MatListModule,
    RouterModule,
    CommonModule,
    ComponentCategoryListModule,
    ComponentHeaderModule,
    ComponentListModule,
    ComponentViewerModule,
    DocViewerModule,
    FooterModule,
    FormsModule,
    HttpClientModule,
    CdkAccordionModule,
    MatIconModule,
    MatSidenavModule,
    StackBlitzButtonModule,
    SvgViewerModule,
    RouterModule.forChild(routes),
    NavigationFocusModule
  ],
  exports: [ComponentSidenav],
  declarations: [ComponentSidenav, ComponentNav],
  providers: [DocumentationItems],
})
export class ComponentSidenavModule {}
