import {Component, ViewEncapsulation} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {filter} from 'rxjs/operators';

import {GaService} from './shared/ga/ga';

@Component({
  selector: 'material-docs-app',
  templateUrl: './material-docs-app.html',
  styleUrls: ['./material-docs-app.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MaterialDocsApp {

  constructor(router: Router, ga: GaService) {
    let previousRoute = router.routerState.snapshot.url;

    router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((data: NavigationEnd) => {
        // We want to reset the scroll position on navigation except when navigating within
        // the documentation for a single component.
        if (!isNavigationWithinComponentView(previousRoute, data.urlAfterRedirects)) {
          resetScrollPosition();
        }

        previousRoute = data.urlAfterRedirects;
        ga.locationChanged(data.urlAfterRedirects);
      });
  }
}

function isNavigationWithinComponentView(previousUrl: string, newUrl: string) {
  const componentViewExpression = /(cdk|components)\/(\w+)/;

  const previousUrlMatch = previousUrl.match(componentViewExpression);
  const newUrlMatch = newUrl.match(componentViewExpression);

  return previousUrl && newUrl && previousUrlMatch && newUrlMatch
      && previousUrlMatch[0] === newUrlMatch[0]
      && previousUrlMatch[1] === newUrlMatch[1];
}

function resetScrollPosition() {
  if (typeof document === 'object' && document) {
    const sidenavContent = document.querySelector('.mat-drawer-content');
    if (sidenavContent) {
      sidenavContent.scrollTop = 0;
    }
  }
}
