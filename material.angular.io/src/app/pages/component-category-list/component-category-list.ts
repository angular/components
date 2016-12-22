import {Component} from '@angular/core';
import {DocumentationItems} from '../../shared/documentation-items/documentation-items';


@Component({
  selector: 'app-component-category-list',
  templateUrl: './component-category-list.html',
  styleUrls: ['./component-category-list.scss']
})
export class ComponentCategoryList {
  constructor(public docItems: DocumentationItems) {}
}
