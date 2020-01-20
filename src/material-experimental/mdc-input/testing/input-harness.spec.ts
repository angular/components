import {MatInputModule} from '@angular/material-experimental/mdc-input';
import {runHarnessTests} from '@angular/material/input/testing/shared.spec';
import {MatInputHarness} from './input-harness';

describe('MDC-based MatInputHarness', () => {
  runHarnessTests(MatInputModule, MatInputHarness);
});
