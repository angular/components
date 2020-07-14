import {HarnessLoader} from '@angular/cdk/testing';
import {browser} from 'protractor';
import {ProtractorHarnessEnvironment} from '@angular/cdk/testing/protractor';
import {MatToolbarHarness} from '@angular/material/toolbar/testing/toolbar-harness';

describe('toolbar harness', () => {
  let loader: HarnessLoader;

  beforeEach(async () => await browser.get('/toolbar'));

  beforeEach(() => {
    loader = ProtractorHarnessEnvironment.loader();
  });

  it('should get toolbar text', async () => {
    const toolbar = await loader.getHarness(MatToolbarHarness);

    expect(await toolbar.getText()).toBe([
      'CustomToolbar',
      'Second Line',
      'verified_user',
      'Third Line',
      'favorite',
      'delete'
    ].join('\n'))
  })

  it('should have multiple rows', async () => {
    const toolbar = await  loader.getHarness(MatToolbarHarness);

    expect(await toolbar.isMultiRow()).toBeTrue();
  })
})
