/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, input, signal} from '@angular/core';
import {TitleCasePipe} from '@angular/common';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatTooltip} from '@angular/material/tooltip';
import {TokenName} from './token-name';

type TokenType = 'base' | 'color' | 'typography' | 'density';

export interface Token {
  name: string;
  overridesName: string;
  prefix: string;
  type: TokenType;
  derivedFrom?: string;
  value: string | number | null;
}

@Component({
  selector: 'token-table',
  templateUrl: './token-table.html',
  styleUrl: './token-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButton,
    MatIconButton,
    MatFormField,
    MatLabel,
    MatSuffix,
    MatIcon,
    MatInput,
    MatSelect,
    MatOption,
    MatTooltip,
    TokenName,
    TitleCasePipe,
  ],
})
export class TokenTable {
  readonly tokens = input.required<Token[]>();

  protected readonly nameFilter = signal('');
  protected readonly typeFilter = signal<TokenType | null>(null);
  protected readonly defaultValueFilter = signal('');
  protected readonly types: TokenType[] = ['base', 'color', 'typography', 'density'];
  protected readonly filteredTokens = computed(() => {
    const name = this.nameFilter().trim().toLowerCase();
    const typeFilter = this.typeFilter();
    const defaultValueFilter = this.defaultValueFilter();

    return this.tokens().filter(
      token =>
        (!name || token.overridesName.toLowerCase().includes(name)) &&
        (!typeFilter || token.type === typeFilter) &&
        (!defaultValueFilter || token.value?.toString().toLowerCase().includes(defaultValueFilter)),
    );
  });

  protected reset() {
    this.nameFilter.set('');
    this.typeFilter.set(null);
    this.defaultValueFilter.set('');
  }
}
