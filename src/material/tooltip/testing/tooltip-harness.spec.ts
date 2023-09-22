import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatTooltipHarness} from './tooltip-harness';

describe('MatTooltipHarness', () => {
  let fixture: ComponentFixture<TooltipHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatTooltipModule, NoopAnimationsModule],
      declarations: [TooltipHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(TooltipHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all tooltip harnesses', async () => {
    const tooltips = await loader.getAllHarnesses(MatTooltipHarness);
    expect(tooltips.length).toBe(3);
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

  it('should get disabled state', async () => {
    const enabled = await loader.getHarness(MatTooltipHarness.with({selector: '#one'}));
    const disabled = await loader.getHarness(MatTooltipHarness.with({selector: '#three'}));

    expect(await enabled.isDisabled()).toBe(false);
    expect(await disabled.isDisabled()).toBe(true);
  });
});

@Component({
  template: `
    <button [matTooltip]='message' id='one'>Trigger 1</button>
    <button matTooltip='Static message' id='two'>Trigger 2</button>
    <button matTooltip='Disabled Tooltip' [matTooltipDisabled]='true' id='three'>Trigger 3</button>
  `,
})
class TooltipHarnessTest {
  message = 'Tooltip message';
}
