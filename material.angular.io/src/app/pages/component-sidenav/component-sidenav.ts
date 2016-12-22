import {Component, ViewEncapsulation} from '@angular/core';
import {DocumentationItems} from '../../shared/documentation-items/documentation-items';


@Component({
  selector: 'app-component-sidenav',
  templateUrl: './component-sidenav.html',
  styleUrls: ['./component-sidenav.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ComponentSidenav {
  constructor(public docItems: DocumentationItems) {}
}
