import {SelectionChange} from '@angular/cdk-experimental/selection';
import {Component} from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {NgFor, AsyncPipe} from '@angular/common';
import {MatSelectionModule} from '@angular/material-experimental/selection';

/**
 * @title Mat Selection on a simple list.
 */
@Component({
  selector: 'mat-selection-list-example',
  templateUrl: 'mat-selection-list-example.html',
  standalone: true,
  imports: [MatSelectionModule, NgFor, MatCheckboxModule, AsyncPipe],
})
export class MatSelectionListExample {
  data = ELEMENT_NAMES;
  selected1: string[] = [];
  selected2: string[] = [];
  selected3: string[] = [];
  selected4: string[] = [];

  getCurrentSelected(event: SelectionChange<string>) {
    return event.after.map(select => select.value);
  }

  trackByFn(index: number, value: string) {
    return index;
  }

  changeElementName() {
    this.data = ELEMENT_SYMBOLS;
  }

  reset() {
    this.data = ELEMENT_NAMES;
  }
}

const ELEMENT_NAMES = [
  'Hydrogen',
  'Helium',
  'Lithium',
  'Beryllium',
  'Boron',
  'Carbon',
  'Nitrogen',
  'Oxygen',
  'Fluorine',
  'Neon',
  'Sodium',
  'Magnesium',
  'Aluminum',
  'Silicon',
  'Phosphorus',
  'Sulfur',
  'Chlorine',
  'Argon',
  'Potassium',
  'Calcium',
];

const ELEMENT_SYMBOLS = [
  'H',
  'He',
  'Li',
  'Be',
  'B',
  'C',
  'N',
  'O',
  'F',
  'Ne',
  'Na',
  'Mg',
  'Al',
  'Si',
  'P',
  'S',
  'Cl',
  'Ar',
  'K',
  'Ca',
];
