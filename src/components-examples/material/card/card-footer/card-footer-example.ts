import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';

/**
 * @title Card with footer
 */
@Component({
  selector: 'card-footer-example',
  templateUrl: 'card-footer-example.html',
  styleUrl: 'card-footer-example.css',
  standalone: true,
  imports: [MatCardModule, MatChipsModule, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardFooterExample {
  longText = `The Chihuahua is a Mexican breed of toy dog. It is named for the
  Mexican state of Chihuahua and is among the smallest of all dog breeds. It is
  usually kept as a companion animal or for showing.`;
}
