import {MatOption, MatOptionModule} from '@angular/material/core';

import {MatOptionHarness} from './option-harness';
import {runHarnessTests} from './option-shared.spec';

describe('Non-MDC-based MatOptionHarness', () => {
  runHarnessTests(MatOptionModule, MatOptionHarness, MatOption);
});
