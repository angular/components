import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {provideFakeDirectionality, runAccessibilityChecks} from '@angular/cdk/testing/private';
import {_IdGenerator} from '@angular/cdk/a11y';
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

  const click = (target: HTMLElement) => {
    target.dispatchEvent(new PointerEvent('click', {bubbles: true}));
    fixture.detectChanges();
  };

  const keydown = (key: string, target = groupElement) => {
    target.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, key}));
    fixture.detectChanges();
  };

  const spaceKey = (target: HTMLElement) => keydown(' ', target);
  const enterKey = (target: HTMLElement) => keydown('Enter', target);
  const downArrowKey = () => keydown('ArrowDown');
  const upArrowKey = () => keydown('ArrowUp');
  const homeKey = () => keydown('Home');
  const endKey = () => keydown('End');

  function setupAccordionGroup() {
    testComponent = fixture.componentInstance as AccordionGroupWithLoop;
    groupElement = fixture.nativeElement.querySelector('[ngAccordionGroup]') as HTMLElement;

    setupTriggerAndPanels();
  }

  function setupTriggerAndPanels() {
    fixture.detectChanges();

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
  const getTriggerText = (index: number) => triggerElements[index].textContent?.trim();

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
    beforeEach(() => {
      fixture = TestBed.createComponent(AccordionGroupWithLoop);

      setupAccordionGroup();
    });

    describe('ARIA attributes and roles', () => {
      describe('AccordionTrigger', () => {
        it('should have role="button"', () => {
          expect(getTriggerAttribute(0, 'role')).toBe('button');
          expect(getTriggerAttribute(1, 'role')).toBe('button');
          expect(getTriggerAttribute(2, 'role')).toBe('button');
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

        it('should set aria-disabled="true" if trigger is disabled', () => {
          testComponent.disableItem('item-1', true);
          fixture.detectChanges();

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
        it('should expand panel on trigger click and update expanded panels', () => {
          click(triggerElements[0]);
          expect(isTriggerExpanded(0)).toBeTrue();
          expect(panelElements[0].getAttribute('inert')).toBe(null);
        });

        it('should collapes panel on trigger click and update expanded panels', () => {
          click(triggerElements[0]);
          click(triggerElements[0]); // Collapse
          expect(isTriggerExpanded(0)).toBeFalse();
          expect(panelElements[0].getAttribute('inert')).toBe('true');
        });

        it('should expand one and collapse others', () => {
          click(triggerElements[0]);
          expect(isTriggerExpanded(0)).toBeTrue();

          click(triggerElements[1]);
          expect(isTriggerExpanded(0)).toBeFalse();
          expect(panelElements[0].getAttribute('inert')).toBe('true');
          expect(isTriggerExpanded(1)).toBeTrue();
          expect(panelElements[1].getAttribute('inert')).toBe(null);
        });

        it('should allow setting initial value', () => {
          testComponent.expandItem('item-2', true);
          fixture.detectChanges();

          expect(isTriggerExpanded(0)).toBeFalse();
          expect(isTriggerExpanded(1)).toBeTrue();
          expect(isTriggerExpanded(2)).toBeFalse();
        });
      });

      describe('multiple expansion mode (multiExpandable=true)', () => {
        beforeEach(() => {
          testComponent.multiExpandable.set(true);
          fixture.detectChanges();
        });

        it('should expand multiple panels', () => {
          click(triggerElements[0]);
          expect(isTriggerExpanded(0)).toBeTrue();

          click(triggerElements[1]);
          expect(isTriggerExpanded(0)).toBeTrue();
          expect(isTriggerExpanded(1)).toBeTrue();
        });

        it('should collapse an item without affecting others', () => {
          click(triggerElements[0]);
          click(triggerElements[1]);
          expect(isTriggerExpanded(0)).toBeTrue();
          expect(isTriggerExpanded(1)).toBeTrue();

          click(triggerElements[0]);
          expect(isTriggerExpanded(0)).toBeFalse();
          expect(isTriggerExpanded(1)).toBeTrue();
        });

        it('should allow setting initial multiple values', () => {
          testComponent.expandItem('item-1', true);
          testComponent.expandItem('item-3', true);
          fixture.detectChanges();

          expect(isTriggerExpanded(0)).toBeTrue();
          expect(isTriggerExpanded(1)).toBeFalse();
          expect(isTriggerExpanded(2)).toBeTrue();
        });
      });

      describe('disabled items and group', () => {
        it('should not expand a disabled trigger', () => {
          testComponent.disableItem('item-1', true);
          fixture.detectChanges();

          click(triggerElements[0]);
          expect(isTriggerExpanded(0)).toBeFalse();
          expect(triggerElements[0].getAttribute('aria-disabled')).toBe('true');
        });

        it('should not expand any trigger if group is disabled', () => {
          testComponent.disabledGroup.set(true);
          fixture.detectChanges();

          click(triggerElements[0]);
          expect(isTriggerExpanded(0)).toBeFalse();

          click(triggerElements[1]);
          expect(isTriggerExpanded(1)).toBeFalse();
        });
      });
    });

    describe('Keyboard navigation and interaction', () => {
      beforeEach(() => {
        // Focus on the first trigger as initial state.
        triggerElements[0].focus();
        fixture.detectChanges();
        expect(isTriggerActive(0)).toBeTrue();
      });

      it('should focus next trigger with ArrowDown', () => {
        downArrowKey();

        expect(isTriggerActive(0)).toBeFalse();
        expect(isTriggerActive(1)).toBeTrue();
      });

      it('should focus previous trigger with ArrowUp', () => {
        downArrowKey();
        expect(isTriggerActive(1)).toBeTrue();

        upArrowKey();
        expect(isTriggerActive(1)).toBeFalse();
        expect(isTriggerActive(0)).toBeTrue();
      });

      it('should focus first trigger with Home when another item is focused', () => {
        downArrowKey();
        downArrowKey();

        expect(isTriggerActive(2)).toBeTrue();

        homeKey();
        expect(isTriggerActive(0)).toBeTrue();
      });

      it('should focus last trigger with End', () => {
        endKey();

        expect(isTriggerActive(2)).toBeTrue();
      });

      it('should toggle expansion of focused trigger with Enter', () => {
        expect(isTriggerExpanded(0)).toBeFalse();

        enterKey(triggerElements[0]);
        expect(isTriggerExpanded(0)).toBeTrue();

        enterKey(triggerElements[0]);
        expect(isTriggerExpanded(0)).toBeFalse();
      });

      it('should toggle expansion of focused trigger with Space', () => {
        expect(isTriggerExpanded(0)).toBeFalse();

        spaceKey(triggerElements[0]);
        expect(isTriggerExpanded(0)).toBeTrue();

        spaceKey(triggerElements[0]);
        expect(isTriggerExpanded(0)).toBeFalse();
      });

      describe('with shuffled items', () => {
        it('should focus on new last trigger with End', () => {
          const items = testComponent.items().reverse();
          testComponent.items.set([...items]);
          fixture.detectChanges();

          // Now reversed, End should move to the former first trigger.
          endKey();
          expect(isTriggerActive(0)).toBeTrue();
        });

        it('should focus on newly prepended trigger with Begin', () => {
          const items = testComponent.items();
          items.unshift({
            panelId: 'item-0',
            header: 'Item 0 Header',
            content: 'Item 0 Content',
            disabled: signal(false),
            expanded: signal(false),
          });
          testComponent.items.set([...items]);
          setupTriggerAndPanels();

          homeKey();
          expect(isTriggerActive(0)).toBeTrue();
          expect(getTriggerText(0)).toBe('Item 0 Header');
        });

        it('should focus on newly appended trigger with End', () => {
          const items = testComponent.items();
          items.push({
            panelId: 'item-4',
            header: 'Item 4 Header',
            content: 'Item 4 Content',
            disabled: signal(false),
            expanded: signal(false),
          });
          testComponent.items.set([...items]);
          setupTriggerAndPanels();

          endKey();
          expect(isTriggerActive(3)).toBeTrue();
          expect(getTriggerText(3)).toBe('Item 4 Header');
        });

        it('should focus on inserted trigger with navigation', () => {
          const items = testComponent.items();
          items.splice(2, 0, {
            panelId: 'item-2a',
            header: 'Item 2a Header',
            content: 'Item 2a Content',
            disabled: signal(false),
            expanded: signal(false),
          });
          testComponent.items.set([...items]);
          setupTriggerAndPanels();

          downArrowKey();
          downArrowKey();
          expect(isTriggerActive(2)).toBeTrue();
          expect(triggerElements[2].textContent?.trim()).toBe('Item 2a Header');
        });
      });

      describe('wrap behavior', () => {
        it('should wrap to first on ArrowDown from last if wrap=true', () => {
          testComponent.wrap.set(true);
          fixture.detectChanges();

          endKey();
          expect(isTriggerActive(2)).toBeTrue();

          downArrowKey();
          expect(isTriggerActive(0)).toBeTrue();
        });

        it('should not wrap on ArrowDown from last if wrap=false', () => {
          testComponent.wrap.set(false);
          fixture.detectChanges();

          endKey();
          expect(isTriggerActive(2)).toBeTrue();

          downArrowKey();
          expect(isTriggerActive(2)).toBeTrue();
        });

        it('should wrap to last on ArrowUp from first if wrap=true', () => {
          testComponent.wrap.set(true);
          fixture.detectChanges();

          expect(isTriggerActive(0)).toBeTrue();

          upArrowKey();
          expect(isTriggerActive(2)).toBeTrue();
        });

        it('should not wrap on ArrowUp from first if wrap=false', () => {
          testComponent.wrap.set(false);
          fixture.detectChanges();

          expect(isTriggerActive(0)).toBeTrue();

          upArrowKey();
          expect(isTriggerActive(0)).toBeTrue();
        });
      });

      describe('softDisabled behavior', () => {
        it('should skip disabled items if softDisabled=false', () => {
          testComponent.softDisabled.set(false);
          testComponent.disableItem('item-2');
          fixture.detectChanges();

          expect(isTriggerActive(0)).toBeTrue();

          downArrowKey();
          expect(isTriggerActive(2)).toBeTrue();
        });

        it('should focus disabled items if softDisabled=true', () => {
          testComponent.softDisabled.set(true);
          testComponent.disableItem('item-2');

          expect(isTriggerActive(0)).toBeTrue();

          downArrowKey();
          expect(isTriggerActive(1)).toBeTrue();

          enterKey(triggerElements[1]);
          expect(isTriggerExpanded(1)).toBeFalse();
        });
      });

      it('should not allow keyboard navigation if group is disabled', () => {
        testComponent.disabledGroup.set(true);
        fixture.detectChanges();

        downArrowKey();
        expect(isTriggerActive(1)).toBeFalse();
      });

      it('should not allow expansion if group is disabled', () => {
        testComponent.disabledGroup.set(true);
        fixture.detectChanges();

        enterKey(triggerElements[0]);
        expect(isTriggerExpanded(0)).toBeFalse();
      });
    });
  });

  describe('using an if', () => {
    let testComponent: AccordionGroupWithIfs;

    beforeEach(() => {
      fixture = TestBed.createComponent(AccordionGroupWithIfs);
      testComponent = fixture.componentInstance as AccordionGroupWithIfs;
      groupElement = fixture.nativeElement.querySelector('[ngAccordionGroup]') as HTMLElement;

      setupTriggerAndPanels();
    });

    describe('Keyboard navigation and interaction', () => {
      beforeEach(() => {
        // Focus on the first trigger as initial state.
        triggerElements[0].focus();
        fixture.detectChanges();
        expect(isTriggerActive(0)).toBeTrue();
      });

      it('should change focus between first and last triggers when second removed', () => {
        testComponent.includeSecond.set(false);
        fixture.detectChanges();

        downArrowKey();
        expect(isTriggerActive(0)).toBeFalse();
        expect(isTriggerActive(2)).toBeTrue();

        upArrowKey();
        expect(isTriggerActive(2)).toBeFalse();
        expect(isTriggerActive(0)).toBeTrue();
      });

      it('should focus second trigger with Home when first is removed', () => {
        triggerElements[2].focus();
        testComponent.includeFirst.set(false);
        fixture.detectChanges();

        homeKey();
        expect(isTriggerActive(0)).toBeTrue();
      });

      it('should focus second trigger with End when last is removed', () => {
        triggerElements[0].focus();
        testComponent.includeThird.set(false);
        fixture.detectChanges();

        endKey();
        expect(isTriggerActive(1)).toBeTrue();
      });

      it('should iterate focus through all 3 in order when replaced ', () => {
        testComponent.includeFirst.set(false);
        testComponent.includeSecond.set(false);
        testComponent.includeThird.set(false);
        fixture.detectChanges();

        testComponent.includeThird.set(true);
        testComponent.includeFirst.set(true);
        testComponent.includeSecond.set(true);
        setupTriggerAndPanels();

        triggerElements[0].focus();
        fixture.detectChanges();

        expect(isTriggerActive(0)).toBeTrue();

        downArrowKey();
        expect(isTriggerActive(0)).toBeFalse();
        expect(isTriggerActive(1)).toBeTrue();

        downArrowKey();
        expect(isTriggerActive(1)).toBeFalse();
        expect(isTriggerActive(2)).toBeTrue();

        downArrowKey();
        expect(isTriggerActive(2)).toBeFalse();
        expect(isTriggerActive(0)).toBeTrue();
      });
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
            [index]="$index"
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
