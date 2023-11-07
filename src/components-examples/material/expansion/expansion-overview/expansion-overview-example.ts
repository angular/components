import {Component} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';

/**
 * @title Basic expansion panel
 */
@Component({
  selector: 'expansion-overview-example',
  templateUrl: 'expansion-overview-example.html',
  standalone: true,
  imports: [MatExpansionModule],
})
export class ExpansionOverviewExample {
  panelOpenState = false;
}
