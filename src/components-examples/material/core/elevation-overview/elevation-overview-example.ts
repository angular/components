import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';

/**
 * @title Elevation CSS classes
 */
@Component({
  selector: 'elevation-overview-example',
  styleUrl: 'elevation-overview-example.css',
  templateUrl: 'elevation-overview-example.html',
  imports: [MatButtonModule],
})
export class ElevationOverviewExample {
  isActive = false;
}
