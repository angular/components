import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatCheckboxHarness} from './checkbox-harness';

describe('MatCheckboxHarness', () => {
  let fixture: ComponentFixture<CheckboxHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatCheckboxModule, ReactiveFormsModule],
      declarations: [CheckboxHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all checkbox harnesses', async () => {
    const checkboxes = await loader.getAllHarnesses(MatCheckboxHarness);
    expect(checkboxes.length).toBe(2);
  });

  it('should load checkbox with exact label', async () => {
    const checkboxes = await loader.getAllHarnesses(MatCheckboxHarness.with({label: 'First'}));
    expect(checkboxes.length).toBe(1);
    expect(await checkboxes[0].getLabelText()).toBe('First');
  });

  it('should load checkbox with name', async () => {
    const checkboxes = await loader.getAllHarnesses(MatCheckboxHarness.with({name: 'first-name'}));
    expect(checkboxes.length).toBe(1);
    expect(await checkboxes[0].getLabelText()).toBe('First');
  });

  it('should load checkbox with regex label match', async () => {
    const checkboxes = await loader.getAllHarnesses(MatCheckboxHarness.with({label: /^s/i}));
    expect(checkboxes.length).toBe(1);
    expect(await checkboxes[0].getLabelText()).toBe('Second');
  });

  it('should load checkbox with disabled state', async () => {
    let enabledCheckboxes = await loader.getAllHarnesses(
      MatCheckboxHarness.with({disabled: false}),
    );
    let disabledCheckboxes = await loader.getAllHarnesses(
      MatCheckboxHarness.with({disabled: true}),
    );
    expect(enabledCheckboxes.length).toBe(1);
    expect(disabledCheckboxes.length).toBe(1);

    fixture.componentInstance.disabled = false;
    enabledCheckboxes = await loader.getAllHarnesses(MatCheckboxHarness.with({disabled: false}));
    disabledCheckboxes = await loader.getAllHarnesses(MatCheckboxHarness.with({disabled: true}));
    expect(enabledCheckboxes.length).toBe(2);
    expect(disabledCheckboxes.length).toBe(0);
  });

  it('should get checked state', async () => {
    const [checkedCheckbox, uncheckedCheckbox] = await loader.getAllHarnesses(MatCheckboxHarness);
    expect(await checkedCheckbox.isChecked()).toBe(true);
    expect(await uncheckedCheckbox.isChecked()).toBe(false);
  });

  it('should get indeterminate state', async () => {
    const [checkedCheckbox, indeterminateCheckbox] = await loader.getAllHarnesses(
      MatCheckboxHarness,
    );
    expect(await checkedCheckbox.isIndeterminate()).toBe(false);
    expect(await indeterminateCheckbox.isIndeterminate()).toBe(true);
  });

  it('should get disabled state', async () => {
    const [enabledCheckbox, disabledCheckbox] = await loader.getAllHarnesses(MatCheckboxHarness);
    expect(await enabledCheckbox.isDisabled()).toBe(false);
    expect(await disabledCheckbox.isDisabled()).toBe(true);
  });

  it('should get required state', async () => {
    const [requiredCheckbox, optionalCheckbox] = await loader.getAllHarnesses(MatCheckboxHarness);
    expect(await requiredCheckbox.isRequired()).toBe(true);
    expect(await optionalCheckbox.isRequired()).toBe(false);
  });

  it('should get valid state', async () => {
    const [requiredCheckbox, optionalCheckbox] = await loader.getAllHarnesses(MatCheckboxHarness);
    expect(await optionalCheckbox.isValid()).toBe(true);
    expect(await requiredCheckbox.isValid()).toBe(true);
    await requiredCheckbox.uncheck();
    expect(await requiredCheckbox.isValid()).toBe(false);
  });

  it('should get name', async () => {
    const checkbox = await loader.getHarness(MatCheckboxHarness.with({label: 'First'}));
    expect(await checkbox.getName()).toBe('first-name');
  });

  it('should get value', async () => {
    const checkbox = await loader.getHarness(MatCheckboxHarness.with({label: 'First'}));
    expect(await checkbox.getValue()).toBe('first-value');
  });

  it('should get aria-label', async () => {
    const checkbox = await loader.getHarness(MatCheckboxHarness.with({label: 'First'}));
    expect(await checkbox.getAriaLabel()).toBe('First checkbox');
  });

  it('should get aria-labelledby', async () => {
    const checkbox = await loader.getHarness(MatCheckboxHarness.with({label: 'Second'}));
    expect(await checkbox.getAriaLabelledby()).toBe('second-label');
  });

  it('should get label text', async () => {
    const [firstCheckbox, secondCheckbox] = await loader.getAllHarnesses(MatCheckboxHarness);
    expect(await firstCheckbox.getLabelText()).toBe('First');
    expect(await secondCheckbox.getLabelText()).toBe('Second');
  });

  it('should focus checkbox', async () => {
    const checkbox = await loader.getHarness(MatCheckboxHarness.with({label: 'First'}));
    expect(await checkbox.isFocused()).toBe(false);
    await checkbox.focus();
    expect(await checkbox.isFocused()).toBe(true);
  });

  it('should blur checkbox', async () => {
    const checkbox = await loader.getHarness(MatCheckboxHarness.with({label: 'First'}));
    await checkbox.focus();
    expect(await checkbox.isFocused()).toBe(true);
    await checkbox.blur();
    expect(await checkbox.isFocused()).toBe(false);
  });

  it('should toggle checkbox', async () => {
    fixture.componentInstance.disabled = false;
    const [checkedCheckbox, uncheckedCheckbox] = await loader.getAllHarnesses(MatCheckboxHarness);
    await checkedCheckbox.toggle();
    await uncheckedCheckbox.toggle();
    expect(await checkedCheckbox.isChecked()).toBe(false);
    expect(await uncheckedCheckbox.isChecked()).toBe(true);
  });

  it('should check checkbox', async () => {
    fixture.componentInstance.disabled = false;
    const [checkedCheckbox, uncheckedCheckbox] = await loader.getAllHarnesses(MatCheckboxHarness);
    await checkedCheckbox.check();
    await uncheckedCheckbox.check();
    expect(await checkedCheckbox.isChecked()).toBe(true);
    expect(await uncheckedCheckbox.isChecked()).toBe(true);
  });

  it('should uncheck checkbox', async () => {
    fixture.componentInstance.disabled = false;
    const [checkedCheckbox, uncheckedCheckbox] = await loader.getAllHarnesses(MatCheckboxHarness);
    await checkedCheckbox.uncheck();
    await uncheckedCheckbox.uncheck();
    expect(await checkedCheckbox.isChecked()).toBe(false);
    expect(await uncheckedCheckbox.isChecked()).toBe(false);
  });

  it('should not toggle disabled checkbox', async () => {
    const disabledCheckbox = await loader.getHarness(MatCheckboxHarness.with({label: 'Second'}));
    expect(await disabledCheckbox.isChecked()).toBe(false);
    await disabledCheckbox.toggle();
    expect(await disabledCheckbox.isChecked()).toBe(false);
  });
});

@Component({
  template: `
    <mat-checkbox
        [formControl]="ctrl"
        required
        name="first-name"
        value="first-value"
        aria-label="First checkbox">
      First
    </mat-checkbox>
    <mat-checkbox indeterminate="true" [disabled]="disabled" aria-labelledby="second-label">
      Second
    </mat-checkbox>
    <span id="second-label">Second checkbox</span>
  `,
})
class CheckboxHarnessTest {
  ctrl = new FormControl(true);
  disabled = true;
}
