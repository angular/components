import {Component} from '@angular/core';
import {
  DocumentationItems,
  DocCategory
} from '../../shared/documentation-items/documentation-items';
import {ActivatedRoute} from '@angular/router';
import {ComponentPageTitle} from '../page-title/page-title';

@Component({
  selector: 'app-components',
  templateUrl: './component-list.html',
  styleUrls: ['./component-list.scss']
})
export class ComponentList {
  category: DocCategory;

  constructor(public docItems: DocumentationItems,
              private _componentPageTitle: ComponentPageTitle,
              private _route: ActivatedRoute) {
    _route.params.subscribe(p => {
      this.category = docItems.getCategoryById(p['id']);
      this._componentPageTitle.title = this.category.name;
    });
  }
}
