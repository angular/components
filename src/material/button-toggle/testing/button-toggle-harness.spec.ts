import {MatButtonToggleModule} from '@angular/material/button-toggle';

import {MatButtonToggleHarness} from './button-toggle-harness';
import {runHarnessTests} from './button-toggle-shared.spec';

describe('Non-MDC-based MatButtonToggleHarness', () => {
  runHarnessTests(MatButtonToggleModule, MatButtonToggleHarness);
});
