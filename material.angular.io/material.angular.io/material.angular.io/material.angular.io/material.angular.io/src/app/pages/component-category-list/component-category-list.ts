import {CommonModule, NgIf, NgFor, AsyncPipe} from '@angular/common';
import {Component, NgModule, OnDestroy, OnInit} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {ActivatedRoute, Params, RouterModule, RouterLink} from '@angular/router';
import {MatRipple} from '@angular/material/core';
import {combineLatest, Observable, Subscription} from 'rxjs';

import {
  DocumentationItems,
  SECTIONS
} from '../../shared/documentation-items/documentation-items';
import {NavigationFocus} from '../../shared/navigation-focus/navigation-focus';

import {ComponentPageTitle} from '../page-title/page-title';

@Component({
  selector: 'app-component-category-list',
  templateUrl: './component-category-list.html',
  styleUrls: ['./component-category-list.scss'],
  standalone: true,
  imports: [NavigationFocus, NgIf, NgFor, RouterLink, AsyncPipe, MatRipple]
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
  imports: [CommonModule, MatCardModule, RouterModule, ComponentCategoryList],
  exports: [ComponentCategoryList],
})
export class ComponentCategoryListModule { }
