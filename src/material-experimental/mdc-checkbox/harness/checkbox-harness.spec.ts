import {HarnessLoader} from '@angular/cdk-experimental/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk-experimental/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatCheckboxModule as MatMdcCheckboxModule} from '../index';
import {MatCheckboxHarness} from './checkbox-harness';
import {MatCheckboxHarness as MatMdcCheckboxHarness} from './mdc-checkbox-harness';

let fixture: ComponentFixture<CheckboxHarnessTest>;
let loader: HarnessLoader;
let checkboxHarness: typeof MatCheckboxHarness;

describe('MatCheckboxHarness', () => {
  describe('non-MDC-based', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MatCheckboxModule, ReactiveFormsModule],
        declarations: [CheckboxHarnessTest],
      }).compileComponents();

      fixture = TestBed.createComponent(CheckboxHarnessTest);
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
      checkboxHarness = MatCheckboxHarness;
    });

    runTests();
  });

  describe('MDC-based', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MatMdcCheckboxModule, ReactiveFormsModule],
        declarations: [CheckboxHarnessTest],
      }).compileComponents();

      fixture = TestBed.createComponent(CheckboxHarnessTest);
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
      // Public APIs are the same as MatCheckboxHarness, but cast is necessary because of different
      // private fields.
      checkboxHarness = MatMdcCheckboxHarness as any;
    });

    runTests();
  });
});

/** Shared tests to run on both the original and MDC-based checkboxes. */
function runTests() {
  it('should load all checkbox harnesses', async () => {
    const checkboxes = await loader.getAllHarnesses(checkboxHarness);
    expect(checkboxes.length).toBe(2);
  });

  it('should load checkbox with exact label', async () => {
    const checkboxes = await loader.getAllHarnesses(checkboxHarness.with({label: 'First'}));
    expect(checkboxes.length).toBe(1);
    expect(await checkboxes[0].getLabelText()).toBe('First');
  });

  it('should load checkbox with regex label match', async () => {
    const checkboxes = await loader.getAllHarnesses(checkboxHarness.with({label: /^s/i}));
    expect(checkboxes.length).toBe(1);
    expect(await checkboxes[0].getLabelText()).toBe('Second');
  });

  it('should get checked state', async () => {
    const checkboxes = await loader.getAllHarnesses(checkboxHarness);
    expect(await checkboxes[0].isChecked()).toBe(true);
    expect(await checkboxes[1].isChecked()).toBe(false);
  });

  it('should get indeterminate state', async () => {
    const checkboxes = await loader.getAllHarnesses(checkboxHarness);
    expect(await checkboxes[0].isIndeterminate()).toBe(false);
    expect(await checkboxes[1].isIndeterminate()).toBe(true);
  });

  it('should get disabled state', async () => {
    const checkboxes = await loader.getAllHarnesses(checkboxHarness);
    expect(await checkboxes[0].isDisabled()).toBe(false);
    expect(await checkboxes[1].isDisabled()).toBe(true);
  });

  it('should get required state', async () => {
    const checkboxes = await loader.getAllHarnesses(checkboxHarness);
    expect(await checkboxes[0].isRequired()).toBe(true);
    expect(await checkboxes[1].isRequired()).toBe(false);
  });

  it('should get valid state', async () => {
    const checkboxes = await loader.getAllHarnesses(checkboxHarness);
    expect(await checkboxes[0].isValid()).toBe(true);
    expect(await checkboxes[1].isValid()).toBe(true);
    await checkboxes[0].uncheck();
    expect(await checkboxes[0].isValid()).toBe(false);
  });

  it('should get name', async () => {
    const checkbox = await loader.getHarness(checkboxHarness.with({label: 'First'}));
    expect(await checkbox.getName()).toBe('first-name');
  });

  it('should get value', async () => {
    const checkbox = await loader.getHarness(checkboxHarness.with({label: 'First'}));
    expect(await checkbox.getValue()).toBe('first-value');
  });

  it('should get aria-label', async () => {
    const checkbox = await loader.getHarness(checkboxHarness.with({label: 'First'}));
    expect(await checkbox.getAriaLabel()).toBe('First checkbox');
  });

  it('should get aria-labelledby', async () => {
    const checkbox = await loader.getHarness(checkboxHarness.with({label: 'Second'}));
    expect(await checkbox.getAriaLabelledby()).toBe('second-label');
  });

  it('should get label text', async () => {
    const checkboxes = await loader.getAllHarnesses(checkboxHarness);
    expect(await checkboxes[0].getLabelText()).toBe('First');
    expect(await checkboxes[1].getLabelText()).toBe('Second');
  });

  it('should focus checkbox', async () => {
    const checkbox = await loader.getHarness(checkboxHarness.with({label: 'First'}));
    expect(getActiveElementTagName()).not.toBe('input');
    await checkbox.foucs();
    expect(getActiveElementTagName()).toBe('input');
  });

  it('should blur checkbox', async () => {
    const checkbox = await loader.getHarness(checkboxHarness.with({label: 'First'}));
    await checkbox.foucs();
    expect(getActiveElementTagName()).toBe('input');
    await checkbox.blur();
    expect(getActiveElementTagName()).not.toBe('input');
  });

  it('should toggle checkbox', async () => {
    fixture.componentInstance.disabled = false;
    const checkboxes = await loader.getAllHarnesses(checkboxHarness);
    await checkboxes[0].toggle();
    await checkboxes[1].toggle();
    expect(await checkboxes[0].isChecked()).toBe(false);
    expect(await checkboxes[1].isChecked()).toBe(true);
  });

  it('should check checkbox', async () => {
    fixture.componentInstance.disabled = false;
    const checkboxes = await loader.getAllHarnesses(checkboxHarness);
    await checkboxes[0].check();
    await checkboxes[1].check();
    expect(await checkboxes[0].isChecked()).toBe(true);
    expect(await checkboxes[1].isChecked()).toBe(true);
  });

  it('should uncheck checkbox', async () => {
    fixture.componentInstance.disabled = false;
    const checkboxes = await loader.getAllHarnesses(checkboxHarness);
    await checkboxes[0].uncheck();
    await checkboxes[1].uncheck();
    expect(await checkboxes[0].isChecked()).toBe(false);
    expect(await checkboxes[1].isChecked()).toBe(false);
  });

  it('should not toggle disabled checkbox', async () => {
    const checkbox = await loader.getHarness(checkboxHarness.with({label: 'Second'}));
    expect(await checkbox.isChecked()).toBe(false);
    await checkbox.toggle();
    expect(await checkbox.isChecked()).toBe(false);
  });
}

function getActiveElementTagName() {
  return document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
}

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
  `
})
class CheckboxHarnessTest {
  ctrl = new FormControl(true);
  disabled = true;
}

