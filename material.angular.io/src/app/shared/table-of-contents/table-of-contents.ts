import {Component, Input, Inject, ElementRef, OnInit} from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';

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
export class TableOfContents implements OnInit {

  @Input() links: Link[] = [];
  @Input() container: string;
  @Input() headerSelectors = '.docs-markdown-h3,.docs-markdown-h4';

  _rootUrl: string;
  private _scrollContainer: any;
  private _scrollSubscription: Subscription;
  private _routeSubscription: Subscription;
  private _fragmentSubscription: Subscription;
  private _urlFragment = '';

  constructor(private _router: Router,
              private _route: ActivatedRoute,
              private _element: ElementRef,
              @Inject(DOCUMENT) private _document: Document) {

    this._routeSubscription = this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const rootUrl = _router.url.split('#')[0];
        if (rootUrl !== this._rootUrl) {
          this.links = this.createLinks();
          this._rootUrl = rootUrl;
        }
      }
    });

    this._fragmentSubscription = this._route.fragment.subscribe(fragment => {
      this._urlFragment = fragment;

      const target = document.getElementById(this._urlFragment);
      if (target) {
        target.scrollIntoView();
      }
    });
  }

  ngOnInit(): void {
    this._scrollContainer = this.container ?
      this._document.querySelectorAll(this.container)[0] : window;

    this._scrollSubscription = Observable
      .fromEvent(this._scrollContainer, 'scroll')
      .debounceTime(10)
      .subscribe(() => this.onScroll());
  }

  ngOnDestroy(): void {
    this._routeSubscription.unsubscribe();
    this._scrollSubscription.unsubscribe();
    this._fragmentSubscription.unsubscribe();
  }

  updateScrollPosition(): void {
    this.links = this.createLinks();

    const target = document.getElementById(this._urlFragment);
    if (target) {
      target.scrollIntoView();
    }
  }

  /** Gets the scroll offset of the scroll container */
  private getScrollOffset(): number {
    const {top} = this._element.nativeElement.getBoundingClientRect();
    if (typeof this._scrollContainer.scrollTop !== 'undefined') {
      return this._scrollContainer.scrollTop + top;
    } else if (typeof this._scrollContainer.pageYOffset !== 'undefined') {
      return this._scrollContainer.pageYOffset + top;
    }
  }

  private createLinks(): Link[] {
    const links = [];
    const headers =
        Array.from(this._document.querySelectorAll(this.headerSelectors)) as HTMLElement[];

    if (headers.length) {
      for (const header of headers) {
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
      }
    }

    return links;
  }

  private onScroll(): void {
    for (let i = 0; i < this.links.length; i++) {
      this.links[i].active = this.isLinkActive(this.links[i], this.links[i + 1]);
    }
  }

  private isLinkActive(currentLink: any, nextLink: any): boolean {
    // A link is considered active if the page is scrolled passed the anchor without also
    // being scrolled passed the next link
    const scrollOffset = this.getScrollOffset();
    return scrollOffset >= currentLink.top && !(nextLink && nextLink.top < scrollOffset);
  }

}
