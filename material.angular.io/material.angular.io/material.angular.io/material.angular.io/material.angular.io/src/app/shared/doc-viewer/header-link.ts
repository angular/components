import {Component, Input, OnInit} from '@angular/core';
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
    <a
      title="Link to this heading"
      [attr.aria-describedby]="example"
      class="docs-markdown-a"
      aria-label="Link to this heading"
      [href]="url">
      <mat-icon>link</mat-icon>
    </a>
  `
})
export class HeaderLink implements OnInit {

  @Input() example: string;

  url: string;
  private _rootUrl: string;

  constructor(router: Router) {
    this._rootUrl = router.url.split('#')[0];
  }

  ngOnInit(): void {
    this.url = `${this._rootUrl}#${this.example}`;
  }

}
