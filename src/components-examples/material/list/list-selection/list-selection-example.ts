import {Component} from '@angular/core';
import {NgFor} from '@angular/common';
import {MatListModule} from '@angular/material/list';

/**
 * @title List with selection
 */
@Component({
  selector: 'list-selection-example',
  templateUrl: 'list-selection-example.html',
  standalone: true,
  imports: [MatListModule, NgFor],
})
export class ListSelectionExample {
  typesOfShoes: string[] = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];
}
