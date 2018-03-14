import {CommonModule} from '@angular/common';
import {Component, ElementRef, NgModule, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatTabsModule} from '@angular/material';
import {ActivatedRoute, Params, Router, RouterModule} from '@angular/router';
import {DocViewerModule} from '../../shared/doc-viewer/doc-viewer-module';
import {DocItem, DocumentationItems} from '../../shared/documentation-items/documentation-items';
import {TableOfContentsModule} from '../../shared/table-of-contents/table-of-contents.module';
import {ComponentPageTitle} from '../page-title/page-title';
import {combineLatest} from 'rxjs/observable/combineLatest';
import {map} from 'rxjs/operators/map';

@Component({
  selector: 'app-component-viewer',
  templateUrl: './component-viewer.html',
  styleUrls: ['./component-viewer.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ComponentViewer {
  componentDocItem: DocItem;

  sections: Set<string> = new Set(['overview', 'api']);

  constructor(private _route: ActivatedRoute,
              private router: Router,
              public _componentPageTitle: ComponentPageTitle,
              public docItems: DocumentationItems) {
    // Listen to changes on the current route for the doc id (e.g. button/checkbox) and the
    // parent route for the section (material/cdk).
    combineLatest(_route.params, _route.parent.params).pipe(
        map((p: [Params, Params]) => ({id: p[0]['id'], section: p[1]['section']})),
        map(p => ({doc: docItems.getItemById(p.id, p.section), section: p.section}))
        ).subscribe(d => {
          this.componentDocItem = d.doc;
          if (this.componentDocItem) {
            this._componentPageTitle.title = `${this.componentDocItem.name}`;
            this.componentDocItem.examples.length ?
                this.sections.add('examples') :
                this.sections.delete('examples');
          } else {
            this.router.navigate(['/' + d.section]);
          }
        });
  }
}

@Component({
  selector: 'component-overview',
  templateUrl: './component-overview.html',
  encapsulation: ViewEncapsulation.None,
})
export class ComponentOverview implements OnInit {
  @ViewChild('intialFocusTarget') focusTarget: ElementRef;

  constructor(public componentViewer: ComponentViewer) {}

  ngOnInit() {
    // 100ms timeout is used to allow the page to settle before moving focus for screen readers.
    setTimeout(() => this.focusTarget.nativeElement.focus(), 100);
  }
}

@Component({
  selector: 'component-api',
  templateUrl: './component-api.html',
  styleUrls: ['./component-api.scss'],
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
    MatTabsModule,
    RouterModule,
    DocViewerModule,
    CommonModule,
    TableOfContentsModule,
  ],
  exports: [ComponentViewer],
  declarations: [ComponentViewer, ComponentOverview, ComponentApi, ComponentExamples],
  providers: [DocumentationItems, ComponentPageTitle],
})
export class ComponentViewerModule {}
