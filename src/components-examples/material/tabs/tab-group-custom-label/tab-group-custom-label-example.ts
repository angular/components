import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';

/**
 * @title Using tabs with a custom label template
 */
@Component({
  selector: 'tab-group-custom-label-example',
  templateUrl: 'tab-group-custom-label-example.html',
  styleUrl: 'tab-group-custom-label-example.css',
  imports: [MatTabsModule, MatIconModule],
})
export class TabGroupCustomLabelExample {}
