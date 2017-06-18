import {Component, ViewEncapsulation, ViewChild, OnInit, NgModule} from '@angular/core';
import {DocumentationItems} from '../../shared/documentation-items/documentation-items';
import {MdSidenav, MdSidenavModule} from '@angular/material';
import {Router, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {ComponentHeaderModule} from '../component-page-header/component-page-header';
import {FooterModule} from '../../shared/footer/footer';

const SMALL_WIDTH_BREAKPOINT = 840;

@Component({
  selector: 'app-component-sidenav',
  templateUrl: './component-sidenav.html',
  styleUrls: ['./component-sidenav.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ComponentSidenav implements OnInit {
  constructor(public docItems: DocumentationItems,
              private _router: Router) {}

  @ViewChild(MdSidenav) sidenav: MdSidenav;

  ngOnInit() {
    this._router.events.subscribe(() => {
      if (this.isScreenSmall()) {
        this.sidenav.close();
      }
    });
  }

  isScreenSmall(): boolean {
    return window.matchMedia(`(max-width: ${SMALL_WIDTH_BREAKPOINT}px)`).matches;
  }
}


@NgModule({
  imports: [MdSidenavModule, RouterModule, CommonModule, ComponentHeaderModule, FooterModule],
  exports: [ComponentSidenav],
  declarations: [ComponentSidenav],
  providers: [DocumentationItems],
})
export class ComponentSidenavModule {}
