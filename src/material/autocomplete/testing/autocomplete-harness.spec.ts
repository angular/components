import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {runTests} from '@angular/material/autocomplete/testing/shared.spec';
import {MatAutocompleteHarness} from './autocomplete-harness';

describe('Non-MDC-based MatAutocompleteHarness', () => {
  runTests(MatAutocompleteModule, MatAutocompleteHarness);
});
