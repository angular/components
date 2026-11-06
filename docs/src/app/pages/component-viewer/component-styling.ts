/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {httpResource} from '@angular/common/http';
import {ComponentViewer} from './component-viewer';
import {Token, TokenTable} from './token-table';

interface StyleOverridesData {
  example: string | null;
  themes: {
    name: string;
    overridesMixin: string;
    tokens: Token[];
  }[];
}

/** Token data for packages that don't have any. Only `@angular/material` has token data. */
const NO_TOKEN_DATA: StyleOverridesData = {example: null, themes: []};

@Component({
  selector: 'component-styling',
  templateUrl: './component-styling.html',
  imports: [TokenTable],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ComponentStyling {
  private _componentViewer = inject(ComponentViewer);
  private _domSanitizer = inject(DomSanitizer);
  protected readonly docItem = this._componentViewer.docItem;

  private readonly _tokens = httpResource<StyleOverridesData>(() => {
    const item = this.docItem();
    return item.packageName === 'material'
      ? `/assets/tokens/tokens/${item.id}/${item.id}.json`
      : undefined;
  });

  /** Token data of the doc item. `undefined` while it's loading. */
  protected readonly tokenData = computed(() => {
    if (this.docItem().packageName !== 'material') {
      return NO_TOKEN_DATA;
    }
    return this._tokens.hasValue() ? this._tokens.value() : undefined;
  });

  protected readonly hasTokens = computed(() => {
    const data = this.tokenData();
    return !!data && data.themes.length > 0 && data.themes.some(d => d.tokens.length > 0);
  });

  protected readonly example = computed(() => {
    const example = this.tokenData()?.example;
    return example ? this._domSanitizer.bypassSecurityTrustHtml(example) : null;
  });
}
