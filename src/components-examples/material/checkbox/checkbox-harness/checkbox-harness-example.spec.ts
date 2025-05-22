import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatCheckboxHarness} from '@angular/material/checkbox/testing';
import {CheckboxHarnessExample} from './checkbox-harness-example';

describe('CheckboxHarnessExample', () => {
  let fixture: ComponentFixture<CheckboxHarnessExample>;
  let loader: HarnessLoader;

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load checkbox with name', async () => {
    const checkboxes = await loader.getAllHarnesses(MatCheckboxHarness.with({name: 'first-name'}));
    expect(checkboxes.length).toBe(1);
    expect(await checkboxes[0].getLabelText()).toBe('First');
  });

  it('should get checked state', async () => {
    const [checkedCheckbox, uncheckedCheckbox] = await loader.getAllHarnesses(MatCheckboxHarness);
    expect(await checkedCheckbox.isChecked()).toBe(true);
    expect(await uncheckedCheckbox.isChecked()).toBe(false);
  });

  it('should get name', async () => {
    const checkbox = await loader.getHarness(MatCheckboxHarness.with({label: 'First'}));
    expect(await checkbox.getName()).toBe('first-name');
  });

  it('should get label text', async () => {
    const [firstCheckbox, secondCheckbox] = await loader.getAllHarnesses(MatCheckboxHarness);
    expect(await firstCheckbox.getLabelText()).toBe('First');
    expect(await secondCheckbox.getLabelText()).toBe('Second');
  });

  it('should toggle checkbox', async () => {
    fixture.componentRef.setInput('disabled', false);
    fixture.changeDetectorRef.markForCheck();
    const [checkedCheckbox, uncheckedCheckbox] = await loader.getAllHarnesses(MatCheckboxHarness);
    await checkedCheckbox.toggle();
    await uncheckedCheckbox.toggle();
    expect(await checkedCheckbox.isChecked()).toBe(false);
    expect(await uncheckedCheckbox.isChecked()).toBe(true);
  });
});
