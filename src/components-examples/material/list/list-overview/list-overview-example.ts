import {Component} from '@angular/core';
import {MatListModule} from '@angular/material/list';

/**
 * @title Basic list
 */
@Component({
  selector: 'list-overview-example',
  templateUrl: 'list-overview-example.html',
  standalone: true,
  imports: [MatListModule],
})
export class ListOverviewExample {}
