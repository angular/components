import {Injectable} from '@angular/core';

import {environment} from '../../../environments/environment';

/**
 * Google Analytics Service - captures app behaviors and sends them to Google Analytics (GA).
 * Presupposes that GA script has been loaded from a script on the host web page.
 * Associates data with a GA "property" from the environment (`gaId`).
 */
@Injectable({providedIn: 'root'})
export class GaService {

  private previousUrl: string;

  constructor() {
    this.ga('create', environment['matGaId'] , 'auto', 'mat');
    this.ga('create', environment['ngGaId'] , 'auto', 'ng');
  }

  locationChanged(url: string) {
    this.sendPage(url);
  }

  sendPage(url: string) {
    // Won't re-send if the url hasn't changed.
    if (url === this.previousUrl || !environment.production) {
      return;
    }
    this.previousUrl = url;
    this.ga('mat.set', 'page', url);
    this.ga('ng.set', 'page', url);
    this.ga('mat.send', 'pageview');
    this.ga('ng.send', 'pageview');
  }

  ga(...args: any[]) {
    const gaFn = (window as any)['ga'];
    if (gaFn) {
      gaFn(...args);
    }
  }
}
