import {ProtractorHarnessEnvironment} from '@angular/cdk/testing/protractor';
import {browser} from 'protractor';

describe('card harness', () => {
  beforeEach(async () => await browser.get('/card'));

  it('...', async () => {
    const loader = ProtractorHarnessEnvironment.loader();
    // TODO
  });
});
