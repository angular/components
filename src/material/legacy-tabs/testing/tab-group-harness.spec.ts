import {MatLegacyTabsModule} from '@angular/material/legacy-tabs';
import {runTabGroupHarnessTests} from '@angular/material/tabs/testing/tab-group-shared.spec';
import {MatLegacyTabGroupHarness} from './tab-group-harness';
import {MatLegacyTabHarness} from './tab-harness';

describe('Non-MDC-based MatTabGroupHarness', () => {
  runTabGroupHarnessTests(
    MatLegacyTabsModule,
    MatLegacyTabGroupHarness as any,
    MatLegacyTabHarness as any,
  );
});
