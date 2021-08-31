import {MatCheckboxModule} from '@angular/material/checkbox';
import {runHarnessTests} from '@angular/material/checkbox/testing/shared.spec';

import {MatCheckboxHarness} from './checkbox-harness';

describe('Non-MDC-based MatCheckboxHarness', () => {
  runHarnessTests(MatCheckboxModule, MatCheckboxHarness);
});
