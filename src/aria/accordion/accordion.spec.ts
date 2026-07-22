import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {provideFakeDirectionality, runAccessibilityChecks} from '@angular/cdk/testing/private';
import {_IdGenerator} from '@angular/cdk/a11y';
import {waitForMicrotasks} from '../private/testing/test-helpers';
import {AccordionPanel} from './accordion-panel';
import {AccordionTrigger} from './accordion-trigger';
import {AccordionContent} from './accordion-content';
import {AccordionGroup} from './accordion-group';

describe('AccordionGroup', () => {
  let fixture: ComponentFixture<AccordionGroupWithLoop>;
  let testComponent: AccordionGroupWithLoop;
  let groupElement: HTMLElement;

  let triggerElements: HTMLElement[];
  let panelElements: HTMLElement[];

  const click = async (target: HTMLElement) => {
    target.dispatchEvent(new PointerEvent('click', {bubbles: true}));
    await fixture.whenStable();
  };

  const keydown = async (key: string, target = groupElement) => {
    target.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, key}));
    await fixture.whenStable();
  };

  const spaceKey = async (target: HTMLElement) => await keydown(' ', target);
  const enterKey = async (target: HTMLElement) => await keydown('Enter', target);
  const downArrowKey = async () => await keydown('ArrowDown');
  const upArrowKey = async () => await keydown('ArrowUp');
  const homeKey = async () => await keydown('Home');
  const endKey = async () => await keydown('End');

  async function setupAccordionGroup() {
    testComponent = fixture.componentInstance as AccordionGroupWithLoop;
    groupElement = fixture.nativeElement.querySelector('[ngAccordionGroup]') as HTMLElement;

    await setupTriggerAndPanels();
  }

  async function setupTriggerAndPanels() {
    await fixture.whenStable();

    const triggerDebugElements = fixture.debugElement.queryAll(By.directive(AccordionTrigger));
    const panelDebugElements = fixture.debugElement.queryAll(By.directive(AccordionPanel));

    triggerElements = triggerDebugElements.map(el => el.nativeElement);
    panelElements = panelDebugElements.map(el => el.nativeElement);
  }

  const isTriggerActive = (index: number) =>
    triggerElements[index].getAttribute('data-active') === 'true';
  const isTriggerExpanded = (index: number) =>
    triggerElements[index].getAttribute('aria-expanded') === 'true';

  const getTriggerAttribute = (index: number, attribute: string) =>
    triggerElements[index].getAttribute(attribute);

  const getPanelAttribute = (index: number, attribute: string) =>
    panelElements[index].getAttribute(attribute);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideFakeDirectionality('ltr'), _IdGenerator],
    });
  });

  afterEach(async () => {
    await runAccessibilityChecks(fixture.nativeElement);
  });

  describe('using a loop', () => {
    beforeEach(async () => {
      fixture = TestBed.createComponent(AccordionGroupWithLoop);

      await setupAccordionGroup();
    });

    describe('ARIA attributes and roles', () => {
      describe('AccordionTrigger', () => {
        it('should have role="button"', () => {
          expect(getTriggerAttribute(0, 'role')).toBe('button');
          expect(getTriggerAttribute(1, 'role')).toBe('button');
          expect(getTriggerAttribute(2, 'role')).toBe('button');
        });

        it('should set type="button" by default on buttons', () => {
          expect(getTriggerAttribute(0, 'type')).toBe('button');
          expect(getTriggerAttribute(1, 'type')).toBe('button');
          expect(getTriggerAttribute(2, 'type')).toBe('button');
        });

        it('should have aria-expanded="false" when collapsed', () => {
          expect(getTriggerAttribute(0, 'aria-expanded')).toBe('false');
          expect(getTriggerAttribute(1, 'aria-expanded')).toBe('false');
          expect(getTriggerAttribute(2, 'aria-expanded')).toBe('false');
        });

        it('should have aria-controls pointing to the panel id', () => {
          expect(getTriggerAttribute(0, 'aria-controls')).toBe(panelElements[0].id);
          expect(getTriggerAttribute(1, 'aria-controls')).toBe(panelElements[1].id);
          expect(getTriggerAttribute(2, 'aria-controls')).toBe(panelElements[2].id);
        });

        it('should have aria-disabled="false" when not disabled', () => {
          expect(getTriggerAttribute(0, 'aria-disabled')).toBe('false');
          expect(getTriggerAttribute(1, 'aria-disabled')).toBe('false');
          expect(getTriggerAttribute(2, 'aria-disabled')).toBe('false');
        });

        it('should set aria-disabled="true" if trigger is disabled', async () => {
          testComponent.disableItem('item-1', true);
          await fixture.whenStable();

          expect(getTriggerAttribute(0, 'aria-disabled')).toBe('true');
          expect(getTriggerAttribute(1, 'aria-disabled')).toBe('false');
          expect(getTriggerAttribute(2, 'aria-disabled')).toBe('false');
        });
      });

      describe('AccordionPanel', () => {
        it('should have role="region"', () => {
          expect(getPanelAttribute(0, 'role')).toBe('region');
          expect(getPanelAttribute(1, 'role')).toBe('region');
          expect(getPanelAttribute(2, 'role')).toBe('region');
        });

        it('should have aria-labelledby pointing to the trigger id', () => {
          expect(getPanelAttribute(0, 'aria-labelledby')).toBe(getTriggerAttribute(0, 'id'));
          expect(getPanelAttribute(1, 'aria-labelledby')).toBe(getTriggerAttribute(1, 'id'));
          expect(getPanelAttribute(2, 'aria-labelledby')).toBe(getTriggerAttribute(2, 'id'));
        });

        it('should have "inert" attribute when collapsed', () => {
          expect(getPanelAttribute(0, 'inert')).toBe('true');
          expect(getPanelAttribute(1, 'inert')).toBe('true');
          expect(getPanelAttribute(2, 'inert')).toBe('true');
        });
      });
    });

    describe('Expansion behavior', () => {
      describe('single expansion mode (multiExpandable=false)', () => {
        it('should expand panel on trigger click and update expanded panels', async () => {
          await click(triggerElements[0]);
          expect(isTriggerExpanded(0)).toBeTrue();
          expect(panelElements[0].getAttribute('inert')).toBe(null);
        });

        it('should collapes panel on trigger click and update expanded panels', async () => {
          await click(triggerElements[0]);
          await click(triggerElements[0]); // Collapse
          expect(isTriggerExpanded(0)).toBeFalse();
          expect(panelElements[0].getAttribute('inert')).toBe('true');
        });

        it('should expand one and collapse others', async () => {
          await click(triggerElements[0]);
          expect(isTriggerExpanded(0)).toBeTrue();

          await click(triggerElements[1]);
          expect(isTriggerExpanded(0)).toBeFalse();
          expect(panelElements[0].getAttribute('inert')).toBe('true');
          expect(isTriggerExpanded(1)).toBeTrue();
          expect(panelElements[1].getAttribute('inert')).toBe(null);
        });

        it('should allow setting initial value', async () => {
          testComponent.expandItem('item-2', true);
          await fixture.whenStable();

          expect(isTriggerExpanded(0)).toBeFalse();
          expect(isTriggerExpanded(1)).toBeTrue();
          expect(isTriggerExpanded(2)).toBeFalse();
        });
      });

      describe('multiple expansion mode (multiExpandable=true)', () => {
        beforeEach(async () => {
          testComponent.multiExpandable.set(true);
          await fixture.whenStable();
        });

        it('should expand multiple panels', async () => {
          await click(triggerElements[0]);
          expect(isTriggerExpanded(0)).toBeTrue();

          await click(triggerElements[1]);
          expect(isTriggerExpanded(0)).toBeTrue();
          expect(isTriggerExpanded(1)).toBeTrue();
        });

        it('should collapse an item without affecting others', async () => {
          await click(triggerElements[0]);
          await click(triggerElements[1]);
          expect(isTriggerExpanded(0)).toBeTrue();
          expect(isTriggerExpanded(1)).toBeTrue();

          await click(triggerElements[0]);
          expect(isTriggerExpanded(0)).toBeFalse();
          expect(isTriggerExpanded(1)).toBeTrue();
        });

        it('should allow setting initial multiple values', async () => {
          testComponent.expandItem('item-1', true);
          testComponent.expandItem('item-3', true);
          await fixture.whenStable();

          expect(isTriggerExpanded(0)).toBeTrue();
          expect(isTriggerExpanded(1)).toBeFalse();
          expect(isTriggerExpanded(2)).toBeTrue();
        });
      });

      describe('disabled items and group', () => {
        it('should not expand a disabled trigger', async () => {
          testComponent.disableItem('item-1', true);
          await fixture.whenStable();

          await click(triggerElements[0]);
          expect(isTriggerExpanded(0)).toBeFalse();
          expect(triggerElements[0].getAttribute('aria-disabled')).toBe('true');
        });

        it('should not expand any trigger if group is disabled', async () => {
          testComponent.disabledGroup.set(true);
          await fixture.whenStable();

          await click(triggerElements[0]);
          expect(isTriggerExpanded(0)).toBeFalse();

          await click(triggerElements[1]);
          expect(isTriggerExpanded(1)).toBeFalse();
        });
      });
    });

    describe('Keyboard navigation and interaction', () => {
      beforeEach(async () => {
        // Focus on the first trigger as initial state.
        triggerElements[0].focus();
        await fixture.whenStable();
        expect(isTriggerActive(0)).toBeTrue();
      });

      it('should focus next trigger with ArrowDown', async () => {
        await downArrowKey();

        expect(isTriggerActive(0)).toBeFalse();
        expect(isTriggerActive(1)).toBeTrue();
      });

      it('should focus previous trigger with ArrowUp', async () => {
        await downArrowKey();
        expect(isTriggerActive(1)).toBeTrue();

        await upArrowKey();
        expect(isTriggerActive(1)).toBeFalse();
        expect(isTriggerActive(0)).toBeTrue();
      });

      it('should focus first trigger with Home when another item is focused', async () => {
        await downArrowKey();
        await downArrowKey();

        expect(isTriggerActive(2)).toBeTrue();

        await homeKey();
        expect(isTriggerActive(0)).toBeTrue();
      });

      it('should focus last trigger with End', async () => {
        await endKey();

        expect(isTriggerActive(2)).toBeTrue();
      });

      it('should toggle expansion of focused trigger with Enter', async () => {
        expect(isTriggerExpanded(0)).toBeFalse();

        await enterKey(triggerElements[0]);
        expect(isTriggerExpanded(0)).toBeTrue();

        await enterKey(triggerElements[0]);
        expect(isTriggerExpanded(0)).toBeFalse();
      });

      it('should toggle expansion of focused trigger with Space', async () => {
        expect(isTriggerExpanded(0)).toBeFalse();

        await spaceKey(triggerElements[0]);
        expect(isTriggerExpanded(0)).toBeTrue();

        await spaceKey(triggerElements[0]);
        expect(isTriggerExpanded(0)).toBeFalse();
      });

      it('should update collection order when items are shuffled', async () => {
        // Verify initial DOM order
        expect(triggerElements.length).toBe(3);
        expect(triggerElements[0].textContent?.trim()).toBe('Item 1 Header');
        expect(triggerElements[2].textContent?.trim()).toBe('Item 3 Header');

        // Shuffle (reverse) data
        const items = testComponent.items().reverse();
        testComponent.items.set([...items]);
        await fixture.whenStable();
        await waitForMicrotasks();

        // Re-query elements to check new DOM order
        await setupTriggerAndPanels();

        expect(triggerElements.length).toBe(3);
        expect(triggerElements[0].textContent?.trim()).toBe('Item 3 Header');
        expect(triggerElements[2].textContent?.trim()).toBe('Item 1 Header');
      });

      describe('wrap behavior', () => {
        it('should wrap to first on ArrowDown from last if wrap=true', async () => {
          testComponent.wrap.set(true);
          await fixture.whenStable();

          await endKey();
          expect(isTriggerActive(2)).toBeTrue();

          await downArrowKey();
          expect(isTriggerActive(0)).toBeTrue();
        });

        it('should not wrap on ArrowDown from last if wrap=false', async () => {
          testComponent.wrap.set(false);
          await fixture.whenStable();

          await endKey();
          expect(isTriggerActive(2)).toBeTrue();

          await downArrowKey();
          expect(isTriggerActive(2)).toBeTrue();
        });

        it('should wrap to last on ArrowUp from first if wrap=true', async () => {
          testComponent.wrap.set(true);
          await fixture.whenStable();

          expect(isTriggerActive(0)).toBeTrue();

          await upArrowKey();
          expect(isTriggerActive(2)).toBeTrue();
        });

        it('should not wrap on ArrowUp from first if wrap=false', async () => {
          testComponent.wrap.set(false);
          await fixture.whenStable();

          expect(isTriggerActive(0)).toBeTrue();

          await upArrowKey();
          expect(isTriggerActive(0)).toBeTrue();
        });
      });

      describe('softDisabled behavior', () => {
        it('should skip disabled items if softDisabled=false', async () => {
          testComponent.softDisabled.set(false);
          testComponent.disableItem('item-2');
          await fixture.whenStable();

          expect(isTriggerActive(0)).toBeTrue();

          await downArrowKey();
          expect(isTriggerActive(2)).toBeTrue();
        });

        it('should focus disabled items if softDisabled=true', async () => {
          testComponent.softDisabled.set(true);
          testComponent.disableItem('item-2');

          expect(isTriggerActive(0)).toBeTrue();

          await downArrowKey();
          expect(isTriggerActive(1)).toBeTrue();

          await enterKey(triggerElements[1]);
          expect(isTriggerExpanded(1)).toBeFalse();
        });
      });

      it('should not allow keyboard navigation if group is disabled', async () => {
        testComponent.disabledGroup.set(true);
        await fixture.whenStable();

        await downArrowKey();
        expect(isTriggerActive(1)).toBeFalse();
      });

      it('should not allow expansion if group is disabled', async () => {
        testComponent.disabledGroup.set(true);
        await fixture.whenStable();

        await enterKey(triggerElements[0]);
        expect(isTriggerExpanded(0)).toBeFalse();
      });
    });
  });

  describe('using an if', () => {
    let testComponent: AccordionGroupWithIfs;

    beforeEach(async () => {
      fixture = TestBed.createComponent(AccordionGroupWithIfs);
      testComponent = fixture.componentInstance as AccordionGroupWithIfs;
      groupElement = fixture.nativeElement.querySelector('[ngAccordionGroup]') as HTMLElement;

      await setupTriggerAndPanels();
    });

    describe('Keyboard navigation and interaction', () => {
      beforeEach(async () => {
        // Focus on the first trigger as initial state.
        triggerElements[0].focus();
        await fixture.whenStable();
        expect(isTriggerActive(0)).toBeTrue();
      });

      it('should change focus between first and last triggers when second removed', async () => {
        testComponent.includeSecond.set(false);
        await fixture.whenStable();

        await downArrowKey();
        expect(isTriggerActive(0)).toBeFalse();
        expect(isTriggerActive(2)).toBeTrue();

        await upArrowKey();
        expect(isTriggerActive(2)).toBeFalse();
        expect(isTriggerActive(0)).toBeTrue();
      });

      it('should focus second trigger with Home when first is removed', async () => {
        triggerElements[2].focus();
        testComponent.includeFirst.set(false);
        await fixture.whenStable();

        await homeKey();
        expect(isTriggerActive(0)).toBeTrue();
      });

      it('should focus second trigger with End when last is removed', async () => {
        triggerElements[0].focus();
        testComponent.includeThird.set(false);
        await fixture.whenStable();

        await endKey();
        expect(isTriggerActive(1)).toBeTrue();
      });

      it('should iterate focus through all 3 in order when replaced ', async () => {
        testComponent.includeFirst.set(false);
        testComponent.includeSecond.set(false);
        testComponent.includeThird.set(false);
        await fixture.whenStable();

        testComponent.includeThird.set(true);
        testComponent.includeFirst.set(true);
        testComponent.includeSecond.set(true);
        await setupTriggerAndPanels();

        triggerElements[0].focus();
        await fixture.whenStable();

        expect(isTriggerActive(0)).toBeTrue();

        await downArrowKey();
        expect(isTriggerActive(0)).toBeFalse();
        expect(isTriggerActive(1)).toBeTrue();

        await downArrowKey();
        expect(isTriggerActive(1)).toBeFalse();
        expect(isTriggerActive(2)).toBeTrue();

        await downArrowKey();
        expect(isTriggerActive(2)).toBeFalse();
        expect(isTriggerActive(0)).toBeTrue();
      });
    });
  });

  describe('structural validations', () => {
    let consoleSpy: jasmine.Spy;

    beforeEach(() => {
      consoleSpy = spyOn(console, 'warn');
    });

    afterEach(async () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [AccordionGroupWithLoop],
        providers: [provideFakeDirectionality('ltr'), _IdGenerator],
      });
      fixture = TestBed.createComponent(AccordionGroupWithLoop);
      await setupAccordionGroup();
    });

    it('should warn when multiple triggers control the same panel', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [AccordionWithDuplicateTriggers],
      });
      const duplicateFixture = TestBed.createComponent(AccordionWithDuplicateTriggers);
      duplicateFixture.detectChanges();

      expect(consoleSpy).toHaveBeenCalledWith(
        'ngAccordionPanel is already controlled by another ngAccordionTrigger.',
      );
    });

    it('should warn when trigger is nested inside its controlled panel', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [AccordionWithNestedTrigger],
      });
      const nestedFixture = TestBed.createComponent(AccordionWithNestedTrigger);
      nestedFixture.detectChanges();

      expect(consoleSpy).toHaveBeenCalledWith(
        'ngAccordionTrigger must not be nested inside its controlled ngAccordionPanel, otherwise it will become unreachable when collapsed.',
      );
    });

    it('should warn when ngAccordionPanel is missing ngAccordionContent', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [AccordionPanelWithoutContent],
      });
      const noContentFixture = TestBed.createComponent(AccordionPanelWithoutContent);
      noContentFixture.detectChanges();

      expect(consoleSpy).toHaveBeenCalledWith(
        'ngAccordionPanel must have an ngAccordionContent to render.',
      );
    });

    it('should warn when ngAccordionPanel is missing controlling trigger', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [AccordionPanelWithoutTrigger],
      });
      const noTriggerFixture = TestBed.createComponent(AccordionPanelWithoutTrigger);
      noTriggerFixture.detectChanges();

      expect(consoleSpy).toHaveBeenCalledWith(
        'ngAccordionPanel must have an ngAccordionTrigger to control it.',
      );
    });

    it('should warn when multiple items are expanded in single-expand mode', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [AccordionWithMultipleExpandedItems],
      });
      const multipleExpandedFixture = TestBed.createComponent(AccordionWithMultipleExpandedItems);
      multipleExpandedFixture.detectChanges();

      expect(consoleSpy).toHaveBeenCalledWith(
        'ngAccordionGroup has multiExpandable set to false, but multiple ngAccordionTrigger panels are initially expanded.',
      );
    });
  });
});

@Component({
  template: `
    <div
      ngAccordionGroup
      [multiExpandable]="multiExpandable()"
      [disabled]="disabledGroup()"
      [softDisabled]="softDisabled()"
      [wrap]="wrap()"
    >
      @for (item of items(); track item.panelId) {
        <div>
          <button
            ngAccordionTrigger
            [panel]="panel"
            [disabled]="item.disabled()"
            [(expanded)]="item.expanded"
          >{{ item.header }}</button>
          <div
            ngAccordionPanel
            #panel="ngAccordionPanel"
          >
            <ng-template ngAccordionContent>
              {{ item.content }}
            </ng-template>
          </div>
        </div>
      }
    </div>
  `,
  imports: [AccordionGroup, AccordionTrigger, AccordionPanel, AccordionContent],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class AccordionGroupWithLoop {
  items = signal([
    {
      panelId: 'item-1',
      header: 'Item 1 Header',
      content: 'Item 1 Content',
      disabled: signal(false),
      expanded: signal(false),
    },
    {
      panelId: 'item-2',
      header: 'Item 2 Header',
      content: 'Item 2 Content',
      disabled: signal(false),
      expanded: signal(false),
    },
    {
      panelId: 'item-3',
      header: 'Item 3 Header',
      content: 'Item 3 Content',
      disabled: signal(false),
      expanded: signal(false),
    },
  ]);

  multiExpandable = signal(false);
  disabledGroup = signal(false);
  softDisabled = signal(true);
  wrap = signal(false);

  disableItem(itemValue: string, disabled = true) {
    this.items()
      .find(item => item.panelId === itemValue)
      ?.disabled.set(disabled);
  }

  expandItem(itemValue: string, expanded = true) {
    this.items()
      .find(item => item.panelId === itemValue)
      ?.expanded.set(expanded);
  }
}

@Component({
  template: `
    <div ngAccordionGroup [wrap]="true">
      @if (includeFirst()) {
        <div>
          <button ngAccordionTrigger [panel]="panel1">
            Item 1 Header
          </button>
          <div ngAccordionPanel #panel1="ngAccordionPanel">
            <ng-template ngAccordionContent>
              Item 1 Content
            </ng-template>
          </div>
        </div>
      }
      @if (includeSecond()) {
        <div>
          <button ngAccordionTrigger [panel]="panel2">
            Item 2 Header
          </button>
          <div ngAccordionPanel #panel2="ngAccordionPanel">
            <ng-template ngAccordionContent>
              Item 2 Content
            </ng-template>
          </div>
        </div>
      }
      @if (includeThird()) {
        <div>
          <button ngAccordionTrigger [panel]="panel3">
            Item 3 Header
          </button>
          <div ngAccordionPanel #panel3="ngAccordionPanel">
            <ng-template ngAccordionContent>
              Item 3 Content
            </ng-template>
          </div>
        </div>
      }
    </div>
  `,
  imports: [AccordionGroup, AccordionTrigger, AccordionPanel, AccordionContent],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class AccordionGroupWithIfs extends AccordionGroupWithLoop {
  includeFirst = signal(true);
  includeSecond = signal(true);
  includeThird = signal(true);
}

@Component({
  template: `
    <div ngAccordionGroup>
      <button ngAccordionTrigger [panel]="panel1">Trigger 1</button>
      <button ngAccordionTrigger [panel]="panel1">Trigger 2</button>
      <div ngAccordionPanel #panel1="ngAccordionPanel">
        <ng-template ngAccordionContent>Content</ng-template>
      </div>
    </div>
  `,
  imports: [AccordionGroup, AccordionTrigger, AccordionPanel, AccordionContent],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class AccordionWithDuplicateTriggers {}

@Component({
  template: `
    <div ngAccordionGroup>
      <div ngAccordionPanel #panel1="ngAccordionPanel">
        <button ngAccordionTrigger [panel]="panel1">Nested Trigger</button>
        <ng-template ngAccordionContent>Content</ng-template>
      </div>
    </div>
  `,
  imports: [AccordionGroup, AccordionTrigger, AccordionPanel, AccordionContent],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class AccordionWithNestedTrigger {}

@Component({
  template: `
    <div ngAccordionGroup>
      <button ngAccordionTrigger [panel]="panel1">Trigger</button>
      <div ngAccordionPanel #panel1="ngAccordionPanel">
        Content
      </div>
    </div>
  `,
  imports: [AccordionGroup, AccordionTrigger, AccordionPanel],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class AccordionPanelWithoutContent {}

@Component({
  template: `
    <div ngAccordionGroup>
      <div ngAccordionPanel>
        <ng-template ngAccordionContent>Content</ng-template>
      </div>
    </div>
  `,
  imports: [AccordionGroup, AccordionPanel, AccordionContent],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class AccordionPanelWithoutTrigger {}

@Component({
  template: `
    <div ngAccordionGroup [multiExpandable]="false">
      <div>
        <button ngAccordionTrigger [panel]="panel1" [expanded]="true">Trigger 1</button>
        <div ngAccordionPanel #panel1="ngAccordionPanel">
          <ng-template ngAccordionContent>Content 1</ng-template>
        </div>
      </div>
      <div>
        <button ngAccordionTrigger [panel]="panel2" [expanded]="true">Trigger 2</button>
        <div ngAccordionPanel #panel2="ngAccordionPanel">
          <ng-template ngAccordionContent>Content 2</ng-template>
        </div>
      </div>
    </div>
  `,
  imports: [AccordionGroup, AccordionTrigger, AccordionPanel, AccordionContent],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class AccordionWithMultipleExpandedItems {}
