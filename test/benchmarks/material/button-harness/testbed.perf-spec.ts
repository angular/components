/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonHarness} from '@angular/material/button/testing/button-harness';
import {benchmark, getButtonWithText} from './testbed-benchmark-utilities';
import {FIRST_BUTTON, MIDDLE_BUTTON, NUM_BUTTONS, LAST_BUTTON} from './constants';

describe('performance baseline for the testbed harness', () => {
  let fixture: ComponentFixture<ButtonHarnessTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatButtonModule],
      declarations: [ButtonHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonHarnessTest);
    fixture.detectChanges();
  });

  it('(baseline) should retrieve all of the buttons', async () => {
    await benchmark('(baseline) get every button', async () => {
      document.querySelectorAll('button');
    });
  });

  it('(baseline) should click the first button', async () => {
    await benchmark('(baseline) click first button', async () => {
      const button = getButtonWithText(FIRST_BUTTON);
      button.click();
    });
  });

  it('(baseline) should click the middle button', async () => {
    await benchmark('(baseline) click middle button', async () => {
      const button = getButtonWithText(MIDDLE_BUTTON);
      button.click();
    });
  });

  it('(baseline) should click the last button', async () => {
    await benchmark('(baseline) click last button', async () => {
      const button = getButtonWithText(LAST_BUTTON);
      button.click();
    });
  });

  it('(baseline) should click all of the buttons', async () => {
    await benchmark('(baseline) click every button', async () => {
      const buttons = document.getElementsByTagName('button');
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        button.click();
      }
    });
  });
});

describe('performance tests for the testbed harness', () => {
  let fixture: ComponentFixture<ButtonHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatButtonModule],
      declarations: [ButtonHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should retrieve all of the buttons', async () => {
    await benchmark('get every button', async () => {
      await loader.getAllHarnesses(MatButtonHarness);
    });
  });

  it('should click the first button', async () => {
    await benchmark('click first button', async () => {
      const button = await loader.getHarness(MatButtonHarness.with({text: FIRST_BUTTON}));
      await button.click();
    });
  });

  it('should click the middle button', async () => {
    await benchmark('click middle button', async () => {
      const button = await loader.getHarness(MatButtonHarness.with({text: MIDDLE_BUTTON}));
      await button.click();
    });
  });

  it('should click the last button', async () => {
    await benchmark('click last button', async () => {
      const button = await loader.getHarness(MatButtonHarness.with({text: LAST_BUTTON}));
      await button.click();
    });
  });

  it('should click all of the buttons', async () => {
    await benchmark('click every button', async () => {
      const buttons = await loader.getAllHarnesses(MatButtonHarness);
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        await button.click();
      }
    });
  });

  // To see the benchmarks for this test, uncomment the it test below.
  //
  // I don't know how to force karma_web_test to show logs in the console so we are using this as
  // a solution for now.
  // it('should fail intentionally', () => expect(1).toBe(2));
});

@Component({
  template: `
    <button *ngFor="let val of vals" mat-button> {{ val }} </button>
  `,
})
export class ButtonHarnessTest {
  vals = Array.from({ length: NUM_BUTTONS }, (_, i) => i);
}
