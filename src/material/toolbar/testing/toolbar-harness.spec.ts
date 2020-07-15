import {runHarnessTexts} from '@angular/material/toolbar/testing/shared.spec';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatToolbarHarness} from '@angular/material/toolbar/testing/toolbar-harness';

describe('Non-MDC-based MatToolbarHarness', () => {
  runHarnessTexts(MatToolbarModule, MatToolbarHarness);
});
