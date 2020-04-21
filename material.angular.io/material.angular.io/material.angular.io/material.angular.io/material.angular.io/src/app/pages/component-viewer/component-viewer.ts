import {BreakpointObserver} from '@angular/cdk/layout';
import {CommonModule} from '@angular/common';
import {
  Component,
  Directive,
  NgModule,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import {ActivatedRoute, Params, Router, RouterModule} from '@angular/router';
import {combineLatest, Observable, ReplaySubject, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {DocViewerModule} from '../../shared/doc-viewer/doc-viewer-module';
import {DocItem, DocumentationItems} from '../../shared/documentation-items/documentation-items';
import {TableOfContents} from '../../shared/table-of-contents/table-of-contents';
import {TableOfContentsModule} from '../../shared/table-of-contents/table-of-contents.module';
import {ComponentPageTitle} from '../page-title/page-title';
import {NavigationFocusModule} from '../../shared/navigation-focus/navigation-focus';

@Component({
  selector: 'app-component-viewer',
  templateUrl: './component-viewer.html',
  styleUrls: ['./component-viewer.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ComponentViewer implements OnDestroy {
  componentDocItem = new ReplaySubject<DocItem>(1);
  sections: Set<string> = new Set(['overview', 'api']);
  private _destroyed = new Subject();

  constructor(_route: ActivatedRoute,
              private router: Router,
              public _componentPageTitle: ComponentPageTitle,
              public docItems: DocumentationItems,
              ) {
    const routeAndParentParams = [_route.params];
    if (_route.parent) {
      routeAndParentParams.push(_route.parent.params);
    }
    // Listen to changes on the current route for the doc id (e.g. button/checkbox) and the
    // parent route for the section (material/cdk).
    combineLatest(routeAndParentParams).pipe(
      map((params: Params[]) => ({id: params[0]['id'], section: params[1]['section']})),
      map((docIdAndSection: {id: string, section: string}) =>
          ({doc: docItems.getItemById(docIdAndSection.id, docIdAndSection.section),
            section: docIdAndSection.section}), takeUntil(this._destroyed))
    ).subscribe((docItemAndSection: {doc: DocItem | undefined, section: string}) => {
      if (docItemAndSection.doc !== undefined) {
        this.componentDocItem.next(docItemAndSection.doc);
        this._componentPageTitle.title = `${docItemAndSection.doc.name}`;
        docItemAndSection.doc.examples && docItemAndSection.doc.examples.length ?
          this.sections.add('examples') :
          this.sections.delete('examples');
      } else {
        this.router.navigate(['/' + docItemAndSection.section]);
      }
    });
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }
}

/**
 * Base component class for views displaying docs on a particular component (overview, API,
 * examples). Responsible for resetting the focus target on doc item changes and resetting
 * the table of contents headers.
 */
@Directive()
export class ComponentBaseView implements OnInit, OnDestroy {
  @ViewChild('toc') tableOfContents: TableOfContents;

  showToc: Observable<boolean>;

  destroyed = new Subject<void>();

  constructor(public componentViewer: ComponentViewer, breakpointObserver: BreakpointObserver) {
    this.showToc = breakpointObserver.observe('(max-width: 1200px)')
      .pipe(map(result => !result.matches));
  }

  ngOnInit() {
    this.componentViewer.componentDocItem.pipe(takeUntil(this.destroyed)).subscribe(() => {
      if (this.tableOfContents) {
        this.tableOfContents.resetHeaders();
      }
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
  }

  updateTableOfContents(sectionName: string, docViewerContent: HTMLElement, sectionIndex = 0) {
    if (this.tableOfContents) {
      this.tableOfContents.addHeaders(sectionName, docViewerContent, sectionIndex);
      this.tableOfContents.updateScrollPosition();
    }
  }
}

@Component({
  selector: 'component-overview',
  templateUrl: './component-overview.html',
  encapsulation: ViewEncapsulation.None,
})
export class ComponentOverview extends ComponentBaseView {
  constructor(componentViewer: ComponentViewer, breakpointObserver: BreakpointObserver) {
    super(componentViewer, breakpointObserver);
  }

  getOverviewDocumentUrl(doc: DocItem) {
    // Use the explicit overview path if specified. Otherwise, compute an overview path based
    // on the package name and doc item id. Overviews for components are commonly stored in a
    // folder named after the component while the overview file is named similarly. e.g.
    //    `cdk#overlay`     -> `cdk/overlay/overlay.md`
    //    `material#button` -> `material/button/button.md`
    const overviewPath = doc.overviewPath || `${doc.packageName}/${doc.id}/${doc.id}.html`;
    return `/docs-content/overviews/${overviewPath}`;
  }
}

@Component({
  selector: 'component-api',
  templateUrl: './component-api.html',
  styleUrls: ['./component-api.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ComponentApi extends ComponentBaseView {
  constructor(componentViewer: ComponentViewer, breakpointObserver: BreakpointObserver) {
    super(componentViewer, breakpointObserver);
  }

  getApiDocumentUrl(doc: DocItem) {
    const apiDocId = doc.apiDocId || `${doc.packageName}-${doc.id}`;
    return `/docs-content/api-docs/${apiDocId}.html`;
  }
}

@Component({
  selector: 'component-examples',
  templateUrl: './component-examples.html',
  encapsulation: ViewEncapsulation.None,
})
export class ComponentExamples extends ComponentBaseView {
  constructor(componentViewer: ComponentViewer, breakpointObserver: BreakpointObserver) {
    super(componentViewer, breakpointObserver);
  }
}

@NgModule({
  imports: [
    MatTabsModule,
    RouterModule,
    DocViewerModule,
    CommonModule,
    TableOfContentsModule,
    NavigationFocusModule,
  ],
  exports: [ComponentViewer],
  declarations: [ComponentViewer, ComponentOverview, ComponentApi, ComponentExamples],
  providers: [DocumentationItems],
})
export class ComponentViewerModule {}
