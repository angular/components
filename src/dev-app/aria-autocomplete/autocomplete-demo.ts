import {ChangeDetectionStrategy, Component} from '@angular/core';
import {
  ComboboxAutocompleteAutoSelectExample,
  ComboboxAutocompleteManualExample,
  ComboboxAutocompleteHighlightExample,
  ComboboxAutocompleteDisabledExample,
} from '@angular/components-examples/aria/combobox';

@Component({
  selector: 'autocomplete-demo',
  templateUrl: 'autocomplete-demo.html',
  styleUrl: 'autocomplete-demo.css',
  imports: [
    ComboboxAutocompleteAutoSelectExample,
    ComboboxAutocompleteManualExample,
    ComboboxAutocompleteHighlightExample,
    ComboboxAutocompleteDisabledExample,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteDemo {}
