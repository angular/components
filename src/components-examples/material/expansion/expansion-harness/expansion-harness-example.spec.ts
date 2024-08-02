import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatAccordionHarness, MatExpansionPanelHarness} from '@angular/material/expansion/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ExpansionHarnessExample} from './expansion-harness-example';

describe('ExpansionHarnessExample', () => {
  let fixture: ComponentFixture<ExpansionHarnessExample>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
    });
    fixture = TestBed.createComponent(ExpansionHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should be able to load accordion', async () => {
    const accordions = await loader.getAllHarnesses(MatAccordionHarness);
    expect(accordions.length).toBe(1);
  });

  it('should be able to load expansion panels', async () => {
    const panels = await loader.getAllHarnesses(MatExpansionPanelHarness);
    expect(panels.length).toBe(1);
  });

  it('should be able to toggle expansion state of panel', async () => {
    const panel = await loader.getHarness(MatExpansionPanelHarness);
    expect(await panel.isExpanded()).toBe(false);
    await panel.toggle();
    expect(await panel.isExpanded()).toBe(true);
  });

  it('should be able to get text content of expansion panel', async () => {
    const panel = await loader.getHarness(MatExpansionPanelHarness);
    expect(await panel.getTextContent()).toBe('I am the content!');
  });

  it('should be able to get expansion panels of accordion', async () => {
    const accordion = await loader.getHarness(MatAccordionHarness);
    const panels = await accordion.getExpansionPanels();
    expect(panels.length).toBe(1);
    expect(await panels[0].getTitle()).toBe('Welcome');
  });
});
