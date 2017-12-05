import {
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  ViewContainerRef,
  Output,
} from '@angular/core';
import {Http} from '@angular/http';
import {Subscription} from 'rxjs/Subscription';
import {ExampleViewer} from '../example-viewer/example-viewer';
import {HeaderLink} from './header-link';
import {ComponentPortal, DomPortalHost} from '@angular/cdk/portal';
import {Router} from '@angular/router';

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

  @Output() contentLoaded = new EventEmitter<void>();

  /** The document text. It should not be HTML encoded. */
  textContent = '';

  constructor(private _appRef: ApplicationRef,
              private _componentFactoryResolver: ComponentFactoryResolver,
              private _elementRef: ElementRef,
              private _http: Http,
              private _injector: Injector,
              private _viewContainerRef: ViewContainerRef,
              private _router: Router) {}

  /** Fetch a document by URL. */
  private _fetchDocument(url: string) {
    // Cancel previous pending request
    if (this._documentFetchSubscription) {
      this._documentFetchSubscription.unsubscribe();
    }

    this._documentFetchSubscription = this._http.get(url).subscribe(
        response => {
          // TODO(mmalerba): Trust HTML.
          if (response.ok) {
            this._elementRef.nativeElement.innerHTML = response.text();
            this.textContent = this._elementRef.nativeElement.textContent;
            this._loadComponents('material-docs-example', ExampleViewer);
            this._loadComponents('header-link', HeaderLink);
            this._fixFragmentUrls();
            this.contentLoaded.next();
          } else {
            this._elementRef.nativeElement.innerText =
              `Failed to load document: ${url}. Error: ${response.status}`;
          }
        },
        error => {
          this._elementRef.nativeElement.innerText =
              `Failed to load document: ${url}. Error: ${error}`;
        });
  }

  releadLiveExamples() {
    // When the example viewer is dynamically loaded inside of md-tabs, they somehow end up in
    // the wrong place in the DOM after switching tabs. This function is a workaround to
    // put the live examples back in the right place.
    this._clearLiveExamples();
    this._loadComponents('material-docs-example', ExampleViewer);
    this._loadComponents('header-link', HeaderLink);
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
      (exampleViewer.instance as ExampleViewer).example = example;

      this._portalHosts.push(portalHost);
    });
  }

  private _clearLiveExamples() {
    this._portalHosts.forEach(h => h.dispose());
    this._portalHosts = [];
  }

  /**
   * A fragment link is a link that references a specific element on the page that should be
   * scrolled into the viewport on page load or click.
   *
   * By default those links refer to the root page of the documentation and the fragment links
   * won't work properly. Those links need to be updated to be relative to the current base URL.
   */
  private _fixFragmentUrls() {
    const baseUrl = this._router.url.split('#')[0];
    const anchorElements =
      [].slice.call(this._elementRef.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];

    anchorElements
      .filter(anchorEl => anchorEl.hash)
      .forEach(anchorEl => anchorEl.href = `${baseUrl}${anchorEl.hash}`);
  }

  ngOnDestroy() {
    this._clearLiveExamples();

    if (this._documentFetchSubscription) {
      this._documentFetchSubscription.unsubscribe();
    }
  }
}
