/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDrawerMode, MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';

@Component({
  selector: 'sidenav-demo',
  templateUrl: 'sidenav-demo.html',
  styleUrl: 'sidenav-demo.css',
  imports: [FormsModule, MatButtonModule, MatCheckboxModule, MatSidenavModule, MatToolbarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavDemo {
  isLaunched = false;
  fillerContent = Array.from({length: 30}, (_, index) => index);
  fixed = false;
  coverHeader = false;
  showHeader = false;
  showFooter = false;
  modeIndex = 0;
  hasBackdrop: boolean;
  get mode(): MatDrawerMode {
    return (['side', 'over', 'push'] as MatDrawerMode[])[this.modeIndex];
  }
  get fixedTop() {
    return this.fixed && this.showHeader && !this.coverHeader ? 64 : 0;
  }
  get fixedBottom() {
    return this.fixed && this.showFooter && !this.coverHeader ? 64 : 0;
  }
}
