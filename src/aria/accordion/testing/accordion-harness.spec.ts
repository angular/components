/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComponentHarness} from '@angular/cdk/testing';
import {AccordionHarness, AccordionGroupHarness} from './accordion-harness';
import {AccordionGroup, AccordionPanel, AccordionTrigger} from '../index';
import {AccordionContent} from '../accordion-content';

/** Lightweight test harness to test querying inside the accordion body panel. */
class TestButtonHarness extends ComponentHarness {
  static hostSelector = 'button.test-button';

  async getText(): Promise<string> {
    return (await this.host()).text();
  }
}

describe('Accordion Harnesses', () => {
  let fixture: any;
  let loader: any;

  @Component({
    imports: [AccordionGroup, AccordionPanel, AccordionTrigger, AccordionContent],
    template: `
      <div ngAccordionGroup>
        <div #panel1="ngAccordionPanel" ngAccordionPanel>
          <button class="test-button">Inside Content 1</button>
        </div>
        <button ngAccordionTrigger [panel]="panel1">Section 1</button>

        <div #panel2="ngAccordionPanel" ngAccordionPanel>Content 2</div>
        <button ngAccordionTrigger [panel]="panel2" disabled>Section 2</button>

        <div #panel3="ngAccordionPanel" ngAccordionPanel>
          <ng-template ngAccordionContent>
            <button class="test-button">Inside Content 3</button>
          </ng-template>
        </div>
        <button ngAccordionTrigger [panel]="panel3" id="custom-id-3">Section 3</button>
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

  it('should find accordion group and list all scoped accordions using getAccordions', async () => {
    const group = await loader.getHarness(AccordionGroupHarness);
    const accordions = await group.getAccordions();

    expect(accordions.length).toBe(3);
    expect(await accordions[0].getTitle()).toBe('Section 1');
    expect(await accordions[1].getTitle()).toBe('Section 2');
  });

  it('should find all individual accordions via standard root loader', async () => {
    const accordions = await loader.getAllHarnesses(AccordionHarness);
    expect(accordions.length).toBe(3);
  });

  it('should filter accordions by title', async () => {
    const accordions = await loader.getAllHarnesses(AccordionHarness.with({title: 'Section 1'}));
    expect(accordions.length).toBe(1);
    expect(await accordions[0].getTitle()).toBe('Section 1');
  });

  it('should filter accordions by expanded state', async () => {
    const accordion = await loader.getHarness(AccordionHarness.with({title: 'Section 1'}));
    await accordion.expand();

    const expandedAccordions = await loader.getAllHarnesses(
      AccordionHarness.with({expanded: true}),
    );
    expect(expandedAccordions.length).toBe(1);
    expect(await expandedAccordions[0].getTitle()).toBe('Section 1');
  });

  it('should filter accordions by disabled state', async () => {
    const disabledAccordions = await loader.getAllHarnesses(
      AccordionHarness.with({disabled: true}),
    );
    expect(disabledAccordions.length).toBe(1);
    expect(await disabledAccordions[0].getTitle()).toBe('Section 2');
  });

  it('should get the title of the accordion', async () => {
    const accordion = await loader.getHarness(AccordionHarness.with({title: 'Section 1'}));
    expect(await accordion.getTitle()).toBe('Section 1');
  });

  it('should correctly report the expanded state of an accordion', async () => {
    const accordion = await loader.getHarness(AccordionHarness.with({title: 'Section 1'}));
    expect(await accordion.isExpanded()).toBeFalse();
  });

  it('should correctly report the disabled state of an accordion', async () => {
    const activeAccordion = await loader.getHarness(AccordionHarness.with({title: 'Section 1'}));
    const disabledAccordion = await loader.getHarness(AccordionHarness.with({title: 'Section 2'}));

    expect(await activeAccordion.isDisabled()).toBeFalse();
    expect(await disabledAccordion.isDisabled()).toBeTrue();
  });

  it('expands a collapsed accordion using the expand method', async () => {
    const accordion = await loader.getHarness(AccordionHarness.with({title: 'Section 1'}));

    await accordion.expand();

    expect(await accordion.isExpanded()).toBeTrue();
  });

  it('collapses an expanded accordion using the collapse method', async () => {
    const accordion = await loader.getHarness(AccordionHarness.with({title: 'Section 1'}));
    await accordion.expand();

    await accordion.collapse();

    expect(await accordion.isExpanded()).toBeFalse();
  });

  it('toggles the expanded state of an accordion using the toggle method', async () => {
    const accordion = await loader.getHarness(AccordionHarness.with({title: 'Section 1'}));

    await accordion.toggle();

    expect(await accordion.isExpanded()).toBeTrue();
  });

  it('should support focusing and blurring accordion triggers', async () => {
    const accordion = await loader.getHarness(AccordionHarness.with({title: 'Section 1'}));
    await accordion.focus();
    expect(await accordion.isFocused()).toBeTrue();

    await accordion.blur();
    expect(await accordion.isFocused()).toBeFalse();
  });

  it('should query components inside the accordion panel using ContentContainerComponentHarness', async () => {
    const accordion = await loader.getHarness(AccordionHarness.with({title: 'Section 1'}));
    const button = await accordion.getHarness(TestButtonHarness);
    expect(await button.getText()).toBe('Inside Content 1');
  });

  it('should filter accordions by id', async () => {
    const accordions = await loader.getAllHarnesses(AccordionHarness.with({id: 'custom-id-3'}));
    expect(accordions.length).toBe(1);
    expect(await accordions[0].getTitle()).toBe('Section 3');
  });
});
