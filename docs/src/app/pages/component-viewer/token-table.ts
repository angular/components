/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, input, signal} from '@angular/core';
import {TitleCasePipe} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {TokenName} from './token-name';

type TokenType = 'base' | 'color' | 'typography' | 'density';

export interface Token {
  name: string;
  overridesName: string;
  prefix: string;
  type: TokenType;
  derivedFrom?: string;
}

@Component({
  selector: 'token-table',
  templateUrl: './token-table.html',
  styleUrl: './token-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    TokenName,
    TitleCasePipe,
  ],
})
export class TokenTable {
  tokens = input.required<Token[]>();

  protected nameFilter = signal('');
  protected typeFilter = signal<TokenType | null>(null);
  protected types: TokenType[] = ['base', 'color', 'typography', 'density'];
  protected filteredTokens = computed(() => {
    const name = this.nameFilter().trim().toLowerCase();
    const typeFilter = this.typeFilter();

    return this.tokens().filter(
      token =>
        (!name || token.overridesName.toLowerCase().includes(name)) &&
        (!typeFilter || token.type === typeFilter),
    );
  });

  protected reset() {
    this.nameFilter.set('');
    this.typeFilter.set(null);
  }
}
