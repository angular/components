import {HarnessLoader} from '@angular/cdk-experimental/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk-experimental/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed, inject} from '@angular/core/testing';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {Platform, PlatformModule} from '@angular/cdk/platform';
import {MatButtonToggleModule as MatMdcButtonToggleModule} from '../index';
import {MatButtonToggleHarness} from './button-toggle-harness';
import {MatButtonToggleHarness as MatMdcButtonToggleHarness} from './mdc-button-toggle-harness';

let fixture: ComponentFixture<ButtonToggleHarnessTest>;
let loader: HarnessLoader;
let harness: typeof MatButtonToggleHarness;

describe('MatButtonToggleHarness', () => {
  describe('non-MDC-based', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MatButtonToggleModule, PlatformModule],
        declarations: [ButtonToggleHarnessTest],
      }).compileComponents();

      fixture = TestBed.createComponent(ButtonToggleHarnessTest);
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
      harness = MatButtonToggleHarness;
    });

    runTests();
  });

  describe('MDC-based', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MatMdcButtonToggleModule, PlatformModule],
        declarations: [ButtonToggleHarnessTest],
      }).compileComponents();

      fixture = TestBed.createComponent(ButtonToggleHarnessTest);
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
      // Public APIs are the same as MatButtonToggleHarness, but cast is
      // necessary because of different private fields.
      harness = MatMdcButtonToggleHarness as any;
    });

    // TODO: enable when the MDC-based harness is done.
    // runTests();
  });
});

/** Shared tests to run on both the original and MDC-based toggles. */
function runTests() {
  let platform: Platform;

  beforeEach(inject([Platform], (p: Platform) => {
    platform = p;
  }));

  it('should load all button toggle harnesses', async () => {
    const toggles = await loader.getAllHarnesses(harness);
    expect(toggles.length).toBe(2);
  });

  it('should load a button toggle with exact label', async () => {
    const toggles = await loader.getAllHarnesses(harness.with({label: 'First'}));
    expect(toggles.length).toBe(1);
    expect(await toggles[0].getText()).toBe('First');
  });

  it('should load a button toggle with regex label match', async () => {
    const toggles = await loader.getAllHarnesses(harness.with({label: /^s/i}));
    expect(toggles.length).toBe(1);
    expect(await toggles[0].getText()).toBe('Second');
  });

  it('should get checked state', async () => {
    const [checkedToggle, uncheckedToggle] = await loader.getAllHarnesses(harness);
    expect(await checkedToggle.isChecked()).toBe(true);
    expect(await uncheckedToggle.isChecked()).toBe(false);
  });

  it('should get disabled state', async () => {
    const [enabledToggle, disabledToggle] = await loader.getAllHarnesses(harness);
    expect(await enabledToggle.isDisabled()).toBe(false);
    expect(await disabledToggle.isDisabled()).toBe(true);
  });

  it('should get name', async () => {
    const toggle = await loader.getHarness(harness.with({label: 'First'}));
    expect(await toggle.getName()).toBe('first-name');
  });

  it('should get aria-label', async () => {
    const toggle = await loader.getHarness(harness.with({label: 'First'}));
    expect(await toggle.getAriaLabel()).toBe('First toggle');
  });

  it('should get aria-labelledby', async () => {
    const toggle = await loader.getHarness(harness.with({label: 'Second'}));
    expect(await toggle.getAriaLabelledby()).toBe('second-label');
  });

  it('should get label text', async () => {
    const [firstToggle, secondToggle] = await loader.getAllHarnesses(harness);
    expect(await firstToggle.getText()).toBe('First');
    expect(await secondToggle.getText()).toBe('Second');
  });

  it('should focus button', async () => {
    const toggle = await loader.getHarness(harness.with({label: 'First'}));
    expect(getActiveElementTagName()).not.toBe('button');
    await toggle.focus();
    expect(getActiveElementTagName()).toBe('button');
  });

  it('should blur button', async () => {
    const toggle = await loader.getHarness(harness.with({label: 'First'}));
    await toggle.focus();
    expect(getActiveElementTagName()).toBe('button');
    await toggle.blur();
    expect(getActiveElementTagName()).not.toBe('button');
  });

  it('should toggle', async () => {
    fixture.componentInstance.disabled = false;
    const [checkedToggle, uncheckedToggle] = await loader.getAllHarnesses(harness);
    await checkedToggle.toggle();
    await uncheckedToggle.toggle();
    expect(await checkedToggle.isChecked()).toBe(false);
    expect(await uncheckedToggle.isChecked()).toBe(true);
  });

  it('should check toggle', async () => {
    fixture.componentInstance.disabled = false;
    const [checkedToggle, uncheckedToggle] = await loader.getAllHarnesses(harness);
    await checkedToggle.check();
    await uncheckedToggle.check();
    expect(await checkedToggle.isChecked()).toBe(true);
    expect(await uncheckedToggle.isChecked()).toBe(true);
  });

  it('should uncheck toggle', async () => {
    fixture.componentInstance.disabled = false;
    const [checkedToggle, uncheckedToggle] = await loader.getAllHarnesses(harness);
    await checkedToggle.uncheck();
    await uncheckedToggle.uncheck();
    expect(await checkedToggle.isChecked()).toBe(false);
    expect(await uncheckedToggle.isChecked()).toBe(false);
  });

  it('should not change disabled toggle', async () => {
    // Older versions of Edge have a bug where `disabled` buttons are still clickable if
    // they contain child elements. We skip this check on Edge.
    // See https://stackoverflow.com/questions/32377026/disabled-button-is-clickable-on-edge-browser
    if (platform.EDGE) {
      return;
    }

    const disabledToggle = await loader.getHarness(harness.with({label: 'Second'}));
    expect(await disabledToggle.isChecked()).toBe(false);
    await disabledToggle.toggle();
    expect(await disabledToggle.isChecked()).toBe(false);
  });
}

function getActiveElementTagName() {
  return document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
}

@Component({
  template: `
    <mat-button-toggle
      name="first-name"
      value="first-value"
      aria-label="First toggle"
      checked>First</mat-button-toggle>
    <mat-button-toggle
      [disabled]="disabled"
      aria-labelledby="second-label">Second</mat-button-toggle>
    <span id="second-label">Second toggle</span>
  `
})
class ButtonToggleHarnessTest {
  disabled = true;
}

