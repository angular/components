import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {DocumentationItems, DocItem} from '../../shared/documentation-items/documentation-items';
import {ComponentPageTitle} from '../page-title/page-title';
import {MdTabsModule} from '@angular/material';
import {DocViewerModule} from '../../shared/doc-viewer/doc-viewer-module';
import {CommonModule} from '@angular/common';
import {TableOfContentsModule} from '../../shared/table-of-contents/table-of-contents.module';

@Component({
  selector: 'app-component-viewer',
  templateUrl: './component-viewer.html',
  styleUrls: ['./component-viewer.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ComponentViewer {
  componentDocItem: DocItem;

  constructor(private _route: ActivatedRoute,
              private router: Router,
              public _componentPageTitle: ComponentPageTitle,
              public docItems: DocumentationItems) {
    this._route.params.subscribe(params => {
      this.componentDocItem = docItems.getItemById(params['id']);

      if (this.componentDocItem) {
        this._componentPageTitle.title = `${this.componentDocItem.name}`;
      } else {
        this.router.navigate(['/components']);
      }
    });
  }
}

@Component({
  selector: 'component-overview',
  templateUrl: './component-overview.html',
  styleUrls: ['./component-overview.scss'],
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
  imports: [
    MdTabsModule,
    RouterModule,
    DocViewerModule,
    CommonModule,
    TableOfContentsModule
  ],
  exports: [ComponentViewer],
  declarations: [ComponentViewer, ComponentOverview, ComponentApi, ComponentExamples],
  providers: [DocumentationItems, ComponentPageTitle],
})
export class ComponentViewerModule {}
