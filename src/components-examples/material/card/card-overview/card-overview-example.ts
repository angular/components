import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatCardModule} from '@angular/material/card';

/**
 * @title Basic cards
 */
@Component({
  selector: 'card-overview-example',
  templateUrl: 'card-overview-example.html',
  imports: [MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardOverviewExample {}
