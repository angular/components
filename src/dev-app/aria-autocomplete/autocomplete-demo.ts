import {ChangeDetectionStrategy, Component} from '@angular/core';
import {
  AutocompleteAutoSelectExample,
  AutocompleteManualExample,
  AutocompleteHighlightExample,
  AutocompleteDisabledExample,
} from '@angular/components-examples/aria/autocomplete';
import {
  SimpleComboboxAutocompleteAutoSelectExample,
  SimpleComboboxAutocompleteManualExample,
  SimpleComboboxAutocompleteHighlightExample,
  SimpleComboboxAutocompleteDisabledExample,
} from '@angular/components-examples/aria/simple-combobox';

@Component({
  selector: 'autocomplete-demo',
  templateUrl: 'autocomplete-demo.html',
  styleUrl: 'autocomplete-demo.css',
  imports: [
    AutocompleteAutoSelectExample,
    AutocompleteManualExample,
    AutocompleteHighlightExample,
    AutocompleteDisabledExample,
    SimpleComboboxAutocompleteAutoSelectExample,
    SimpleComboboxAutocompleteManualExample,
    SimpleComboboxAutocompleteHighlightExample,
    SimpleComboboxAutocompleteDisabledExample,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteDemo {}
