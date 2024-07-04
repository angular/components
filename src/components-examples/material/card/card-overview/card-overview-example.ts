import {Component} from '@angular/core';
import {MatCardModule} from '@angular/material/card';

/**
 * @title Basic cards
 */
@Component({
  selector: 'card-overview-example',
  templateUrl: 'card-overview-example.html',
  standalone: true,
  imports: [MatCardModule],
})
export class CardOverviewExample {}
