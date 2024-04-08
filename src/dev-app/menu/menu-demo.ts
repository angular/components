/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatToolbarModule} from '@angular/material/toolbar';

@Component({
  selector: 'menu-demo',
  templateUrl: 'menu-demo.html',
  styleUrl: 'menu-demo.css',
  standalone: true,
  imports: [
    CommonModule,
    MatMenuModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatDividerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuDemo {
  selected = '';
  items = [
    {text: 'Refresh'},
    {text: 'Settings'},
    {text: 'Help', disabled: true},
    {text: 'Sign Out'},
  ];

  iconItems = [
    {text: 'Redial', icon: 'dialpad'},
    {text: 'Check voicemail', icon: 'voicemail', disabled: true},
    {text: 'Disable alerts', icon: 'notifications_off'},
  ];

  select(text: string) {
    this.selected = text;
  }
}
