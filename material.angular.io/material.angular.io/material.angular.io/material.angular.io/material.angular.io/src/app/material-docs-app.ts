import {Component, ViewEncapsulation} from '@angular/core';
import {Router, NavigationStart} from '@angular/router';


@Component({
  selector: 'material-docs-app',
  templateUrl: './material-docs-app.html',
  styleUrls: ['./material-docs-app.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MaterialDocsApp {
  showShadow = false;

  constructor(router: Router) {
    let previousRoute = router.routerState.snapshot.url;

    router.events.subscribe((data: NavigationStart) => {
      this.showShadow = data.url.startsWith('/components');

      // We want to reset the scroll position on navigation except when navigating within
      // the documentation for a single component.
      if (!isNavigationWithinComponentView(previousRoute, data.url)) {
        resetScrollPosition();
      }

      previousRoute = data.url;
    });
  }
}

function isNavigationWithinComponentView(oldUrl: string, newUrl: string) {
  const componentViewExpression = /components\/(\w+)/;
  return oldUrl && newUrl
      && componentViewExpression.test(oldUrl)
      && componentViewExpression.test(newUrl)
      && oldUrl.match(componentViewExpression)[1] === newUrl.match(componentViewExpression)[1];
}

function resetScrollPosition() {
  if (typeof document === 'object' && document) {
    const sidenavContent = document.querySelector('.mat-sidenav-content');
    if (sidenavContent) {
      sidenavContent.scrollTop = 0;
    }
  }
}
