import {Component, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressBarHarness} from './progress-bar-harness';

describe('MatProgressBarHarness', () => {
  let fixture: ComponentFixture<ProgressBarHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatProgressBarModule, ProgressBarHarnessTest],
    });

    fixture = TestBed.createComponent(ProgressBarHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all progress bar harnesses', async () => {
    const progressBars = await loader.getAllHarnesses(MatProgressBarHarness);
    expect(progressBars.length).toBe(2);
  });

  it('should get the value', async () => {
    fixture.componentInstance.value.set(50);
    const [determinate, indeterminate] = await loader.getAllHarnesses(MatProgressBarHarness);
    expect(await determinate.getValue()).toBe(50);
    expect(await indeterminate.getValue()).toBe(null);
  });

  it('should get the mode', async () => {
    const [determinate, indeterminate] = await loader.getAllHarnesses(MatProgressBarHarness);
    expect(await determinate.getMode()).toBe('determinate');
    expect(await indeterminate.getMode()).toBe('indeterminate');
  });
});

// TODO: Add and test progress bars with modes `buffer` and `query`.
@Component({
  template: `
    <mat-progress-bar mode="determinate" [value]="value()"></mat-progress-bar>
    <mat-progress-bar mode="indeterminate"></mat-progress-bar>
  `,
  imports: [MatProgressBarModule],
})
class ProgressBarHarnessTest {
  value = signal<number | undefined>(undefined);
}
