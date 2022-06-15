import {MatCardModule} from '@angular/material/legacy-card';
import {runHarnessTests} from '@angular/material/legacy-card/testing/shared.spec';
import {MatCardHarness, MatCardSection} from './card-harness';

describe('Non-MDC-based MatCardHarness', () => {
  runHarnessTests(MatCardModule, MatCardHarness, {
    header: MatCardSection.HEADER,
    content: MatCardSection.CONTENT,
    actions: MatCardSection.ACTIONS,
    footer: MatCardSection.FOOTER,
  });
});
