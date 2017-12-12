import {Component, NgZone, ViewEncapsulation, ViewChild, OnInit, NgModule} from '@angular/core';
import {DocumentationItems} from '../../shared/documentation-items/documentation-items';
import {MatSidenav, MatSidenavModule} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ActivatedRoute, Params, Router, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {ComponentHeaderModule} from '../component-page-header/component-page-header';
import {FooterModule} from '../../shared/footer/footer';
import {Observable} from 'rxjs/Observable';

const SMALL_WIDTH_BREAKPOINT = 720;

@Component({
  selector: 'app-component-sidenav',
  templateUrl: './component-sidenav.html',
  styleUrls: ['./component-sidenav.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ComponentSidenav implements OnInit {
  private mediaMatcher: MediaQueryList = matchMedia(`(max-width: ${SMALL_WIDTH_BREAKPOINT}px)`);

  params: Observable<Params>;

  constructor(public docItems: DocumentationItems,
              private _route: ActivatedRoute,
              private _router: Router,
              zone: NgZone) {
    // TODO(josephperrott): Move to CDK breakpoint management once available.
    this.mediaMatcher.addListener(mql => zone.run(() => this.mediaMatcher = mql));
  }

  @ViewChild(MatSidenav) sidenav: MatSidenav;

  ngOnInit() {
    this._router.events.subscribe(() => {
      if (this.isScreenSmall()) {
        this.sidenav.close();
      }
    });

    // Combine params from all of the path into a single object.
    this.params = Observable.combineLatest(
      this._route.pathFromRoot.map(route => route.params),
      Object.assign);
  }

  isScreenSmall(): boolean {
    return this.mediaMatcher.matches;
  }
}


@NgModule({
  imports: [
    MatSidenavModule,
    RouterModule,
    CommonModule,
    ComponentHeaderModule,
    FooterModule,
    BrowserAnimationsModule
  ],
  exports: [ComponentSidenav],
  declarations: [ComponentSidenav],
  providers: [DocumentationItems],
})
export class ComponentSidenavModule {}
