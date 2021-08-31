import {MatDatepickerModule} from '@angular/material/datepicker';

import {MatCalendarHarness} from './calendar-harness';
import {
  MatDateRangeInputHarness,
  MatEndDateHarness,
  MatStartDateHarness,
} from './date-range-input-harness';
import {runDateRangeInputHarnessTests} from './date-range-input-harness-shared.spec';

describe('Non-MDC-based date range input harness', () => {
  runDateRangeInputHarnessTests(
      MatDatepickerModule,
      MatDateRangeInputHarness,
      MatStartDateHarness,
      MatEndDateHarness,
      MatCalendarHarness,
  );
});
