import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';

/**
 * @title Toolbar overview
 */
@Component({
  selector: 'toolbar-overview-example',
  templateUrl: 'toolbar-overview-example.html',
  styleUrl: 'toolbar-overview-example.css',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule],
})
export class ToolbarOverviewExample {}
