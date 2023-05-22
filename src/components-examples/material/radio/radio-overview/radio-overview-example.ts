import {Component} from '@angular/core';
import {MatRadioModule} from '@angular/material/radio';

/**
 * @title Basic radios
 */
@Component({
  selector: 'radio-overview-example',
  templateUrl: 'radio-overview-example.html',
  styleUrls: ['radio-overview-example.css'],
  standalone: true,
  imports: [MatRadioModule],
})
export class RadioOverviewExample {}
