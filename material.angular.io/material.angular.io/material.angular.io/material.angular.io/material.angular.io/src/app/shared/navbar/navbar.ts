import {Component, NgModule, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {RouterModule, Event, NavigationEnd, Router} from '@angular/router';
import {ThemePickerModule} from '../theme-picker';
import {VersionPickerModule} from '../version-picker';
import {SECTIONS} from '../documentation-items/documentation-items';
import {ThemeStorage} from '../theme-picker/theme-storage/theme-storage';
import {StyleManager} from '../style-manager';
import {HttpClientModule} from '@angular/common/http';
import {filter} from 'rxjs/operators';
import {Subscription} from 'rxjs';

const SECTIONS_KEYS = Object.keys(SECTIONS);

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavBar implements OnDestroy {
  private subscriptions = new Subscription();
  isNextVersion = location.hostname.startsWith('next.material.angular.io');
  skipLinkHref: string;
  skipLinkHidden = true;

  constructor(router: Router) {
    this.subscriptions.add(router.events
      .pipe(filter((event: Event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const baseUrl = router.url.split('#')[0];
        this.skipLinkHref = `${baseUrl}#main-content`;
      }));
  }

  get sections() {
    return SECTIONS;
  }

  get sectionKeys() {
    return SECTIONS_KEYS;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    MatButtonModule,
    MatMenuModule,
    RouterModule,
    ThemePickerModule,
    VersionPickerModule,
  ],
  exports: [NavBar],
  declarations: [NavBar],
  providers: [StyleManager, ThemeStorage]
})
export class NavBarModule {}
