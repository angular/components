/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'mdc-menu-demo',
  templateUrl: 'mdc-menu-demo.html',
  styleUrls: ['mdc-menu-demo.css'],
})
export class MdcMenuDemo {
  selected = '';
  items = [
    {text: 'Refresh', disabled: false},
    {text: 'Settings', disabled: false},
    {text: 'Help', disabled: true},
    {text: 'Sign Out', disabled: false}
  ];

  iconItems = [
    {text: 'Redial', icon: 'dialpad', disabled: false},
    {text: 'Check voicemail', icon: 'voicemail', disabled: true},
    {text: 'Disable alerts', icon: 'notifications_off', disabled: false}
  ];

  select(text: string) { this.selected = text; }
}
