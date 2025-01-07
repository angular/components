import {Component, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatProgressSpinnerHarness} from './progress-spinner-harness';

describe('MatProgressSpinnerHarness', () => {
  let fixture: ComponentFixture<ProgressSpinnerHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatProgressSpinnerModule, ProgressSpinnerHarnessTest],
    });

    fixture = TestBed.createComponent(ProgressSpinnerHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all progress spinner harnesses', async () => {
    const progressSpinners = await loader.getAllHarnesses(MatProgressSpinnerHarness);
    expect(progressSpinners.length).toBe(3);
  });

  it('should get the value', async () => {
    fixture.componentInstance.value.set(50);
    const [determinate, indeterminate, impliedIndeterminate] =
      await loader.getAllHarnesses(MatProgressSpinnerHarness);
    expect(await determinate.getValue()).toBe(50);
    expect(await indeterminate.getValue()).toBe(null);
    expect(await impliedIndeterminate.getValue()).toBe(null);
  });

  it('should get the mode', async () => {
    const [determinate, indeterminate, impliedIndeterminate] =
      await loader.getAllHarnesses(MatProgressSpinnerHarness);
    expect(await determinate.getMode()).toBe('determinate');
    expect(await indeterminate.getMode()).toBe('indeterminate');
    expect(await impliedIndeterminate.getMode()).toBe('indeterminate');
  });
});

@Component({
  template: `
    <mat-progress-spinner mode="determinate" [value]="value()"></mat-progress-spinner>
    <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
    <mat-spinner></mat-spinner>
  `,
  imports: [MatProgressSpinnerModule],
})
class ProgressSpinnerHarnessTest {
  value = signal(0);
}
