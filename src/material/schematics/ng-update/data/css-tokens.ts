/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TargetVersion, VersionChanges} from '@angular/cdk/schematics';

export interface MaterialCssTokenData {
  /** The CSS selector to replace. */
  replace: string;
  /** The new CSS selector. */
  replaceWith: string;
  /**
   * Controls which file types in which this replacement is made. If omitted, it is made in all
   * files.
   */
  replaceIn?: {
    /** Replace this name in stylesheet files. */
    stylesheet?: boolean;
    /** Replace this name in HTML files. */
    html?: boolean;
    /** Replace this name in TypeScript strings. */
    tsStringLiterals?: boolean;
  };
}

export const cssTokens: VersionChanges<MaterialCssTokenData> = {
  [TargetVersion.V18]: [
    {
      pr: 'https://github.com/angular/components/pull/29026',
      changes: [
        {
          replace: '--mdc-form-field-label-text-color',
          replaceWith: '--mat-checkbox-label-text-color',
        },
        {
          replace: '--mdc-form-field-label-text-font',
          replaceWith: '--mat-checkbox-label-text-font',
        },
        {
          replace: '--mdc-form-field-label-text-line-height',
          replaceWith: '--mat-checkbox-label-text-line-height',
        },
        {
          replace: '--mdc-form-field-label-text-size',
          replaceWith: '--mat-checkbox-label-text-size',
        },
        {
          replace: '--mdc-form-field-label-text-tracking',
          replaceWith: '--mat-checkbox-label-text-tracking',
        },
        {
          replace: '--mdc-form-field-label-text-weight',
          replaceWith: '--mat-checkbox-label-text-weight',
        },
      ],
    },
  ],
};
