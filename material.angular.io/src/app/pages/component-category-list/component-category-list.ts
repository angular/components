import {Component} from '@angular/core';
import {DocumentationItems} from '../../shared/documentation-items/documentation-items';
import {ComponentPageTitle} from '../page-title/page-title';


@Component({
  selector: 'app-component-category-list',
  templateUrl: './component-category-list.html',
  styleUrls: ['./component-category-list.scss']
})
export class ComponentCategoryList {
  constructor(public docItems: DocumentationItems,
              private _componentPageTitle: ComponentPageTitle) {}

  ngOnInit() {
    this._componentPageTitle.title = 'Component Library';
  }
}
