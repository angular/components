import {MatButtonToggleModule} from '@angular/material/button-toggle';

import {MatButtonToggleGroupHarness} from './button-toggle-group-harness';
import {runHarnessTests} from './button-toggle-group-shared.spec';

describe('Non-MDC-based MatButtonToggleGroupHarness', () => {
  runHarnessTests(MatButtonToggleModule, MatButtonToggleGroupHarness);
});
