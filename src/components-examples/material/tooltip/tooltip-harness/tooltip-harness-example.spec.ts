import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatTooltipHarness} from '@angular/material/tooltip/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TooltipHarnessExample} from './tooltip-harness-example';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatTooltipModule} from '@angular/material/tooltip';

describe('TooltipHarnessExample', () => {
  let fixture: ComponentFixture<TooltipHarnessExample>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatTooltipModule, NoopAnimationsModule],
    });
    fixture = TestBed.createComponent(TooltipHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all tooltip harnesses', async () => {
    const tooltips = await loader.getAllHarnesses(MatTooltipHarness);
    expect(tooltips.length).toBe(2);
  });

  it('should be able to show a tooltip', async () => {
    const tooltip = await loader.getHarness(MatTooltipHarness.with({selector: '#one'}));
    expect(await tooltip.isOpen()).toBe(false);
    await tooltip.show();
    expect(await tooltip.isOpen()).toBe(true);
  });

  it('should be able to hide a tooltip', async () => {
    const tooltip = await loader.getHarness(MatTooltipHarness.with({selector: '#one'}));
    expect(await tooltip.isOpen()).toBe(false);
    await tooltip.show();
    expect(await tooltip.isOpen()).toBe(true);
    await tooltip.hide();
    expect(await tooltip.isOpen()).toBe(false);
  });

  it('should be able to get the text of a tooltip', async () => {
    const tooltip = await loader.getHarness(MatTooltipHarness.with({selector: '#one'}));
    await tooltip.show();
    expect(await tooltip.getTooltipText()).toBe('Tooltip message');
  });

  it('should return empty when getting the tooltip text while closed', async () => {
    const tooltip = await loader.getHarness(MatTooltipHarness.with({selector: '#one'}));
    expect(await tooltip.getTooltipText()).toBe('');
  });
});
