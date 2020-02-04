import {Component, NgModule, OnDestroy, OnInit} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Params, RouterModule} from '@angular/router';
import {DocumentationItems, SECTIONS} from '../../shared/documentation-items/documentation-items';
import {ComponentPageTitle} from '../page-title/page-title';
import {SvgViewerModule} from '../../shared/svg-viewer/svg-viewer';
import {Observable, combineLatest, Subscription} from 'rxjs';


@Component({
  selector: 'app-component-category-list',
  templateUrl: './component-category-list.html',
  styleUrls: ['./component-category-list.scss']
})
export class ComponentCategoryList implements OnInit, OnDestroy {
  params: Observable<Params>;
  routeParamSubscription: Subscription;
  _categoryListSummary: string;

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
  imports: [CommonModule, SvgViewerModule, MatCardModule, RouterModule],
  exports: [ComponentCategoryList],
  declarations: [ComponentCategoryList],
  providers: [DocumentationItems],
})
export class ComponentCategoryListModule { }
