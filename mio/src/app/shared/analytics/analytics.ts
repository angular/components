import {Injectable} from '@angular/core';

import {environment} from '../../../environments/environment';
import {formatErrorEventForAnalytics} from './format-error';

/** Extension of `Window` with potential Google Analytics fields. */
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?(...args: any[]): void;
    /** Legacy Universal Analytics `analytics.js` field. */
    ga?(...args: any[]): void;
  }
}

/**
 * Google Analytics Service - captures app behaviors and sends them to Google Analytics.
 *
 * Note: Presupposes that the legacy `analytics.js` script has been loaded on the
 * host web page.
 *
 * Associates data with properties determined from the environment configurations:
 *   - Data is uploaded to a legacy Universal Analytics property.
 *   - Data is uploaded to our main Google Analytics 4+ property.
 */
@Injectable({providedIn: 'root'})
export class AnalyticsService {
  private previousUrl: string | undefined;

  constructor() {
    this._installGlobalSiteTag();
    this._installWindowErrorHandler();

    // TODO: Remove this when we fully switch to Google Analytics 4+.
    this._legacyGa('create', environment.legacyUniversalAnalyticsMaterialId, 'auto', 'mat');
    this._legacyGa('create', environment.legacyUniversalAnalyticsMainId, 'auto', 'ng');
    this._legacyGa('set', 'anonymizeIp', true);
  }

  reportError(description: string, fatal = true) {
    // Limit descriptions to maximum of 150 characters.
    // See: https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters#exd.
    description = description.substring(0, 150);

    this._legacyGa('send', 'exception', {exDescription: description, exFatal: fatal});
    this._gtag('event', 'exception', {description: description, fatal});
  }

  locationChanged(url: string) {
    this._sendPage(url);
  }

  private _sendPage(url: string) {
    // Won't re-send if the url hasn't changed.
    if (url === this.previousUrl) {
      return;
    }
    this.previousUrl = url;
    this._legacyGa('mat.set', 'page', url);
    this._legacyGa('ng.set', 'page', url);
    this._legacyGa('mat.send', 'pageview');
    this._legacyGa('ng.send', 'pageview');
  }

  private _legacyGa(...args: any[]) {
    if (window.ga) {
      window.ga(...args);
    }
  }

  private _gtag(...args: any[]) {
    if (window.gtag) {
      window.gtag(...args);
    }
  }

  private _installGlobalSiteTag() {
    const url =
      `https://www.googletagmanager.com/gtag/js?id=${environment.googleAnalyticsMaterialId}`;

    // Note: This cannot be an arrow function as `gtag.js` expects an actual `Arguments`
    // instance with e.g. `callee` to be set. Do not attempt to change this and keep this
    // as much as possible in sync with the tracking code snippet suggested by the Google
    // Analytics 4 web UI under `Data Streams`.
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer?.push(arguments);
    };
    window.gtag('js', new Date());

    // Configure properties before loading the script. This is necessary to avoid
    // loading multiple instances of the gtag JS scripts.
    window.gtag('config', environment.googleAnalyticsOverallDomainId);
    window.gtag('config', environment.googleAnalyticsMaterialId);

    // skip `gtag` for Protractor e2e tests.
    if (window.name.includes('NG_DEFER_BOOTSTRAP')) {
      return;
    }

    const el = window.document.createElement('script');
    el.async = true;
    el.src = url;
    window.document.head.appendChild(el);
  }

  private _installWindowErrorHandler() {
    window.addEventListener('error', event =>
      this.reportError(formatErrorEventForAnalytics(event), true)
    );
  }
}
