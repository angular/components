import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'autocomplete-simple-example',
  templateUrl: 'autocomplete-simple-example.html',
  styleUrls: ['autocomplete-simple-example.css']
})
export class AutocompleteSimpleExample {

  myControl: FormControl = new FormControl();

  options = [
    'One',
    'Two',
    'Three'
   ];

}
