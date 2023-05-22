import {Component} from '@angular/core';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

/**
 * @title Basic slide-toggles
 */
@Component({
  selector: 'slide-toggle-overview-example',
  templateUrl: 'slide-toggle-overview-example.html',
  standalone: true,
  imports: [MatSlideToggleModule],
})
export class SlideToggleOverviewExample {}
