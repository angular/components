import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatCardModule} from '@angular/material/card';
import {MatCardHarness} from '@angular/material/card/testing/card-harness';

/** Shared tests to run on both the original and MDC-based cards. */
export function runHarnessTests(
    cardModule: typeof MatCardModule, cardHarness: typeof MatCardHarness) {
  let fixture: ComponentFixture<CardHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [cardModule],
      declarations: [CardHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(CardHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('...', async () => {
    // TODO
  });

}

@Component({
  template: `
  `
})
class CardHarnessTest {}

