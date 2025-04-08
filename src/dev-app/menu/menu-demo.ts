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
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'menu-demo',
  templateUrl: 'menu-demo.html',
  styleUrl: 'menu-demo.css',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatTooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuDemo {
  selected = '';
  disabledInteractive = false;

  items = [
    {text: 'Refresh'},
    {text: 'Settings'},
    {
      text: 'Help',
      disabled: true,
      tooltipText: 'This is a menu item tooltip!',
    },
    {text: 'Sign Out'},
  ];

  iconItems = [
    {text: 'Redial', icon: 'dialpad'},
    {
      text: 'Check voicemail',
      icon: 'voicemail',
      disabled: true,
    },
    {text: 'Disable alerts', icon: 'notifications_off'},
  ];

  select(text: string) {
    this.selected = text;
  }
}
