import {MatDividerHarness} from '@angular/material/divider/testing';
import {MatListModule} from '@angular/material/list';
import {
  MatActionListHarness,
  MatListHarness,
  MatNavListHarness,
  MatSelectionListHarness
} from './list-harness-base';
import {MatListItemHarnessBase, MatSubheaderHarness} from './list-item-harness-base';
import {runHarnessTests} from './shared.spec';

describe('Non-MDC-based list harnesses', () => {
  runHarnessTests(
      MatListModule, MatListHarness, MatActionListHarness, MatNavListHarness,
      MatSelectionListHarness, MatListItemHarnessBase, MatSubheaderHarness, MatDividerHarness);
});
