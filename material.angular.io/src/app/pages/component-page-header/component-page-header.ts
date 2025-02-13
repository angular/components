import {Component, EventEmitter, Output} from '@angular/core';

import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'component-page-header',
  templateUrl: './component-page-header.html',
  styleUrls: ['./component-page-header.scss'],
  standalone: true,
  imports: [MatButton, MatIcon],
})
export class ComponentPageHeader {
  @Output() toggleSidenav = new EventEmitter<void>();
}
