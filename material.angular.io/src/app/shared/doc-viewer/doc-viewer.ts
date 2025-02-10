import {
  ComponentType,
  ComponentPortal,
  DomPortalOutlet,
  Portal,
  PortalModule,
} from '@angular/cdk/portal';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {DomSanitizer} from '@angular/platform-browser';
import {
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  ElementRef,
  EventEmitter,
  Injectable,
  Injector,
  Input,
  NgZone,
  OnDestroy,
  Output,
  SecurityContext,
  ViewContainerRef,
  input,
} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {shareReplay, take, tap} from 'rxjs/operators';
import {ExampleViewer} from '../example-viewer/example-viewer';
import {HeaderLink} from './header-link';
import {DeprecatedFieldComponent} from './deprecated-tooltip';
import {ModuleImportCopyButton} from './module-import-copy-button';

@Injectable({providedIn: 'root'})
class DocFetcher {
  private _cache: Record<string, Observable<string>> = {};

  constructor(private _http: HttpClient) {}

  fetchDocument(url: string): Observable<string> {
    if (this._cache[url]) {
      return this._cache[url];
    }

    const stream = this._http.get(url, {responseType: 'text'}).pipe(shareReplay(1));
    return stream.pipe(tap(() => (this._cache[url] = stream)));
  }
}

@Component({
  selector: 'doc-viewer',
  template: `
    @if (portal) {
      <ng-template [cdkPortalOutlet]="portal"></ng-template>
    } @else {
      Loading document...
    }
  `,
  standalone: true,
  imports: [PortalModule],
})
export class DocViewer implements OnDestroy {
  private _portalHosts: DomPortalOutlet[] = [];
  private _documentFetchSubscription: Subscription | undefined;
  protected portal: Portal<any> | undefined;

  readonly name = input<string>();

  /** The document to display, either as a URL to a markdown file or a component to create. */
  @Input()
  set document(document: string | ComponentType<any> | undefined) {
    if (typeof document === 'string') {
      this._fetchDocument(document);
    } else if (document) {
      this.portal = new ComponentPortal(document);

      // Resolving and creating components dynamically in Angular happens synchronously, but since
      // we want to emit the output if the components are actually rendered completely, we wait
      // until the Angular zone becomes stable.
      this._ngZone.onStable
        .pipe(take(1))
        .subscribe(() => this.contentRendered.next(this._elementRef.nativeElement));
    }
  }

  @Output() contentRendered = new EventEmitter<HTMLElement>();

  /** The document text. It should not be HTML encoded. */
  textContent = '';

  private static initExampleViewer(
    exampleViewerComponent: ExampleViewer,
    example: string,
    file: string | null,
    region: string | null,
  ) {
    exampleViewerComponent.example = example;
    if (file) {
      // if the html div has field `file` then it should be in compact view to show the code
      // snippet
      exampleViewerComponent.view = 'snippet';
      exampleViewerComponent.showCompactToggle = true;
      exampleViewerComponent.file = file;
      if (region) {
        // `region` should only exist when `file` exists but not vice versa
        // It is valid for embedded example snippets to show the whole file (esp short files)
        exampleViewerComponent.region = region;
      }
    } else {
      // otherwise it is an embedded demo
      exampleViewerComponent.view = 'demo';
    }
  }

  constructor(
    private _appRef: ApplicationRef,
    public _elementRef: ElementRef,
    private _injector: Injector,
    private _viewContainerRef: ViewContainerRef,
    private _ngZone: NgZone,
    private _domSanitizer: DomSanitizer,
    private _docFetcher: DocFetcher,
  ) {}

  /** Fetch a document by URL. */
  private _fetchDocument(url: string) {
    this._documentFetchSubscription?.unsubscribe();
    this._documentFetchSubscription = this._docFetcher.fetchDocument(url).subscribe(
      document => this.updateDocument(document),
      error => this.showError(url, error),
    );
  }

  /**
   * Updates the displayed document.
   * @param rawDocument The raw document content to show.
   */
  private updateDocument(rawDocument: string) {
    // Replace all relative fragment URLs with absolute fragment URLs. e.g. "#my-section" becomes
    // "/components/button/api#my-section". This is necessary because otherwise these fragment
    // links would redirect to "/#my-section".
    rawDocument = rawDocument.replace(/href="#([^"]*)"/g, (_m: string, fragmentUrl: string) => {
      const absoluteUrl = `${location.pathname}#${fragmentUrl}`;
      return `href="${this._domSanitizer.sanitize(SecurityContext.URL, absoluteUrl)}"`;
    });
    this._elementRef.nativeElement.innerHTML = rawDocument;
    this.textContent = this._elementRef.nativeElement.textContent;
    this._loadComponents('material-docs-example', ExampleViewer);
    this._loadComponents('header-link', HeaderLink);

    // Create tooltips for the deprecated fields
    this._createTooltipsForDeprecated();

    // Create icon buttons to copy module import
    this._createCopyIconForModule();

    // Resolving and creating components dynamically in Angular happens synchronously, but since
    // we want to emit the output if the components are actually rendered completely, we wait
    // until the Angular zone becomes stable.
    this._ngZone.onStable
      .pipe(take(1))
      .subscribe(() => this.contentRendered.next(this._elementRef.nativeElement));
  }

  /** Show an error that occurred when fetching a document. */
  private showError(url: string, error: HttpErrorResponse) {
    console.error(error);
    this._elementRef.nativeElement.innerText = `Failed to load document: ${url}. Error: ${error.statusText}`;
  }

  /** Instantiate a ExampleViewer for each example. */
  private _loadComponents(componentName: string, componentClass: any) {
    const exampleElements = this._elementRef.nativeElement.querySelectorAll(`[${componentName}]`);

    [...exampleElements].forEach((element: Element) => {
      const example = element.getAttribute(componentName);
      const region = element.getAttribute('region');
      const file = element.getAttribute('file');
      const portalHost = new DomPortalOutlet(element, this._appRef, this._injector);
      const examplePortal = new ComponentPortal(componentClass, this._viewContainerRef);
      const exampleViewer = portalHost.attach(examplePortal);
      const exampleViewerComponent = exampleViewer.instance as ExampleViewer;
      if (example !== null) {
        DocViewer.initExampleViewer(exampleViewerComponent, example, file, region);
      }
      this._portalHosts.push(portalHost);
    });
  }

  private _clearLiveExamples() {
    this._portalHosts.forEach(h => h.dispose());
    this._portalHosts = [];
  }

  ngOnDestroy() {
    this._clearLiveExamples();
    this._documentFetchSubscription?.unsubscribe();
  }

  _createTooltipsForDeprecated() {
    // all of the deprecated symbols end with `deprecated-marker`
    // class name on their element.
    // for example:
    // <div class="docs-api-deprecated-marker">Deprecated</div>,
    // these can vary for each deprecated symbols such for class, interface,
    // type alias, constants or properties:
    // .docs-api-class-interface-marker, docs-api-type-alias-deprecated-marker
    // .docs-api-constant-deprecated-marker, .some-more
    // so instead of manually writing each deprecated class, we just query
    // elements that ends with `deprecated-marker` in their class name.
    const deprecatedElements = this._elementRef.nativeElement.querySelectorAll(
      `[class$=deprecated-marker]`,
    );

    [...deprecatedElements].forEach((element: Element) => {
      // the deprecation message, it will include alternative to deprecated item
      // and breaking change if there is one included.
      const deprecationTitle = element.getAttribute('deprecated-message');

      const elementPortalOutlet = new DomPortalOutlet(element, this._appRef, this._injector);

      const tooltipPortal = new ComponentPortal(DeprecatedFieldComponent, this._viewContainerRef);
      const tooltipOutlet = elementPortalOutlet.attach(tooltipPortal);

      if (deprecationTitle) {
        tooltipOutlet.instance.message = deprecationTitle;
      }

      this._portalHosts.push(elementPortalOutlet);
    });
  }

  _createCopyIconForModule() {
    // every module import element will be marked with docs-api-module-import-button attribute
    const moduleImportElements = this._elementRef.nativeElement.querySelectorAll(
      '[data-docs-api-module-import-button]',
    );

    [...moduleImportElements].forEach((element: HTMLElement) => {
      // get the module import path stored in the attribute
      const moduleImport = element.getAttribute('data-docs-api-module-import-button');

      const elementPortalOutlet = new DomPortalOutlet(element, this._appRef, this._injector);

      const moduleImportPortal = new ComponentPortal(
        ModuleImportCopyButton,
        this._viewContainerRef,
      );
      const moduleImportOutlet = elementPortalOutlet.attach(moduleImportPortal);

      if (moduleImport) {
        moduleImportOutlet.instance.import = moduleImport;
      }

      this._portalHosts.push(elementPortalOutlet);
    });
  }
}
