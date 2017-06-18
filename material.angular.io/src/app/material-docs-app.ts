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
    router.events.subscribe((data: NavigationStart) => {
      this.showShadow = data.url.startsWith('/components');
      resetScrollPosition();
    });
  }
}

function resetScrollPosition() {
  if (typeof document === 'object' && document) {
    const sidenavContent = document.querySelector('.mat-sidenav-content');
    if (sidenavContent) {
      sidenavContent.scrollTop = 0;
    }
  }
}
