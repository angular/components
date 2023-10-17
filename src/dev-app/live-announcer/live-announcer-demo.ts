/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, TemplateRef, ViewChild} from '@angular/core';
import {A11yModule, LiveAnnouncer} from '@angular/cdk/a11y';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'toolbar-demo',
  templateUrl: 'live-announcer-demo.html',
  standalone: true,
  imports: [A11yModule, MatButtonModule],
})
export class LiveAnnouncerDemo {
  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog,
  ) {}

  announceText(message: string) {
    this._liveAnnouncer.announce(message);
  }

  @ViewChild(TemplateRef) template: TemplateRef<any>;
  openDialog() {
    this.dialog.open(this.template);
  }
}
