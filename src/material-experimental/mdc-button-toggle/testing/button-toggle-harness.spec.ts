import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatButtonToggleModule} from '../index';
import {MatButtonToggleHarness} from './button-toggle-harness';

let fixture: ComponentFixture<MatButtonToggleHarnessTest>;
let loader: HarnessLoader;

describe('MatMatButtonToggleHarness', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatButtonToggleModule],
      declarations: [MatButtonToggleHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(MatButtonToggleHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all button toggle harnesses', async () => {
    const toggles = await loader.getAllHarnesses(MatButtonToggleHarness);
    expect(toggles.length).toBe(2);
  });

  it('should load a button toggle with exact label', async () => {
    const toggles = await loader.getAllHarnesses(MatButtonToggleHarness.with({text: 'First'}));
    expect(toggles.length).toBe(1);
    expect(await toggles[0].getText()).toBe('First');
  });

  it('should load a button toggle with regex label match', async () => {
    const toggles = await loader.getAllHarnesses(MatButtonToggleHarness.with({text: /^s/i}));
    expect(toggles.length).toBe(1);
    expect(await toggles[0].getText()).toBe('Second');
  });

  it('should get the toggle checked state', async () => {
    const [checkedToggle, uncheckedToggle] = await loader.getAllHarnesses(MatButtonToggleHarness);
    expect(await checkedToggle.isChecked()).toBe(true);
    expect(await uncheckedToggle.isChecked()).toBe(false);
  });

  it('should get the toggle disabled state', async () => {
    const [enabledToggle, disabledToggle] = await loader.getAllHarnesses(MatButtonToggleHarness);
    expect(await enabledToggle.isDisabled()).toBe(false);
    expect(await disabledToggle.isDisabled()).toBe(true);
  });

  it('should get the toggle name', async () => {
    const toggle = await loader.getHarness(MatButtonToggleHarness.with({text: 'First'}));
    expect(await toggle.getName()).toBe('first-name');
  });

  it('should get the toggle aria-label', async () => {
    const toggle = await loader.getHarness(MatButtonToggleHarness.with({text: 'First'}));
    expect(await toggle.getAriaLabel()).toBe('First toggle');
  });

  it('should get the toggle aria-labelledby', async () => {
    const toggle = await loader.getHarness(MatButtonToggleHarness.with({text: 'Second'}));
    expect(await toggle.getAriaLabelledby()).toBe('second-label');
  });

  it('should get the toggle label text', async () => {
    const [firstToggle, secondToggle] = await loader.getAllHarnesses(MatButtonToggleHarness);
    expect(await firstToggle.getText()).toBe('First');
    expect(await secondToggle.getText()).toBe('Second');
  });

  it('should focus the button toggle', async () => {
    const toggle = await loader.getHarness(MatButtonToggleHarness.with({text: 'First'}));
    expect(await toggle.isFocused()).toBe(false);
    await toggle.focus();
    expect(await toggle.isFocused()).toBe(true);
  });

  it('should blur the button toggle', async () => {
    const toggle = await loader.getHarness(MatButtonToggleHarness.with({text: 'First'}));
    await toggle.focus();
    expect(await toggle.isFocused()).toBe(true);
    await toggle.blur();
    expect(await toggle.isFocused()).toBe(false);
  });

  it('should toggle the button value', async () => {
    fixture.componentInstance.disabled = false;
    const [checkedToggle, uncheckedToggle] = await loader.getAllHarnesses(MatButtonToggleHarness);
    await checkedToggle.toggle();
    await uncheckedToggle.toggle();
    expect(await checkedToggle.isChecked()).toBe(false);
    expect(await uncheckedToggle.isChecked()).toBe(true);
  });

  it('should check the button toggle', async () => {
    fixture.componentInstance.disabled = false;
    const [checkedToggle, uncheckedToggle] = await loader.getAllHarnesses(MatButtonToggleHarness);
    await checkedToggle.check();
    await uncheckedToggle.check();
    expect(await checkedToggle.isChecked()).toBe(true);
    expect(await uncheckedToggle.isChecked()).toBe(true);
  });

  it('should uncheck the button toggle', async () => {
    fixture.componentInstance.disabled = false;
    const [checkedToggle, uncheckedToggle] = await loader.getAllHarnesses(MatButtonToggleHarness);
    await checkedToggle.uncheck();
    await uncheckedToggle.uncheck();
    expect(await checkedToggle.isChecked()).toBe(false);
    expect(await uncheckedToggle.isChecked()).toBe(false);
  });
});


@Component({
  template: `
      <button mat-button-toggle
        name="first-name"
        value="first-value"
        aria-label="First toggle"
        checked>First</button>
      <button mat-button-toggle
        [disabled]="disabled"
        aria-labelledby="second-label"
        appearance="legacy">Second</button>
      <span id="second-label">Second toggle</span>
  `
})
class MatButtonToggleHarnessTest {
  disabled = true;
}

