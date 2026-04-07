/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {
  AccordionTriggerHarness,
  AccordionPanelHarness,
  AccordionGroupHarness,
} from './accordion-harness';
import {AccordionGroup, AccordionPanel, AccordionTrigger} from '../index';

describe('Accordion Harnesses', () => {
  let fixture: any;
  let loader: any;

  @Component({
    imports: [AccordionGroup, AccordionPanel, AccordionTrigger],
    template: `
      <div ngAccordionGroup>
        <div #panel1="ngAccordionPanel" ngAccordionPanel>Content 1</div>
        <button ngAccordionTrigger [panel]="panel1">Section 1</button>

        <div #panel2="ngAccordionPanel" ngAccordionPanel>Content 2</div>
        <button ngAccordionTrigger [panel]="panel2" disabled>Section 2</button>
      </div>
    `,
  })
  class AccordionHarnessTestComponent {}

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AccordionHarnessTestComponent],
    });
    fixture = TestBed.createComponent(AccordionHarnessTestComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should find all accordion triggers', async () => {
    const triggers = await loader.getAllHarnesses(AccordionTriggerHarness);
    expect(triggers.length).toBe(2);
  });

  it('should support focusing and blurring accordion triggers', async () => {
    const trigger = await loader.getHarness(AccordionTriggerHarness.with({text: 'Section 1'}));
    await trigger.focus();
    expect(await trigger.isFocused()).toBeTrue();

    await trigger.blur();
    expect(await trigger.isFocused()).toBeFalse();
  });

  it('should correctly report the disabled state of a trigger', async () => {
    const activeTrigger = await loader.getHarness(
      AccordionTriggerHarness.with({text: 'Section 1'}),
    );
    const disabledTrigger = await loader.getHarness(
      AccordionTriggerHarness.with({text: 'Section 2'}),
    );

    expect(await activeTrigger.isDisabled()).toBeFalse();
    expect(await disabledTrigger.isDisabled()).toBeTrue();
  });

  it('should correctly report the expanded state of a trigger', async () => {
    const trigger = await loader.getHarness(AccordionTriggerHarness.with({text: 'Section 1'}));
    expect(await trigger.isExpanded()).toBeFalse();

    await trigger.click();
    expect(await trigger.isExpanded()).toBeTrue();
  });

  it('should filter triggers by disabled state', async () => {
    const disabledTriggers = await loader.getAllHarnesses(
      AccordionTriggerHarness.with({disabled: true}),
    );
    expect(disabledTriggers.length).toBe(1);
    expect(await disabledTriggers[0].getText()).toBe('Section 2');
  });

  it('should filter triggers by expanded state', async () => {
    const trigger = await loader.getHarness(AccordionTriggerHarness.with({text: 'Section 1'}));
    await trigger.click();

    const expandedTriggers = await loader.getAllHarnesses(
      AccordionTriggerHarness.with({expanded: true}),
    );
    expect(expandedTriggers.length).toBe(1);
    expect(await expandedTriggers[0].getText()).toBe('Section 1');
  });

  it('should find the panel associated with a specific trigger', async () => {
    const trigger = await loader.getHarness(AccordionTriggerHarness.with({text: 'Section 1'}));
    const panel = await loader.getHarness(AccordionPanelHarness.with({trigger}));

    expect(await panel.getText()).toBe('Content 1');
  });

  it('should correctly report the expanded state of an accordion panel', async () => {
    const trigger = await loader.getHarness(AccordionTriggerHarness.with({text: 'Section 1'}));
    const panel = await loader.getHarness(AccordionPanelHarness.with({trigger}));

    expect(await panel.isExpanded()).toBeFalse();

    await trigger.click();
    expect(await panel.isExpanded()).toBeTrue();
  });

  it('should find accordion group and list scoped triggers and panels', async () => {
    const group = await loader.getHarness(AccordionGroupHarness);
    const triggers = await group.getTriggers();
    const panels = await group.getPanels();

    expect(triggers.length).toBe(2);
    expect(panels.length).toBe(2);
  });
});
