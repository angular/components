import {ChangeDetectionStrategy, Component} from '@angular/core';
import {
  AutocompleteAutoSelectExample,
  AutocompleteManualExample,
  AutocompleteHighlightExample,
  AutocompleteDisabledExample,
} from '@angular/components-examples/aria/autocomplete';

@Component({
  selector: 'autocomplete-demo',
  templateUrl: 'autocomplete-demo.html',
  styleUrl: 'autocomplete-demo.css',
  imports: [
    AutocompleteAutoSelectExample,
    AutocompleteManualExample,
    AutocompleteHighlightExample,
    AutocompleteDisabledExample,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteDemo {}
