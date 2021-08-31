import {runHarnessTests} from '@angular/material/checkbox/testing/shared.spec';

import {MatCheckboxModule} from '../index';

import {MatCheckboxHarness} from './checkbox-harness';

describe('MDC-based MatCheckboxHarness', () => {
  runHarnessTests(MatCheckboxModule, MatCheckboxHarness as any);
});
