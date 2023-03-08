import {CommonModule} from '@angular/common';
import {Component, NgModule, OnDestroy, OnInit} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {ActivatedRoute, Params, RouterModule} from '@angular/router';
import {combineLatest, Observable, Subscription} from 'rxjs';

import {
  DocumentationItems,
  SECTIONS
} from '../../shared/documentation-items/documentation-items';
import {
  NavigationFocusModule
} from '../../shared/navigation-focus/navigation-focus';
import {SvgViewerModule} from '../../shared/svg-viewer/svg-viewer';
import {ComponentPageTitle} from '../page-title/page-title';

@Component({
  selector: 'app-component-category-list',
  templateUrl: './component-category-list.html',
  styleUrls: ['./component-category-list.scss']
})
export class ComponentCategoryList implements OnInit, OnDestroy {
  params: Observable<Params> | undefined;
  routeParamSubscription: Subscription = new Subscription();
  _categoryListSummary: string | undefined;

  constructor(public docItems: DocumentationItems,
              public _componentPageTitle: ComponentPageTitle,
              private _route: ActivatedRoute) {}

  ngOnInit() {
    // Combine params from all of the path into a single object.
    this.params = combineLatest(
      this._route.pathFromRoot.map(route => route.params),
      Object.assign);

    // title on topbar navigation
    this.routeParamSubscription = this.params.subscribe(params => {
      const sectionName = params['section'];
      const section = SECTIONS[sectionName];
      this._componentPageTitle.title = section.name;
      this._categoryListSummary = section.summary;
    });
  }

  ngOnDestroy() {
    if (this.routeParamSubscription) {
      this.routeParamSubscription.unsubscribe();
    }
  }
}

@NgModule({
  imports: [CommonModule, SvgViewerModule, MatCardModule, RouterModule, NavigationFocusModule],
  exports: [ComponentCategoryList],
  declarations: [ComponentCategoryList],
  providers: [DocumentationItems],
})
export class ComponentCategoryListModule { }
