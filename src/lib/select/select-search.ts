import { Subject } from 'rxjs/Subject';
import { QueryList } from '@angular/core';
import {
  MatOption,
  MAT_OPTION_PARENT_COMPONENT,
  MatOptionParentComponent
} from '../core/option/option';
import { MatSelect } from './select';
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  Input,
  ElementRef,
  ViewChild,
  OnInit,
  Inject,
  Renderer2,
  EventEmitter,
  Output,
} from '@angular/core';

/** A factory to create a match function to filter the options */
export type FilterMatchFactory = (searchTerms: string) => (label: string) => boolean;

/**
 * Fixed header that will be rendered above a select's options.
 * Can be used as a bar for filtering out options.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-select-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  templateUrl: 'select-search.html',
  host: {
    'class': 'mat-select-search',
  }
})
export class MatSelectSearch {
  /**
   * A regexp to create another regular expression out of any possible string.
   */
  private static readonly _ESCAPE_REGEX = /[\-\[\]{}()*+?.,\\\^$|#\s]/g;

  /**
   * A regexp to find words in a string
   */
  private static readonly _WORD_REGEX = /[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\w]+/g;

  /**
   * Default search function implementation
   * @param searchTerms search string
   */
  static DefaultMatchFactory(searchTerms: string): (label: string) => boolean {
    if (!searchTerms) {
      return () => true;
    }

    // find words
    let words = searchTerms.match(MatSelectSearch._WORD_REGEX);
    if (!words || !words.length) {
      return () => true;
    }

    // escape every word
    let i;
    for (i = 0; i < words.length; i++) {
      words[i] = words[i].replace(MatSelectSearch._ESCAPE_REGEX, '\\$&');
    }
    // add escaped words to our new search regex
    const matcher = new RegExp('^(?=.*' + words.join(')(?=.*') + ')', 'mgi');

    return (l: string) => { const isMatch: boolean = matcher.test(l); return isMatch; };
  }

  /**
   * Input placeholder
   */
  @Input() placeholder: string;

  /**
   * Remote search mode does cause no filter
   */
  @Input() remoteSearch = false;

  /**
   * A factory to create a match function to filter the options
   */
  @Input() filterMatchFactory: FilterMatchFactory = MatSelectSearch.DefaultMatchFactory;

  /**
   * Change event string that is emitted when the search string changes
   */
  @Output() onSearch: EventEmitter<string> = new EventEmitter<string>();

  /**
   * Search input element
   */
  @ViewChild('search') _searchInput: ElementRef;

  /**
   * aria-owns panelId
   */
  get panelId(): string | undefined {
    return this._parent.panelId;
  }

  /**
   * Get focus status
   */
  get focused(): boolean {
    return this._focused;
  }

  /**
   * Observable search
   */
  // get onSearch(): Subject<string> {
  //   return this._onSearch;
  // }

  private _focused = false;

  constructor(
    private _renderer: Renderer2,
    @Inject(MAT_OPTION_PARENT_COMPONENT) private _parent: MatOptionParentComponent
  ) { }

  /**
   * Resets the search string programmatically
   */
  resetSearch(): void {
    this._renderer.setProperty(this._searchInput.nativeElement, 'value', '');
    this._handleInput('');
  }

  _handleInput(value: string): void {
    this.onSearch.next(value || '');
  }

  _handleFocus(value: boolean): void {
    this._focused = value;
  }
}
