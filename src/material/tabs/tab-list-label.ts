/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {mixinDisabled} from '@angular/material/core';

// Boilerplate for applying mixins to MatTabListLabel.
/** @docs-private */
const _MatTabListLabelMixinBase = mixinDisabled(class {});

/** Directive for passing tab labels to tab list. */
@Component({
  selector: 'mat-tab-list-label',
  templateUrl: 'tab-list-label.html',
  inputs: ['disabled'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatTabListLabel extends _MatTabListLabelMixinBase {
  /** Template inside the MatTabListLabel view that contains an `<ng-content>`. */
  @ViewChild(TemplateRef, {static: true}) _template: TemplateRef<void>;

  /** Aria label for the tab label. */
  @Input() ariaLabel: string;

  /**
   * Reference to the element that the tab label is labelled by.
   */
  @Input() ariaLabelledby: string;

  /**
   * Returns this label's template label.
   */
  get templateLabel(): TemplateRef<void> {
    return this._template;
  }
}
