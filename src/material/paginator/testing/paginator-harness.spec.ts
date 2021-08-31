import {MatPaginatorModule} from '@angular/material/paginator';

import {MatPaginatorHarness} from './paginator-harness';
import {runHarnessTests} from './shared.spec';

describe('Non-MDC-based MatPaginatorHarness', () => {
  runHarnessTests(MatPaginatorModule, MatPaginatorHarness);
});
