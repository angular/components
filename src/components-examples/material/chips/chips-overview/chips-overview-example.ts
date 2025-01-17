import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatChipsModule} from '@angular/material/chips';

/**
 * @title Basic chips
 */
@Component({
  selector: 'chips-overview-example',
  templateUrl: 'chips-overview-example.html',
  imports: [MatChipsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipsOverviewExample {}
