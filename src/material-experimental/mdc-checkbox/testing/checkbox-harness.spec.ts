import {MatCheckboxModule} from '@angular/material-experimental/mdc-checkbox';
import {MatCheckboxHarness} from '@angular/material-experimental/mdc-checkbox/testing';
import {runTests} from '@angular/material/checkbox/testing/shared.spec';

describe('MDC-based MatCheckboxHarness', () => {
  runTests(MatCheckboxModule, MatCheckboxHarness as any);
});
