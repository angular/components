import {Component, EventEmitter, Output} from '@angular/core';
import {ComponentPageTitle} from '../page-title/page-title';

import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'component-page-header',
  templateUrl: './component-page-header.html',
  styleUrls: ['./component-page-header.scss'],
  standalone: true,
  imports: [MatButtonModule, MatIconModule]
})
export class ComponentPageHeader {
  constructor(public _componentPageTitle: ComponentPageTitle) {}

  @Output() toggleSidenav = new EventEmitter<void>();

  getTitle() {
    return this._componentPageTitle.title;
  }
}
