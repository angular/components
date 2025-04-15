import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';

/**
 * @title Card overview
 */
@Component({
  selector: 'card-overview-example',
  templateUrl: 'card-overview-example.html',
  styleUrl: 'card-overview-example.css',
  imports: [MatCardModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardOverviewExample {}
