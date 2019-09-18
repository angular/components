import {ComponentPortal, DomPortalHost} from '@angular/cdk/portal';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {DomSanitizer} from '@angular/platform-browser';
import {
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  NgZone,
  OnDestroy,
  Output,
  SecurityContext,
  ViewContainerRef,
} from '@angular/core';
import {Subscription} from 'rxjs';
import {take} from 'rxjs/operators';
import {ExampleViewer} from '../example-viewer/example-viewer';
import {HeaderLink} from './header-link';

@Component({
  selector: 'doc-viewer',
  template: 'Loading document...',
})
export class DocViewer implements OnDestroy {
  private _portalHosts: DomPortalHost[] = [];
  private _documentFetchSubscription: Subscription;

  /** The URL of the document to display. */
  @Input()
  set documentUrl(url: string) {
    this._fetchDocument(url);
  }

  @Output() contentRendered = new EventEmitter<void>();

  /** The document text. It should not be HTML encoded. */
  textContent = '';

  constructor(private _appRef: ApplicationRef,
              private _componentFactoryResolver: ComponentFactoryResolver,
              private _elementRef: ElementRef,
              private _http: HttpClient,
              private _injector: Injector,
              private _viewContainerRef: ViewContainerRef,
              private _ngZone: NgZone,
              private _domSanitizer: DomSanitizer) {
  }

  /** Fetch a document by URL. */
  private _fetchDocument(url: string) {
    // Cancel previous pending request
    if (this._documentFetchSubscription) {
      this._documentFetchSubscription.unsubscribe();
    }

    this._documentFetchSubscription = this._http.get(url, {responseType: 'text'}).subscribe(
      document => this.updateDocument(document),
      error => this.showError(url, error)
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

    // Resolving and creating components dynamically in Angular happens synchronously, but since
    // we want to emit the output if the components are actually rendered completely, we wait
    // until the Angular zone becomes stable.
    this._ngZone.onStable
      .pipe(take(1))
      .subscribe(() => this.contentRendered.next());
  }

  /** Show an error that occurred when fetching a document. */
  private showError(url: string, error: HttpErrorResponse) {
    console.log(error);
    this._elementRef.nativeElement.innerText =
      `Failed to load document: ${url}. Error: ${error.statusText}`;
  }

  /** Instantiate a ExampleViewer for each example. */
  private _loadComponents(componentName: string, componentClass: any) {
    let exampleElements =
        this._elementRef.nativeElement.querySelectorAll(`[${componentName}]`);

    Array.prototype.slice.call(exampleElements).forEach((element: Element) => {
      let example = element.getAttribute(componentName);
      let portalHost = new DomPortalHost(
          element, this._componentFactoryResolver, this._appRef, this._injector);
      let examplePortal = new ComponentPortal(componentClass, this._viewContainerRef);
      let exampleViewer = portalHost.attach(examplePortal);
      if (example !== null) {
        (exampleViewer.instance as ExampleViewer).example = example;
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

    if (this._documentFetchSubscription) {
      this._documentFetchSubscription.unsubscribe();
    }
  }
}
