import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {DocumentationItems, DocItem} from '../../shared/documentation-items/documentation-items';
import {ComponentPageTitle} from '../page-title/page-title';
import {MdTabsModule} from '@angular/material';
import {DocViewerModule} from '../../shared/doc-viewer/doc-viewer-module';
import {CommonModule} from '@angular/common';


@Component({
  selector: 'app-component-viewer',
  templateUrl: './component-viewer.html',
  styleUrls: ['./component-viewer.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ComponentViewer {
  componentDocItem: DocItem;

  constructor(private _route: ActivatedRoute,
              public _componentPageTitle: ComponentPageTitle,
              public docItems: DocumentationItems) {
    _route.params.subscribe(p => {
      this.componentDocItem = docItems.getItemById(p['id']);
      this._componentPageTitle.title = `${this.componentDocItem.name}`;
    });
  }
}

@Component({
  selector: 'component-overview',
  templateUrl: './component-overview.html',
  encapsulation: ViewEncapsulation.None,
})
export class ComponentOverview {
  constructor(public componentViewer: ComponentViewer) {}
}

@Component({
  selector: 'component-api',
  templateUrl: './component-api.html',
  encapsulation: ViewEncapsulation.None,
})
export class ComponentApi extends ComponentOverview {}

@Component({
  selector: 'component-examples',
  templateUrl: './component-examples.html',
  encapsulation: ViewEncapsulation.None,
})
export class ComponentExamples extends ComponentOverview {}



@NgModule({
  imports: [MdTabsModule, RouterModule, DocViewerModule, CommonModule],
  exports: [ComponentViewer],
  declarations: [ComponentViewer, ComponentOverview, ComponentApi, ComponentExamples],
  providers: [DocumentationItems, ComponentPageTitle],
})
export class ComponentViewerModule {}
