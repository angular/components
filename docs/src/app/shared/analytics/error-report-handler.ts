/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ErrorHandler, Injectable, inject} from '@angular/core';
import {AnalyticsService} from './analytics';
import {formatErrorForAnalytics} from './format-error';

@Injectable()
export class AnalyticsErrorReportHandler extends ErrorHandler {
  private _analytics = inject(AnalyticsService);

  handleError(error: any): void {
    super.handleError(error);

    // Report the error in Google Analytics.
    if (error instanceof Error) {
      this._analytics.reportError(formatErrorForAnalytics(error));
    } else {
      this._analytics.reportError(error.toString());
    }
  }
}
