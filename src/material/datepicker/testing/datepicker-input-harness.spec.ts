import {MatDatepickerModule} from '@angular/material/datepicker';

import {MatCalendarHarness} from './calendar-harness';
import {MatDatepickerInputHarness} from './datepicker-input-harness';
import {runDatepickerInputHarnessTests} from './datepicker-input-harness-shared.spec';

describe('Non-MDC-based datepicker input harness', () => {
  runDatepickerInputHarnessTests(
      MatDatepickerModule, MatDatepickerInputHarness, MatCalendarHarness);
});
