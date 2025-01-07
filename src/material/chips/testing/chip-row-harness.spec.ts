import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatChipsModule} from '../index';
import {MatChipRowHarness} from './chip-row-harness';

describe('MatChipRowHarness', () => {
  let fixture: ComponentFixture<ChipRowHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatChipsModule, ChipRowHarnessTest],
    });

    fixture = TestBed.createComponent(ChipRowHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should get correct number of chip harnesses', async () => {
    const harnesses = await loader.getAllHarnesses(MatChipRowHarness);
    expect(harnesses.length).toBe(2);
  });

  it('should get whether the chip is editable', async () => {
    const harness = await loader.getHarness(MatChipRowHarness);
    expect(await harness.isEditable()).toBe(false);

    fixture.componentInstance.editable.set(true);
    expect(await harness.isEditable()).toBe(true);
  });
});

@Component({
  template: `
    <mat-chip-grid #grid>
      <mat-basic-chip-row [editable]="editable()"> Basic Chip Row </mat-basic-chip-row>
      <mat-chip-row [editable]="editable"> Chip Row </mat-chip-row>
      <input [matChipInputFor]="grid" />
    </mat-chip-grid>
  `,
  imports: [MatChipsModule],
})
class ChipRowHarnessTest {
  editable = signal(false);
}
