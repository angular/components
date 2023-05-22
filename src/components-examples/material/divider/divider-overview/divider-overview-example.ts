import {Component} from '@angular/core';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';

/**
 * @title Basic divider
 */
@Component({
  selector: 'divider-overview-example',
  templateUrl: 'divider-overview-example.html',
  standalone: true,
  imports: [MatListModule, MatDividerModule],
})
export class DividerOverviewExample {}
