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

  it('should get the diameter', async () => {
    fixture.componentInstance.diameter.set(20);
    const withAttributs =
      await loader.getHarness(MatProgressSpinnerHarness.with({selector: '.with-diameter'}));
    expect(await withAttributs.getDiameter()).toBe(20);
  });

  it('should get the strokeWidth', async () => {
    fixture.componentInstance.strokeWidth.set(5);
    const withAttributs =
      await loader.getHarness(MatProgressSpinnerHarness.with({selector: '.with-strokeWidth'}));
    expect(await withAttributs.getStrokeWidth()).toBe(5);
  });
});

@Component({
  template: `
    <mat-progress-spinner mode="determinate" [value]="value()"></mat-progress-spinner>
    <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
    <mat-spinner class="with-diameter with-strokeWidth" [diameter]="diameter()" [strokeWidth]="strokeWidth()"></mat-spinner>
  `,
  standalone: true,
  imports: [MatProgressSpinnerModule],
})
class ProgressSpinnerHarnessTest {
  value = signal(0);
  diameter = signal(30);
  strokeWidth = signal(3);
}
