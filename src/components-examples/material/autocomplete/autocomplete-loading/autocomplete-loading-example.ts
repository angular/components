import {AsyncPipe} from '@angular/common';
import {Component, signal} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {Observable, of} from 'rxjs';
import {delay, finalize, startWith, switchMap} from 'rxjs/operators';

/** @title Autocomplete with asynchronous loading */
@Component({
  selector: 'autocomplete-loading-example',
  templateUrl: 'autocomplete-loading-example.html',
  styleUrl: 'autocomplete-loading-example.css',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
  ],
})
export class AutocompleteLoadingExample {
  myControl = new FormControl('');
  options = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California'];
  filteredOptions: Observable<string[]>;
  isLoading = signal(true);

  constructor() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      switchMap(value => {
        this.isLoading.set(true);
        return this._filter(value || '').pipe(finalize(() => this.isLoading.set(false)));
      }),
    );
  }

  private _filter(value: string): Observable<string[]> {
    const filterValue = value.toLowerCase();
    const results = this.options.filter(option => option.toLowerCase().includes(filterValue));

    // Simulate an asynchronous request.
    return of(results).pipe(delay(500));
  }
}