/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {CdkTreeNodePadding} from '@angular/cdk/tree';
import {Directive, Input, numberAttribute} from '@angular/core';

/**
 * Wrapper for the CdkTree padding with Material design styles.
 */
@Directive({
  selector: '[matTreeNodePadding]',
  providers: [{provide: CdkTreeNodePadding, useExisting: MatTreeNodePadding}],
})
export class MatTreeNodePadding<T, K = T> extends CdkTreeNodePadding<T, K> {
  /** The level of depth of the tree node. The padding will be `level * indent` pixels. */
  @Input({alias: 'matTreeNodePadding', transform: numberAttribute})
  override get level(): number {
    return this._level;
  }
  override set level(value: number) {
    this._setLevelInput(value);
  }

  /** The indent for each level. Default number 40px from material design menu sub-menu spec. */
  @Input('matTreeNodePaddingIndent')
  override get indent(): number | string {
    return this._indent;
  }
  override set indent(indent: number | string) {
    this._setIndentInput(indent);
  }
}
