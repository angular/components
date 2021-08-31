import {MatAutocompleteModule} from '@angular/material-experimental/mdc-autocomplete';
import {MatNativeDateModule} from '@angular/material-experimental/mdc-core';
import {MatFormFieldModule} from '@angular/material-experimental/mdc-form-field';
import {MatInputModule} from '@angular/material-experimental/mdc-input';
import {MatInputHarness} from '@angular/material-experimental/mdc-input/testing';
import {MatSelectModule} from '@angular/material-experimental/mdc-select';
import {MatSelectHarness} from '@angular/material-experimental/mdc-select/testing';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {
  MatDatepickerInputHarness,
  MatDateRangeInputHarness,
} from '@angular/material/datepicker/testing';
import {runHarnessTests} from '@angular/material/form-field/testing/shared.spec';

import {MatFormFieldHarness} from './form-field-harness';

describe('MDC-based MatFormFieldHarness', () => {
  runHarnessTests(
      [
        MatFormFieldModule, MatAutocompleteModule, MatInputModule, MatSelectModule,
        MatNativeDateModule, MatDatepickerModule
      ],
      {
        formFieldHarness: MatFormFieldHarness as any,
        inputHarness: MatInputHarness,
        selectHarness: MatSelectHarness,
        datepickerInputHarness: MatDatepickerInputHarness,
        dateRangeInputHarness: MatDateRangeInputHarness,
        isMdcImplementation: true,
      });
});
