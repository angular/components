import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {Component, provideZoneChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatChipsModule} from '../index';
import {MatChipGridHarness} from './chip-grid-harness';

describe('MatChipGridHarness', () => {
  let fixture: ComponentFixture<ChipGridHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZoneChangeDetection()],
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatChipsModule, ReactiveFormsModule, ChipGridHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(ChipGridHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should get correct number of grid harnesses', async () => {
    const harnesses = await loader.getAllHarnesses(MatChipGridHarness);
    expect(harnesses.length).toBe(1);
  });

  it('should load chip grids with disabled state match', async () => {
    let enabledChips = await loader.getAllHarnesses(MatChipGridHarness.with({disabled: false}));
    let disabledChips = await loader.getAllHarnesses(MatChipGridHarness.with({disabled: true}));
    expect(enabledChips.length).toBe(1);
    expect(disabledChips.length).toBe(0);

    fixture.componentInstance.control.disable();
    enabledChips = await loader.getAllHarnesses(MatChipGridHarness.with({disabled: false}));
    disabledChips = await loader.getAllHarnesses(MatChipGridHarness.with({disabled: true}));
    expect(enabledChips.length).toBe(0);
    expect(disabledChips.length).toBe(1);
  });

  it('should get correct number of rows', async () => {
    const harness = await loader.getHarness(MatChipGridHarness);
    const rows = await harness.getRows();
    expect(rows.length).toBe(3);
  });

  it('should get the chip input harness', async () => {
    const harness = await loader.getHarness(MatChipGridHarness);
    const input = await harness.getInput();
    expect(input).not.toBe(null);
  });

  it('should get whether the grid is disabled', async () => {
    const harness = await loader.getHarness(MatChipGridHarness);
    expect(await harness.isDisabled()).toBe(false);

    fixture.componentInstance.control.disable();
    expect(await harness.isDisabled()).toBe(true);
  });

  it('should get whether the grid is required', async () => {
    const harness = await loader.getHarness(MatChipGridHarness);
    expect(await harness.isRequired()).toBe(false);

    fixture.componentInstance.required = true;
    expect(await harness.isRequired()).toBe(true);
  });

  it('should get whether the grid is invalid', async () => {
    const harness = await loader.getHarness(MatChipGridHarness);
    expect(await harness.isInvalid()).toBe(false);

    // Mark the control as touched since the default error
    // state matcher only activates after a control is touched.
    fixture.componentInstance.control.markAsTouched();
    fixture.componentInstance.control.setValue(null);

    expect(await harness.isInvalid()).toBe(true);
  });

  it('should get whether a chip is editable', async () => {
    const grid = await loader.getHarness(MatChipGridHarness);
    const chips = await grid.getRows();
    fixture.componentInstance.firstChipEditable = true;

    expect(await parallel(() => chips.map(chip => chip.isEditable()))).toEqual([
      true,
      false,
      false,
    ]);
  });

  it('should throw when trying to edit a chip that is not editable', async () => {
    const grid = await loader.getHarness(MatChipGridHarness);
    const chip = (await grid.getRows())[0];
    let error: string | null = null;
    fixture.componentInstance.firstChipEditable = false;

    try {
      await chip.startEditing();
    } catch (e: any) {
      error = e.message;
    }

    expect(error).toBe('Cannot begin editing a chip that is not editable.');
  });

  it('should be able to edit a chip row', async () => {
    const grid = await loader.getHarness(MatChipGridHarness);
    const chip = (await grid.getRows())[0];
    fixture.componentInstance.firstChipEditable = true;

    await chip.startEditing();
    await (await chip.getEditInput()).setValue('new value');
    await chip.finishEditing();

    expect(fixture.componentInstance.editSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        value: 'new value',
      }),
    );
  });
});

@Component({
  template: `
    <mat-chip-grid [formControl]="control" [required]="required" #grid>
      <mat-chip-row [editable]="firstChipEditable" (edited)="editSpy($event)">Chip A</mat-chip-row>
      <mat-chip-row>Chip B</mat-chip-row>
      <mat-chip-row>Chip C</mat-chip-row>
      <input [matChipInputFor]="grid"/>
    </mat-chip-grid>
  `,
  standalone: true,
  imports: [MatChipsModule, ReactiveFormsModule],
})
class ChipGridHarnessTest {
  control = new FormControl('value', [Validators.required]);
  required = false;
  firstChipEditable = false;
  editSpy = jasmine.createSpy('editSpy');
}
