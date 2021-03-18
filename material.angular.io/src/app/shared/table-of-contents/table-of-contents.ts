import {
  AfterViewInit, Component, ElementRef, Inject, Input, OnDestroy, OnInit
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
  templateUrl: './table-of-contents.html'
})
export class TableOfContents implements OnInit, AfterViewInit, OnDestroy {
  @Input() container: string | undefined;

  _linkSections: LinkSection[] = [];
  _links: Link[] = [];

  _rootUrl = this._router.url.split('#')[0];
  private _scrollContainer: any;
  private _urlFragment = '';
  private subscriptions = new Subscription();

  constructor(private _router: Router,
              private _route: ActivatedRoute,
              private _element: ElementRef,
              private _navigationFocusService: NavigationFocusService,
              @Inject(DOCUMENT) private _document: Document) {

    this.subscriptions.add(this._navigationFocusService.navigationEndEvents
      .subscribe(() => {
        const rootUrl = _router.url.split('#')[0];
        if (rootUrl !== this._rootUrl) {
          this._rootUrl = rootUrl;
        }
      }));

    this.subscriptions.add(this._route.fragment.subscribe(fragment => {
      this._urlFragment = fragment;

      const target = document.getElementById(this._urlFragment);
      if (target) {
        target.scrollIntoView();
      }
    }));
  }

  ngOnInit(): void {
    // On init, the sidenav content element doesn't yet exist, so it's not possible
    // to subscribe to its scroll event until next tick (when it does exist).
    Promise.resolve().then(() => {
      this._scrollContainer = this.container ?
        this._document.querySelectorAll(this.container)[0] : window;

      if (this._scrollContainer) {
        this.subscriptions.add(fromEvent(this._scrollContainer, 'scroll').pipe(
            debounceTime(10))
            .subscribe(() => this.onScroll()));
      }
    });
  }

  ngAfterViewInit() {
    this.updateScrollPosition();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  updateScrollPosition(): void {
    const target = document.getElementById(this._urlFragment);
    if (target) {
      target.scrollIntoView();
    }
  }

  resetHeaders() {
    this._linkSections = [];
    this._links = [];
  }

  addHeaders(sectionName: string, docViewerContent: HTMLElement, sectionIndex = 0) {
    const headers = Array.from<HTMLHeadingElement>(docViewerContent.querySelectorAll('h3, h4'));
    const links: Link[] = [];
    headers.forEach((header) => {
      // remove the 'link' icon name from the inner text
      const name = header.innerText.trim().replace(/^link/, '');
      const {top} = header.getBoundingClientRect();
      links.push({
        name,
        type: header.tagName.toLowerCase(),
        top: top,
        id: header.id,
        active: false
      });
    });
    this._linkSections[sectionIndex] = {name: sectionName, links};
    this._links.push(...links);
  }

  /** Gets the scroll offset of the scroll container */
  private getScrollOffset(): number | void {
    const {top} = this._element.nativeElement.getBoundingClientRect();
    if (typeof this._scrollContainer.scrollTop !== 'undefined') {
      return this._scrollContainer.scrollTop + top;
    } else if (typeof this._scrollContainer.pageYOffset !== 'undefined') {
      return this._scrollContainer.pageYOffset + top;
    }
  }

  private onScroll(): void {
    for (let i = 0; i < this._links.length; i++) {
      this._links[i].active = this.isLinkActive(this._links[i], this._links[i + 1]);
    }
  }

  private isLinkActive(currentLink: any, nextLink: any): boolean {
    // A link is considered active if the page is scrolled passed the anchor without also
    // being scrolled passed the next link
    const scrollOffset = this.getScrollOffset();
    return scrollOffset >= currentLink.top && !(nextLink && nextLink.top < scrollOffset);
  }

}
