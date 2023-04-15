import {
  AfterViewInit,
  Component,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput, MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {NgFor} from '@angular/common';


@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-autocomplete-scene',
  templateUrl: './autocomplete-scene.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    NgFor,
  ],
})
export class AutocompleteScene implements AfterViewInit {
  myControl = new FormControl('');
  options: string[] = ['hello', 'hello world'];

  @ViewChild(MatInput) input!: MatInput;

  ngAfterViewInit() {
    this.input.focus();
  }
}

