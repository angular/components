import {Component} from '@angular/core';
import {NgFor} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';

/**
 * @title Testing with MatAutocompleteHarness
 */
@Component({
  selector: 'autocomplete-harness-example',
  templateUrl: 'autocomplete-harness-example.html',
  standalone: true,
  imports: [MatAutocompleteModule, NgFor],
})
export class AutocompleteHarnessExample {
  states = [
    {code: 'AL', name: 'Alabama'},
    {code: 'CA', name: 'California'},
    {code: 'FL', name: 'Florida'},
    {code: 'KS', name: 'Kansas'},
    {code: 'MA', name: 'Massachusetts'},
    {code: 'NY', name: 'New York'},
    {code: 'OR', name: 'Oregon'},
    {code: 'PA', name: 'Pennsylvania'},
    {code: 'TN', name: 'Tennessee'},
    {code: 'VA', name: 'Virginia'},
    {code: 'WY', name: 'Wyoming'},
  ];
}
