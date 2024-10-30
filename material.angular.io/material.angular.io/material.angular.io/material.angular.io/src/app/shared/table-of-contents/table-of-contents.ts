import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  NgZone,
  ChangeDetectorRef,
  input
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {fromEvent, Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {NavigationFocusService} from '../navigation-focus/navigation-focus.service';

interface LinkSection {
  name: string;
  links: Link[];
}

interface Link {
  /* id of the section*/
  id: string;

  /* header type h3/h4 */
  type: string;

  /* If the anchor is in view of the page */
  active: boolean;

  /* name of the anchor */
  name: string;

  /* top offset px of the anchor */
  top: number;
}

@Component({
  selector: 'table-of-contents',
  styleUrls: ['./table-of-contents.scss'],
  templateUrl: './table-of-contents.html',
  standalone: true
})
export class TableOfContents implements OnInit, AfterViewInit, OnDestroy {
  readonly container = input<string>();

  _linkSections: LinkSection[] = [];
  _links: Link[] = [];
  _rootUrl = this._router.url.split('#')[0];

  private _scrollContainer: HTMLElement | Window | null = null;
  private _urlFragment = '';
  private subscriptions = new Subscription();

  constructor(private _router: Router,
              private _route: ActivatedRoute,
              private _element: ElementRef,
              private _navigationFocusService: NavigationFocusService,
              @Inject(DOCUMENT) private _document: Document,
              private _ngZone: NgZone,
              private _changeDetectorRef: ChangeDetectorRef) {

    this.subscriptions.add(this._navigationFocusService.navigationEndEvents
      .subscribe(() => {
        const rootUrl = _router.url.split('#')[0];
        if (rootUrl !== this._rootUrl) {
          this._rootUrl = rootUrl;
        }
      }));

    this.subscriptions.add(this._route.fragment.subscribe(fragment => {
      if (fragment != null) {
        this._urlFragment = fragment;

        const target = document.getElementById(this._urlFragment);
        if (target) {
          target.scrollIntoView();
        }
      }
    }));
  }

  ngOnInit(): void {
    // On init, the sidenav content element doesn't yet exist, so it's not possible
    // to subscribe to its scroll event until next tick (when it does exist).
    this._ngZone.runOutsideAngular(() => {
      Promise.resolve().then(() => {
        const container = this.container();
        this._scrollContainer = container ?
          this._document.querySelector(container) as HTMLElement :
          window;

        if (this._scrollContainer) {
          this.subscriptions.add(fromEvent(this._scrollContainer, 'scroll').pipe(
              debounceTime(10))
              .subscribe(() => this.onScroll()));
        }
      });
    });
  }

  ngAfterViewInit() {
    this.updateScrollPosition();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  updateScrollPosition(): void {
    this._document.getElementById(this._urlFragment)?.scrollIntoView();
  }

  resetHeaders() {
    this._linkSections = [];
    this._links = [];
  }

  addHeaders(sectionName: string, docViewerContent: HTMLElement, sectionIndex = 0) {
    const links = Array.from(docViewerContent.querySelectorAll('h2, h3, h4'), header => {
      // remove the 'link' icon name from the inner text
      const name = (header as HTMLElement).innerText.trim().replace(/^link/, '');
      const {top} = header.getBoundingClientRect();
      return {
        name,
        type: header.tagName.toLowerCase(),
        top: top,
        id: header.id,
        active: false
      };
    });

    this._linkSections[sectionIndex] = {name: sectionName, links};
    this._links.push(...links);
  }

  /** Gets the scroll offset of the scroll container */
  private getScrollOffset(): number | void {
    const {top} = this._element.nativeElement.getBoundingClientRect();
    const container = this._scrollContainer;

    if (container instanceof HTMLElement) {
      return container.scrollTop + top;
    }

    if (container) {
      return container.pageYOffset + top;
    }
  }

  private onScroll(): void {
    const scrollOffset = this.getScrollOffset();
    let hasChanged = false;

    if (scrollOffset == null) {
      return;
    }

    for (let i = 0; i < this._links.length; i++) {
      // A link is considered active if the page is scrolled past the
      // anchor without also being scrolled passed the next link.
      const currentLink = this._links[i];
      const nextLink = this._links[i + 1];
      const isActive = scrollOffset >= currentLink.top &&
                       (!nextLink || nextLink.top >= scrollOffset);

      if (isActive !== currentLink.active) {
        currentLink.active = isActive;
        hasChanged = true;
      }
    }

    if (hasChanged) {
      // The scroll listener runs outside of the Angular zone so
      // we need to bring it back in only when something has changed.
      this._ngZone.run(() => this._changeDetectorRef.markForCheck());
    }
  }
}
