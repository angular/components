import {Component} from '@angular/core';
import {DocumentationItems} from '../../shared/documentation-items/documentation-items';

@Component({
  selector: 'app-components',
  templateUrl: './component-list.html',
  styleUrls: ['./component-list.scss']
})
export class ComponentList {
  constructor(public docItems: DocumentationItems) { }
}
