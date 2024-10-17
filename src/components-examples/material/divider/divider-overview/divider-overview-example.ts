import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';

/**
 * @title Basic divider
 */
@Component({
  selector: 'divider-overview-example',
  templateUrl: 'divider-overview-example.html',
  imports: [MatListModule, MatDividerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerOverviewExample {}
