import {BreakpointObserver} from '@angular/cdk/layout';
import {CommonModule} from '@angular/common';
import {
  Component,
  ElementRef,
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
    let params = [_route.params];
    if (_route.parent) {
      params.push(_route.parent.params);
    }
    // Listen to changes on the current route for the doc id (e.g. button/checkbox) and the
    // parent route for the section (material/cdk).
    combineLatest(params).pipe(
        map((p: [Params, Params]) => ({id: p[0]['id'], section: p[1]['section']})),
        map(p => ({doc: docItems.getItemById(p.id, p.section), section: p.section}),
        takeUntil(this._destroyed))
        ).subscribe(d => {
          if (d.doc !== undefined) {
            this.componentDocItem.next(d.doc);
            this._componentPageTitle.title = `${d.doc.name}`;
            d.doc.examples && d.doc.examples.length ?
                this.sections.add('examples') :
                this.sections.delete('examples');
          } else {
            this.router.navigate(['/' + d.section]);
          }
        });
  }

  ngOnDestroy(): void {
    this._destroyed.next();
  }
}

/**
 * Base component class for views displaying docs on a particular component (overview, API,
 * examples). Responsible for resetting the focus target on doc item changes and resetting
 * the table of contents headers.
 */
export class ComponentBaseView implements OnInit, OnDestroy {
  @ViewChild('initialFocusTarget', {static: false}) focusTarget: ElementRef;
  @ViewChild('toc', {static: false}) tableOfContents: TableOfContents;

  showToc: Observable<boolean>;

  destroyed = new Subject<void>();

  constructor(public componentViewer: ComponentViewer, breakpointObserver: BreakpointObserver) {
    this.showToc = breakpointObserver.observe('(max-width: 1200px)')
      .pipe(map(result => !result.matches));
  }

  ngOnInit() {
    this.componentViewer.componentDocItem.pipe(takeUntil(this.destroyed)).subscribe(() => {
      // 100ms timeout is used to allow the page to settle before moving focus for screen readers.
      setTimeout(() => this.focusTarget.nativeElement.focus({preventScroll: true}), 100);
      if (this.tableOfContents) {
        this.tableOfContents.resetHeaders();
      }
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
  }

  updateTableOfContents(sectionName: string, docViewerContent: HTMLElement) {
    if (this.tableOfContents) {
      this.tableOfContents.addHeaders(sectionName, docViewerContent);
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
  ],
  exports: [ComponentViewer],
  declarations: [ComponentViewer, ComponentOverview, ComponentApi, ComponentExamples],
  providers: [DocumentationItems, ComponentPageTitle],
})
export class ComponentViewerModule {}
