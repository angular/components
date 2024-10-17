import {Component} from '@angular/core';
import {MatListModule} from '@angular/material/list';

/**
 * @title List with selection
 */
@Component({
  selector: 'list-selection-example',
  templateUrl: 'list-selection-example.html',
  imports: [MatListModule],
})
export class ListSelectionExample {
  typesOfShoes: string[] = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];
}
