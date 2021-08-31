import {MatDatepickerModule} from '@angular/material/datepicker';

import {MatCalendarHarness} from './calendar-harness';
import {MatDatepickerToggleHarness} from './datepicker-toggle-harness';
import {runDatepickerToggleHarnessTests} from './datepicker-toggle-harness-shared.spec';

describe('Non-MDC-based datepicker toggle harness', () => {
  runDatepickerToggleHarnessTests(
      MatDatepickerModule, MatDatepickerToggleHarness, MatCalendarHarness);
});
