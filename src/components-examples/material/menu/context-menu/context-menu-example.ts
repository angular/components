import {Component} from '@angular/core';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';

/**
 * @title Context menu
 */
@Component({
  selector: 'context-menu-example',
  templateUrl: 'context-menu-example.html',
  styleUrl: './context-menu-example.css',
  imports: [MatMenuModule, MatIconModule],
})
export class ContextMenuExample {}
