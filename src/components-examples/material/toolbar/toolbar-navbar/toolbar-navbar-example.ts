import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';

/**
 * @title Toolbar as a navigation bar
 */
@Component({
  selector: 'toolbar-navbar-example',
  templateUrl: 'toolbar-navbar-example.html',
  styleUrl: 'toolbar-navbar-example.css',
  imports: [MatToolbarModule, MatButtonModule],
})
export class ToolbarNavbarExample {}
