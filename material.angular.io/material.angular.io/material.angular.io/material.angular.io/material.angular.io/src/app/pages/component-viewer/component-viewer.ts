import {Component, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DocumentationItems, DocItem} from '../../shared/documentation-items/documentation-items';


@Component({
  selector: 'app-components',
  templateUrl: './component-viewer.html',
  styleUrls: ['./component-viewer.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ComponentViewer {
  componentDocItem: DocItem;

  constructor(private _route: ActivatedRoute, public docItems: DocumentationItems) {
    _route.params.subscribe(p => {
      this.componentDocItem = docItems.getItemById(p['id']);
    });
  }
}
