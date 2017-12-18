import {Component, NgModule, OnDestroy, OnInit} from '@angular/core';
import {MatCardModule} from '@angular/material';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Params, RouterModule} from '@angular/router';
import {DocumentationItems, SECTIONS} from '../../shared/documentation-items/documentation-items';
import {ComponentPageTitle} from '../page-title/page-title';
import {SvgViewerModule} from '../../shared/svg-viewer/svg-viewer';
import {Observable} from 'rxjs/Observable';
import {combineLatest} from 'rxjs/observable/combineLatest';
import {Subscription} from 'rxjs/Subscription';


@Component({
  selector: 'app-component-category-list',
  templateUrl: './component-category-list.html',
  styleUrls: ['./component-category-list.scss']
})
export class ComponentCategoryList implements OnInit, OnDestroy {
  params: Observable<Params>;
  routeParamSubscription: Subscription;

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
      this._componentPageTitle.title = SECTIONS[sectionName];
    });
  }

  ngOnDestroy() {
    this.routeParamSubscription.unsubscribe();
  }
}

@NgModule({
  imports: [SvgViewerModule, MatCardModule, CommonModule, RouterModule],
  exports: [ComponentCategoryList],
  declarations: [ComponentCategoryList],
  providers: [DocumentationItems, ComponentPageTitle],
})
export class ComponentCategoryListModule { }
