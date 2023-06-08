import {Component} from '@angular/core';
import {NgFor} from '@angular/common';
import {MatListModule} from '@angular/material/list';

/**
 * @title List with single selection
 */
@Component({
  selector: 'list-single-selection-example',
  templateUrl: 'list-single-selection-example.html',
  standalone: true,
  imports: [MatListModule, NgFor],
})
export class ListSingleSelectionExample {
  typesOfShoes: string[] = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];
}
