import {Component, computed, signal} from '@angular/core';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {form, FormField} from '@angular/forms/signals';

/**
 * @title Highlight the first autocomplete option (signal forms)
 */
@Component({
  selector: 'autocomplete-auto-active-first-option-signal-form-example',
  templateUrl: './autocomplete-auto-active-first-option-signal-form-example.html',
  styleUrl: './autocomplete-auto-active-first-option-signal-form-example.css',
  imports: [MatFormFieldModule, MatInputModule, MatAutocompleteModule, FormField],
})
export class AutocompleteAutoActiveFirstOptionSignalFormExample {
  protected form = form(signal(''));

  protected filteredOptions = computed<string[]>(() => {
    const formValue = this.form().value();
    return this._filter(formValue);
  });

  private _options = ['One', 'Two', 'Three'] as const;

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this._options.filter(option => option.toLowerCase().includes(filterValue));
  }
}
