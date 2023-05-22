import {Component} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

/**
 * @title Customizing the theme options on the tab group
 */
@Component({
  selector: 'tab-group-theme-example',
  templateUrl: 'tab-group-theme-example.html',
  styleUrls: ['tab-group-theme-example.css'],
  standalone: true,
  imports: [MatButtonToggleModule, MatTabsModule],
})
export class TabGroupThemeExample {}
