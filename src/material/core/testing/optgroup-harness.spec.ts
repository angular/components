import {MatOptionModule} from '@angular/material/core';

import {MatOptgroupHarness} from './optgroup-harness';
import {runHarnessTests} from './optgroup-shared.spec';

describe('Non-MDC-based MatOptgroupHarness', () => {
  runHarnessTests(MatOptionModule, MatOptgroupHarness);
});
