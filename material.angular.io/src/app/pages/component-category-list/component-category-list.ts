import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatRipple} from '@angular/material/core';
import {combineLatest, Subscription} from 'rxjs';

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
  standalone: true,
  imports: [NavigationFocus, RouterLink, MatRipple],
})
export class ComponentCategoryList implements OnInit, OnDestroy {
  readonly _docItems = inject(DocumentationItems);
  private _componentPageTitle = inject(ComponentPageTitle);
  private _route = inject(ActivatedRoute);

  items: DocItem[] = [];
  section = '';
  routeParamSubscription: Subscription = new Subscription();
  _categoryListSummary: string | undefined;

  ngOnInit() {
    this.routeParamSubscription = combineLatest(
      this._route.pathFromRoot.map(route => route.params),
      Object.assign,
    ).subscribe(async params => {
      const sectionName = params['section'];
      const section = SECTIONS[sectionName];
      this._componentPageTitle.title = section.name;
      this._categoryListSummary = section.summary;
      this.section = sectionName;
      this.items = await this._docItems.getItems(sectionName);
    });
  }

  ngOnDestroy() {
    if (this.routeParamSubscription) {
      this.routeParamSubscription.unsubscribe();
    }
  }
}
