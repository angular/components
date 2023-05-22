import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';

/**
 * @title Card with sub-title
 */
@Component({
  selector: 'card-subtitle-example',
  templateUrl: 'card-subtitle-example.html',
  styleUrls: ['card-subtitle-example.css'],
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
})
export class CardSubtitleExample {
  longText = `The Shiba Inu is the smallest of the six original and distinct spitz breeds of dog
  from Japan. A small, agile dog that copes very well with mountainous terrain, the Shiba Inu was
  originally bred for hunting.`;
}
