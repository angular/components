import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';

/**
 * @title Using tabs with a custom label template
 */
@Component({
  selector: 'tab-group-custom-label-example',
  templateUrl: 'tab-group-custom-label-example.html',
  styleUrls: ['tab-group-custom-label-example.css'],
  standalone: true,
  imports: [MatTabsModule, MatIconModule],
})
export class TabGroupCustomLabelExample {}
