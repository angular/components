import {ChangeDetectionStrategy, Component, computed, input, signal} from '@angular/core';
import {TitleCasePipe} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
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
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TokenName,
    TitleCasePipe,
  ]
})
export class TokenTable {
  tokens = input.required<Token[]>();

  protected nameFilter = signal('');
  protected typeFilter = signal<TokenType | null>(null);
  protected types: TokenType[] = ['base', 'color', 'typography', 'density'];
  protected filteredTokens = computed(() => {
    const name = this.nameFilter().trim();
    const typeFilter = this.typeFilter();

    return this.tokens().filter(token =>
      (!name || token.overridesName.includes(name)) &&
      (!typeFilter || token.type === typeFilter));
  });

  protected reset() {
    this.nameFilter.set('');
    this.typeFilter.set(null);
  }
}
