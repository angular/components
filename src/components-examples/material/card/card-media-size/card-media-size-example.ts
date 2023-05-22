import {Component} from '@angular/core';
import {MatCardModule} from '@angular/material/card';

/**
 * @title Card with media size
 */
@Component({
  selector: 'card-media-size-example',
  templateUrl: 'card-media-size-example.html',
  styleUrls: ['card-media-size-example.css'],
  standalone: true,
  imports: [MatCardModule],
})
export class CardMediaSizeExample {
  longText = `The Shiba Inu is the smallest of the six original and distinct spitz breeds of dog
  from Japan. A small, agile dog that copes very well with mountainous terrain, the Shiba Inu was
  originally bred for hunting.`;
}
