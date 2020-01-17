import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';

/**
 * Header link is a component that handles normalizing
 * the anchor jump tags with the current route url.
 *
 * For example:
 *
 *    <a href="#foo">Foo</a>
 *
 * would result in the wrong url, this component
 * combines the current route with that jump link:
 *
 *    <a href="/guide#foo">Foo</a>
 */
@Component({
  selector: 'header-link',
  template: `
    <a aria-label="Link to this heading" class="docs-markdown-a"
      [attr.aria-describedby]="example" [href]="_getFragmentUrl()">
      <mat-icon>link</mat-icon>
    </a>
  `
})
export class HeaderLink {

  /**
   * Id of the anchor element. Note that is uses "example" because we instantiate the
   * header link components through the ComponentPortal.
   */
  @Input() example: string;

  /** Base URL that is used to build an absolute fragment URL. */
  private _baseUrl: string;

  constructor(router: Router) {
    this._baseUrl = router.url.split('#')[0];
  }

  _getFragmentUrl(): string {
    return `${this._baseUrl}#${this.example}`;
  }

}
