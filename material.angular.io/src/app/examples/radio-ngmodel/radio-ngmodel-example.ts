import {Component} from '@angular/core';


@Component({
  selector: 'radio-ngmodel-example',
  templateUrl: './radio-ngmodel-example.html',
  styleUrls: ['./radio-ngmodel-example.css'],
})
export class RadioNgModelExample {
  favoriteSeason: string;

  seasons = [
    'Winter',
    'Spring',
    'Summer',
    'Autumn',
  ];
}
