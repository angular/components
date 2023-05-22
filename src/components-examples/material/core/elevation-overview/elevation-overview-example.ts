import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';

/**
 * @title Elevation CSS classes
 */
@Component({
  selector: 'elevation-overview-example',
  styleUrls: ['elevation-overview-example.css'],
  templateUrl: 'elevation-overview-example.html',
  standalone: true,
  imports: [MatButtonModule],
})
export class ElevationOverviewExample {
  isActive = false;
}
