import {BreakpointObserver} from '@angular/cdk/layout';
import {AsyncPipe} from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Directive,
  NgModule,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  viewChild,
  viewChildren
} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import {ActivatedRoute,
  Params,
  Router,
  RouterModule,
  RouterLinkActive,
  RouterLink,
  RouterOutlet
} from '@angular/router';
import {combineLatest, Observable, ReplaySubject, Subject} from 'rxjs';
import {map, skip, takeUntil} from 'rxjs/operators';
import {DocViewerModule} from '../../shared/doc-viewer/doc-viewer-module';
import {DocItem, DocumentationItems} from '../../shared/documentation-items/documentation-items';
import {TableOfContents} from '../../shared/table-of-contents/table-of-contents';

import {ComponentPageTitle} from '../page-title/page-title';
import {NavigationFocus} from '../../shared/navigation-focus/navigation-focus';
import {DocViewer} from '../../shared/doc-viewer/doc-viewer';
import {ExampleViewer} from '../../shared/example-viewer/example-viewer';


@Component({
  selector: 'app-component-viewer',
  templateUrl: './component-viewer.html',
  styleUrls: ['./component-viewer.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    MatTabsModule,
    NavigationFocus,
    RouterLinkActive,
    RouterLink,
    RouterOutlet,
  ],
})
export class ComponentViewer implements OnDestroy {
  componentDocItem = new ReplaySubject<DocItem>(1);
  sections: Set<string> = new Set(['overview', 'api']);
  private _destroyed = new Subject();

  constructor(_route: ActivatedRoute, private router: Router,
              public _componentPageTitle: ComponentPageTitle,
              public docItems: DocumentationItems) {
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

        if (docItemAndSection.doc.examples && docItemAndSection.doc.examples.length) {
          this.sections.add('examples');
        } else {
          this.sections.delete('examples');
        }
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
  readonly tableOfContents = viewChild.required<TableOfContents>('toc');
  readonly viewers = viewChildren(DocViewer);

  showToc: Observable<boolean>;
  private _destroyed = new Subject();

  constructor(
    public componentViewer: ComponentViewer,
    breakpointObserver: BreakpointObserver,
    private changeDetectorRef: ChangeDetectorRef) {
    this.showToc = breakpointObserver.observe('(max-width: 1200px)')
      .pipe(
        map(result => {
          this.changeDetectorRef.detectChanges();
          return !result.matches;
        })
      );
  }

  ngOnInit() {
    this.componentViewer.componentDocItem.pipe(takeUntil(this._destroyed)).subscribe(() => {
      const tableOfContents = this.tableOfContents();
      if (tableOfContents) {
        tableOfContents.resetHeaders();
      }
    });

    this.showToc.pipe(
      skip(1),
      takeUntil(this._destroyed)
    ).subscribe(() => {
      if (this.tableOfContents()) {
        this.viewers().forEach(viewer => {
          viewer.contentRendered.emit(viewer._elementRef.nativeElement);
        });
      }
    });
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  updateTableOfContents(sectionName: string, docViewerContent: HTMLElement, sectionIndex = 0) {
    const tableOfContents = this.tableOfContents();
    if (tableOfContents) {
      tableOfContents.addHeaders(sectionName, docViewerContent, sectionIndex);
      tableOfContents.updateScrollPosition();
    }
  }
}

@Component({
  selector: 'component-overview',
  templateUrl: './component-overview.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    DocViewer,
    TableOfContents,
    AsyncPipe,
  ],
})
export class ComponentOverview extends ComponentBaseView {
  constructor(
    componentViewer: ComponentViewer,
    breakpointObserver: BreakpointObserver,
    changeDetectorRef: ChangeDetectorRef
  ) {
    super(componentViewer, breakpointObserver, changeDetectorRef);
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
  standalone: true,
  imports: [
    DocViewer,
    TableOfContents,
    AsyncPipe,
  ],
})
export class ComponentApi extends ComponentBaseView {
  constructor(
    componentViewer: ComponentViewer,
    breakpointObserver: BreakpointObserver,
    changeDetectorRef: ChangeDetectorRef
  ) {
    super(componentViewer, breakpointObserver, changeDetectorRef);
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
  standalone: true,
  imports: [
    ExampleViewer,
    AsyncPipe,
  ],
})
export class ComponentExamples extends ComponentBaseView {
  constructor(
    componentViewer: ComponentViewer,
    breakpointObserver: BreakpointObserver,
    changeDetectorRef: ChangeDetectorRef
  ) {
    super(componentViewer, breakpointObserver, changeDetectorRef);
  }
}

@NgModule({
  imports: [
    MatTabsModule,
    RouterModule,
    DocViewerModule,
    ComponentViewer,
    ComponentOverview,
    ComponentApi,
    ComponentExamples,
  ],
  exports: [ComponentViewer],
})
export class ComponentViewerModule {}
