/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {A11yModule, LiveAnnouncer} from '@angular/cdk/a11y';
import {ChangeDetectionStrategy, Component, TemplateRef, ViewChild, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'toolbar-demo',
  templateUrl: 'live-announcer-demo.html',
  standalone: true,
  imports: [A11yModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveAnnouncerDemo {
  private _liveAnnouncer = inject(LiveAnnouncer);
  dialog = inject(MatDialog);

  announceText(message: string) {
    this._liveAnnouncer.announce(message);
  }

  @ViewChild(TemplateRef) template: TemplateRef<any>;
  openDialog() {
    this.dialog.open(this.template);
  }
}
