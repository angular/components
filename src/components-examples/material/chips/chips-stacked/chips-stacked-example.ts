import {Component} from '@angular/core';
import {MatChipsModule} from '@angular/material/chips';

/**
 * @title Stacked chips
 */
@Component({
  selector: 'chips-stacked-example',
  templateUrl: 'chips-stacked-example.html',
  styleUrl: 'chips-stacked-example.css',
  imports: [MatChipsModule],
})
export class ChipsStackedExample {
  readonly bestBoys: string[] = ['Samoyed', 'Akita Inu', 'Alaskan Malamute', 'Siberian Husky'];
}
