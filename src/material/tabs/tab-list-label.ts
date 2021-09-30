/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ContentChild, Directive, Input} from '@angular/core';
import {mixinDisabled} from '@angular/material/core';

import {MAT_TAB_LABEL, MatTabLabel} from './tab-label';


// Boilerplate for applying mixins to MatTabListLabel.
/** @docs-private */
const _MatTabListLabelMixinBase = mixinDisabled(class {});

/** Directive for passing tab labels to tab list. */
@Directive({
  selector: 'mat-tab-list-label, matTabListLabel',
  inputs: ['disabled'],
})
export class MatTabListLabel extends _MatTabListLabelMixinBase {
  /** Aria label for the tab label. */
  @Input() ariaLabel: string;

  /**
   * Reference to the element that the tab label is labelled by.
   */
  @Input() ariaLabelledby: string;

  /**
   * Returns this label's template label. If a template label is not defined, returns null.
   * Note: the template label can be passed either as input ("templateLabel") or as content (using
   * the "matTabLabel" directive). The input takes precendence over the content.
   */
  get templateLabel(): MatTabLabel|null {
    return this._templateLabelInput || this._templateLabelContent;
  }

  /** Content for the tab label given by `<ng-template mat-tab-label>`. */
  @ContentChild(MAT_TAB_LABEL)
  get _templateLabelContent(): MatTabLabel|null {
    return this._templateLabelContentInternal;
  }
  set _templateLabelContent(value: MatTabLabel|null) {
    this._setTemplateLabelContent(value);
  }
  private _templateLabelContentInternal: MatTabLabel;

  /** Content for tab label passed as input. */
  @Input('templateLabel') _templateLabelInput: MatTabLabel|null;

  /** Plain text label for the tab label, used when there is no template label. */
  @Input() textLabel: string = '';

  /**
   * This has been extracted to a util because of TS 4 and VE.
   * View Engine doesn't support property rename inheritance.
   * TS 4.0 doesn't allow properties to override accessors or vice-versa.
   * @docs-private
   */
  private _setTemplateLabelContent(value: MatTabLabel|null) {
    // Only update the templateLabel via query if there is actually
    // a MatTabLabel found. This works around an issue where a user may have
    // manually set `templateLabel` during creation mode, which would then get clobbered
    // by `undefined` when this query resolves.
    if (value) {
      this._templateLabelContentInternal = value;
    }
  }
}
