/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BreakpointObserver} from '@angular/cdk/layout';
import {AsyncPipe} from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Directive,
  OnInit,
  ViewEncapsulation,
  computed,
  effect,
  input,
  viewChild,
  viewChildren,
  inject,
  DestroyRef,
} from '@angular/core';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {RouterLinkActive, RouterLink, RouterOutlet} from '@angular/router';
import {Observable} from 'rxjs';
import {map, skip} from 'rxjs/operators';
import {DocItem} from '../../shared/documentation-items/documentation-items';
import {TableOfContents} from '../../shared/table-of-contents/table-of-contents';

import {ComponentPageTitle} from '../page-title/page-title';
import {NavigationFocus} from '../../shared/navigation-focus/navigation-focus';
import {DocViewer} from '../../shared/doc-viewer/doc-viewer';
import {ExampleViewer} from '../../shared/example-viewer/example-viewer';
import {MatTabLink, MatTabNav, MatTabNavPanel} from '@angular/material/tabs';

@Component({
  selector: 'app-component-viewer',
  templateUrl: './component-viewer.html',
  styleUrls: ['./component-viewer.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatTabNav,
    MatTabLink,
    MatTabNavPanel,
    NavigationFocus,
    RouterLinkActive,
    RouterLink,
    RouterOutlet,
  ],
})
export class ComponentViewer {
  componentPageTitle = inject(ComponentPageTitle);

  /** Doc item to display. Bound from the route's resolved `docItem`. */
  readonly docItem = input.required<DocItem>();

  readonly componentDocItem: Observable<DocItem> = toObservable(this.docItem);

  /** Tabs shown for the doc item. */
  readonly sections = computed(() => {
    const doc = this.docItem();
    const sections = ['overview', 'api'];

    if (doc.hasStyling) {
      sections.push('styling');
    }

    if (doc.examples && doc.examples.length) {
      sections.push('examples');
    }

    return sections;
  });

  constructor() {
    effect(() => {
      this.componentPageTitle.title = this.docItem().name;
    });
  }
}

/**
 * Base component class for views displaying docs on a particular component (overview, API,
 * examples). Responsible for resetting the focus target on doc item changes and resetting
 * the table of contents headers.
 */
@Directive()
export class ComponentBaseView implements OnInit {
  componentViewer = inject(ComponentViewer);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private readonly _destroyRef = inject(DestroyRef);

  readonly tableOfContents = viewChild<TableOfContents>('toc');
  readonly viewers = viewChildren(DocViewer);

  showToc: Observable<boolean>;

  constructor() {
    const breakpointObserver = inject(BreakpointObserver);

    this.showToc = breakpointObserver.observe('(max-width: 1200px)').pipe(
      map(result => {
        this._changeDetectorRef.detectChanges();
        return !result.matches;
      }),
    );
  }

  ngOnInit() {
    this.componentViewer.componentDocItem
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        const tableOfContents = this.tableOfContents();
        if (tableOfContents) {
          tableOfContents.resetHeaders();
        }
      });

    this.showToc.pipe(skip(1), takeUntilDestroyed(this._destroyRef)).subscribe(() => {
      if (this.tableOfContents()) {
        this.viewers().forEach(viewer => {
          viewer.contentRendered.emit(viewer._elementRef.nativeElement);
        });
      }
    });
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
  imports: [DocViewer, TableOfContents, AsyncPipe],
})
export class ComponentOverview extends ComponentBaseView {
  getOverviewDocumentUrl(doc: DocItem) {
    // Use the explicit overview path if specified. Otherwise, compute an overview path based
    // on the package name and doc item id. Overviews for components are commonly stored in a
    // folder named after the component while the overview file is named similarly. e.g.
    //    `cdk#overlay`     -> `cdk/overlay/overlay.md`
    //    `material#button` -> `material/button/button.md`
    const overviewPath = doc.overviewPath || `${doc.packageName}/${doc.id}/${doc.id}.md.html`;
    return `/docs-content/overviews/${overviewPath}`;
  }
}

@Component({
  selector: 'component-api',
  templateUrl: './component-api.html',
  styleUrls: ['./component-api.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [DocViewer, TableOfContents, AsyncPipe],
})
export class ComponentApi extends ComponentBaseView {
  getApiDocumentUrl(doc: DocItem) {
    const apiDocId = doc.apiDocId || `${doc.packageName}-${doc.id}`;
    return `/docs-content/api-docs/${apiDocId}.html`;
  }
}

@Component({
  selector: 'component-examples',
  templateUrl: './component-examples.html',
  encapsulation: ViewEncapsulation.None,
  imports: [ExampleViewer, AsyncPipe],
})
export class ComponentExamples extends ComponentBaseView {}
