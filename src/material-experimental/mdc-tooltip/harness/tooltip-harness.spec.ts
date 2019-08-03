import {HarnessLoader} from '@angular/cdk-experimental/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk-experimental/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatTooltipModule as MatMdcTooltipModule} from '../index';
import {MatTooltipHarness} from './tooltip-harness';
import {MatTooltipHarness as MatMdcTooltipHarness} from './mdc-tooltip-harness';

let fixture: ComponentFixture<TooltipHarnessTest>;
let loader: HarnessLoader;
let harness: typeof MatTooltipHarness;

describe('MatTooltipHarness', () => {
  describe('non-MDC-based', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MatTooltipModule, NoopAnimationsModule],
        declarations: [TooltipHarnessTest],
      }).compileComponents();

      fixture = TestBed.createComponent(TooltipHarnessTest);
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
      harness = MatTooltipHarness;
    });

    runTests();
  });

  describe('MDC-based', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MatMdcTooltipModule, NoopAnimationsModule],
        declarations: [TooltipHarnessTest],
      }).compileComponents();

      fixture = TestBed.createComponent(TooltipHarnessTest);
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
      // Public APIs are the same as MatTooltipHarness, but cast
      // is necessary because of different private fields.
      harness = MatMdcTooltipHarness as any;
    });

    // TODO: enable after MDC tooltip is implemented
    // runTests();
  });
});

/** Shared tests to run on both the original and MDC-based tooltip. */
function runTests() {
  it('should load all tooltip harnesses', async () => {
    const tooltips = await loader.getAllHarnesses(harness);
    expect(tooltips.length).toBe(2);
  });

  it('should be able to open a tooltip', async () => {
    const tooltip = await loader.getHarness(harness.with({id: 'one'}));
    expect(await tooltip.isOpen()).toBe(false);
    await tooltip.open();
    expect(await tooltip.isOpen()).toBe(true);
  });

  // TODO(crisbeto): this fails because we have a setTimeout inside the tooltip which
  // can't be flushed. Talk to Miles about how we should approach this in harnesses.
  // it('should be able to close a tooltip', async () => {
  //   const tooltip = await loader.getHarness(harness.with({id: 'one'}));
  //   expect(await tooltip.isOpen()).toBe(false);
  //   await tooltip.open();
  //   expect(await tooltip.isOpen()).toBe(true);
  //   await tooltip.close();
  //   expect(await tooltip.isOpen()).toBe(false);
  // });

  it('should be able to get the text of a tooltip', async () => {
    const tooltip = await loader.getHarness(harness.with({id: 'one'}));
    await tooltip.open();
    expect(await tooltip.getTooltipText()).toBe('Tooltip message');
  });

  it('should return empty when getting the tooltip text while closed', async () => {
    const tooltip = await loader.getHarness(harness.with({id: 'one'}));
    expect(await tooltip.getTooltipText()).toBe('');
  });
}

@Component({
  template: `
    <button [matTooltip]="message" id="one">Trigger 1</button>
    <button matTooltip="Static message" id="two">Trigger 2</button>
  `
})
class TooltipHarnessTest {
  message = 'Tooltip message';
}

