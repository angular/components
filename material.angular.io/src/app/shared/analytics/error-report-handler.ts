import {ErrorHandler, Injectable} from '@angular/core';
import {AnalyticsService} from './analytics';
import {formatErrorForAnalytics} from './format-error';

@Injectable()
export class AnalyticsErrorReportHandler extends ErrorHandler {
  constructor(private _analytics: AnalyticsService) {
    super();
  }

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
