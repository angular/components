import {MatDatepickerModule} from '@angular/material/datepicker';

import {MatCalendarHarness} from './calendar-harness';
import {runCalendarHarnessTests} from './calendar-harness-shared.spec';

describe('Non-MDC-based calendar harness', () => {
  runCalendarHarnessTests(MatDatepickerModule, MatCalendarHarness);
});
