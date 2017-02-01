import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'radio-ngmodel-example',
  templateUrl: 'radio-ngmodel-example.html',
  styleUrls: ['radio-ngmodel-example.css'],
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
