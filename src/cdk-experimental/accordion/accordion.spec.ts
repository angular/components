import {Component, DebugElement, signal, model} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {BidiModule} from '@angular/cdk/bidi';
import {provideFakeDirectionality, runAccessibilityChecks} from '@angular/cdk/testing/private';
import {_IdGenerator} from '@angular/cdk/a11y';
import {
  CdkAccordionGroup,
  CdkAccordionTrigger,
  CdkAccordionPanel,
  CdkAccordionContent,
} from './accordion';

describe('CdkAccordionGroup', () => {
  let fixture: ComponentFixture<AccordionGroupExample>;
  let groupDebugElement: DebugElement;
  let triggerDebugElements: DebugElement[];
  let panelDebugElements: DebugElement[];
  let groupInstance: CdkAccordionGroup;
  let triggerElements: HTMLElement[];
  let panelElements: HTMLElement[];

  const keydown = (target: HTMLElement, key: string) => {
    target.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, key}));
    fixture.detectChanges();
  };

  const click = (target: HTMLElement) => {
    target.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}));
    fixture.detectChanges();
  };

  const spaceKey = (target: HTMLElement) => keydown(target, ' ');
  const enterKey = (target: HTMLElement) => keydown(target, 'Enter');
  const downArrowKey = (target: HTMLElement) => keydown(target, 'ArrowDown');
  const upArrowKey = (target: HTMLElement) => keydown(target, 'ArrowUp');
  const homeKey = (target: HTMLElement) => keydown(target, 'Home');
  const endKey = (target: HTMLElement) => keydown(target, 'End');

  interface SetupOptions {
    initialValue?: string[];
    multiExpandable?: boolean;
    disabledGroup?: boolean;
    disabledItemValues?: string[];
    skipDisabled?: boolean;
    wrap?: boolean;
  }

  function configureAccordionComponent(opts: SetupOptions = {}) {
    const testComponent = fixture.componentInstance as AccordionGroupExample;

    if (opts.initialValue !== undefined) {
      testComponent.value.set(opts.initialValue);
    }
    if (opts.multiExpandable !== undefined) {
      testComponent.multiExpandable.set(opts.multiExpandable);
    }
    if (opts.disabledGroup !== undefined) {
      testComponent.disabledGroup.set(opts.disabledGroup);
    }
    if (opts.skipDisabled !== undefined) {
      testComponent.skipDisabled.set(opts.skipDisabled);
    }
    if (opts.wrap !== undefined) {
      testComponent.wrap.set(opts.wrap);
    }
    if (opts.disabledItemValues !== undefined) {
      opts.disabledItemValues.forEach(value => testComponent.disableItem(value, true));
    }

    fixture.detectChanges();
    defineTestVariables(fixture);
  }

  function defineTestVariables(currentFixture: ComponentFixture<AccordionGroupExample>) {
    groupDebugElement = currentFixture.debugElement.query(By.directive(CdkAccordionGroup));
    triggerDebugElements = currentFixture.debugElement.queryAll(By.directive(CdkAccordionTrigger));
    panelDebugElements = currentFixture.debugElement.queryAll(By.directive(CdkAccordionPanel));

    groupInstance = groupDebugElement.injector.get<CdkAccordionGroup>(CdkAccordionGroup);
    triggerElements = triggerDebugElements.map(el => el.nativeElement);
    panelElements = panelDebugElements.map(el => el.nativeElement);
  }

  function isTriggerActive(target: HTMLElement): boolean {
    return target.classList.contains('cdk-active');
  }

  function isTriggerExpanded(target: HTMLElement): boolean {
    return target.getAttribute('aria-expanded') === 'true';
  }

  afterEach(async () => {
    await runAccessibilityChecks(fixture.nativeElement);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideFakeDirectionality('ltr'), _IdGenerator],
      imports: [BidiModule, AccordionGroupExample],
    }).compileComponents();

    fixture = TestBed.createComponent(AccordionGroupExample);
  });

  describe('ARIA attributes and roles', () => {
    describe('CdkAccordionTrigger', () => {
      beforeEach(() => {
        configureAccordionComponent();
      });

      it('should have role="button"', () => {
        expect(triggerElements[0].getAttribute('role')).toBe('button');
        expect(triggerElements[1].getAttribute('role')).toBe('button');
        expect(triggerElements[2].getAttribute('role')).toBe('button');
      });

      it('should have aria-expanded="false" when collapsed', () => {
        configureAccordionComponent({initialValue: []});
        expect(triggerElements[0].getAttribute('aria-expanded')).toBe('false');
        expect(triggerElements[1].getAttribute('aria-expanded')).toBe('false');
        expect(triggerElements[2].getAttribute('aria-expanded')).toBe('false');
      });

      it('should have aria-controls pointing to the panel id', () => {
        expect(triggerElements[0].getAttribute('aria-controls')).toBe(panelElements[0].id);
        expect(triggerElements[1].getAttribute('aria-controls')).toBe(panelElements[1].id);
        expect(triggerElements[2].getAttribute('aria-controls')).toBe(panelElements[2].id);
      });

      it('should have aria-disabled="false" when not disabled', () => {
        configureAccordionComponent({disabledItemValues: []});
        expect(triggerElements[0].getAttribute('aria-disabled')).toBe('false');
        expect(triggerElements[1].getAttribute('aria-disabled')).toBe('false');
        expect(triggerElements[2].getAttribute('aria-disabled')).toBe('false');
      });

      it('should set aria-disabled="true" if trigger is disabled', () => {
        configureAccordionComponent({disabledItemValues: ['item-1']});
        expect(triggerElements[0].getAttribute('aria-disabled')).toBe('true');
        expect(triggerElements[1].getAttribute('aria-disabled')).toBe('false');
        expect(triggerElements[2].getAttribute('aria-disabled')).toBe('false');
      });
    });

    describe('CdkAccordionPanel', () => {
      beforeEach(() => {
        configureAccordionComponent();
      });

      it('should have role="region"', () => {
        expect(panelElements[0].getAttribute('role')).toBe('region');
        expect(panelElements[1].getAttribute('role')).toBe('region');
        expect(panelElements[2].getAttribute('role')).toBe('region');
      });

      it('should have aria-labelledby pointing to the trigger id', () => {
        expect(panelElements[0].getAttribute('aria-labelledby')).toBe(triggerElements[0].id);
        expect(panelElements[1].getAttribute('aria-labelledby')).toBe(triggerElements[1].id);
        expect(panelElements[2].getAttribute('aria-labelledby')).toBe(triggerElements[2].id);
      });

      it('should have "inert" attribute when collapsed', () => {
        configureAccordionComponent({initialValue: []});
        expect(panelElements[0].hasAttribute('inert')).toBeTrue();
        expect(panelElements[1].hasAttribute('inert')).toBeTrue();
        expect(panelElements[2].hasAttribute('inert')).toBeTrue();
      });
    });
  });

  describe('Expansion behavior', () => {
    describe('single expansion mode (multiExpandable=false)', () => {
      beforeEach(() => {
        configureAccordionComponent({multiExpandable: false});
      });

      it('should expand panel on trigger click and update value', () => {
        click(triggerElements[0]);
        expect(isTriggerExpanded(triggerElements[0])).toBeTrue();
        expect(panelElements[0].hasAttribute('inert')).toBeFalse();
        expect(groupInstance.value()).toEqual(['item-1']);
      });

      it('should collapes panel on trigger click and update value', () => {
        click(triggerElements[0]);
        click(triggerElements[0]); // Collapse
        expect(isTriggerExpanded(triggerElements[0])).toBeFalse();
        expect(panelElements[0].hasAttribute('inert')).toBeTrue();
        expect(groupInstance.value()).toEqual([]);
      });

      it('should expand one and collapse others', () => {
        click(triggerElements[0]);
        expect(isTriggerExpanded(triggerElements[0])).toBeTrue();
        expect(groupInstance.value()).toEqual(['item-1']);

        click(triggerElements[1]);
        expect(isTriggerExpanded(triggerElements[0])).toBeFalse();
        expect(panelElements[0].hasAttribute('inert')).toBeTrue();
        expect(isTriggerExpanded(triggerElements[1])).toBeTrue();
        expect(panelElements[1].hasAttribute('inert')).toBeFalse();
        expect(groupInstance.value()).toEqual(['item-2']);
      });

      it('should allow setting initial value', () => {
        configureAccordionComponent({initialValue: ['item-2'], multiExpandable: false});
        expect(isTriggerExpanded(triggerElements[0])).toBeFalse();
        expect(isTriggerExpanded(triggerElements[1])).toBeTrue();
        expect(isTriggerExpanded(triggerElements[2])).toBeFalse();
      });
    });

    describe('multiple expansion mode (multiExpandable=true)', () => {
      beforeEach(() => {
        configureAccordionComponent({multiExpandable: true});
      });

      it('should expand multiple panels', () => {
        click(triggerElements[0]);
        expect(isTriggerExpanded(triggerElements[0])).toBeTrue();

        click(triggerElements[1]);
        expect(isTriggerExpanded(triggerElements[0])).toBeTrue();
        expect(isTriggerExpanded(triggerElements[1])).toBeTrue();
      });

      it('should collapse an item without affecting others', () => {
        click(triggerElements[0]);
        click(triggerElements[1]);
        expect(groupInstance.value()).toEqual(jasmine.arrayWithExactContents(['item-1', 'item-2']));

        click(triggerElements[0]);
        expect(isTriggerExpanded(triggerElements[0])).toBeFalse();
        expect(isTriggerExpanded(triggerElements[1])).toBeTrue();
        expect(groupInstance.value()).toEqual(['item-2']);
      });

      it('should allow setting initial multiple values', () => {
        configureAccordionComponent({initialValue: ['item-1', 'item-3'], multiExpandable: true});
        expect(isTriggerExpanded(triggerElements[0])).toBeTrue();
        expect(isTriggerExpanded(triggerElements[1])).toBeFalse();
        expect(isTriggerExpanded(triggerElements[2])).toBeTrue();
      });
    });

    describe('disabled items and group', () => {
      it('should not expand a disabled trigger', () => {
        configureAccordionComponent({disabledItemValues: ['item-1']});
        click(triggerElements[0]);
        expect(isTriggerExpanded(triggerElements[0])).toBeFalse();
        expect(groupInstance.value()).toEqual([]);
        expect(triggerElements[0].getAttribute('aria-disabled')).toBe('true');
      });

      it('should not expand any trigger if group is disabled', () => {
        configureAccordionComponent({disabledGroup: true});
        click(triggerElements[0]);
        expect(isTriggerExpanded(triggerElements[0])).toBeFalse();
        expect(groupInstance.value()).toEqual([]);
        click(triggerElements[1]);
        expect(isTriggerExpanded(triggerElements[1])).toBeFalse();
      });
    });
  });

  describe('Keyboard navigation and interaction', () => {
    beforeEach(() => {
      configureAccordionComponent({});

      // Focus on the first trigger as initial state.
      triggerElements[0].focus();
      fixture.detectChanges();
      expect(isTriggerActive(triggerElements[0])).toBeTrue();
    });

    it('should focus next trigger with ArrowDown', () => {
      downArrowKey(triggerElements[0]);
      expect(isTriggerActive(triggerElements[0])).toBeFalse();
      expect(isTriggerActive(triggerElements[1])).toBeTrue();
    });

    it('should focus previous trigger with ArrowUp', () => {
      downArrowKey(triggerElements[0]);
      expect(isTriggerActive(triggerElements[1])).toBeTrue();
      upArrowKey(triggerElements[1]);
      expect(isTriggerActive(triggerElements[1])).toBeFalse();
      expect(isTriggerActive(triggerElements[0])).toBeTrue();
    });

    it('should focus first trigger with Home when another item is focused', () => {
      downArrowKey(triggerElements[0]);
      downArrowKey(triggerElements[1]);
      expect(isTriggerActive(triggerElements[2])).toBeTrue();
      homeKey(triggerElements[2]);
      expect(isTriggerActive(triggerElements[0])).toBeTrue();
    });

    it('should focus last trigger with End', () => {
      endKey(triggerElements[0]);
      expect(isTriggerActive(triggerElements[2])).toBeTrue();
    });

    it('should toggle expansion of focused trigger with Enter', () => {
      expect(isTriggerExpanded(triggerElements[0])).toBeFalse();
      enterKey(triggerElements[0]);
      expect(isTriggerExpanded(triggerElements[0])).toBeTrue();
      enterKey(triggerElements[0]);
      expect(isTriggerExpanded(triggerElements[0])).toBeFalse();
    });

    it('should toggle expansion of focused trigger with Space', () => {
      expect(isTriggerExpanded(triggerElements[0])).toBeFalse();
      spaceKey(triggerElements[0]);
      expect(isTriggerExpanded(triggerElements[0])).toBeTrue();
      spaceKey(triggerElements[0]);
      expect(isTriggerExpanded(triggerElements[0])).toBeFalse();
    });

    describe('wrap behavior', () => {
      it('should wrap to first on ArrowDown from last if wrap=true', () => {
        configureAccordionComponent({wrap: true});
        endKey(triggerElements[0]);
        expect(isTriggerActive(triggerElements[2])).toBeTrue();
        downArrowKey(triggerElements[2]);
        expect(isTriggerActive(triggerElements[0])).toBeTrue();
      });

      it('should not wrap on ArrowDown from last if wrap=false', () => {
        configureAccordionComponent({wrap: false});
        endKey(triggerElements[0]);
        expect(isTriggerActive(triggerElements[2])).toBeTrue();
        downArrowKey(triggerElements[2]);
        expect(isTriggerActive(triggerElements[2])).toBeTrue();
      });

      it('should wrap to last on ArrowUp from first if wrap=true', () => {
        configureAccordionComponent({wrap: true});
        expect(isTriggerActive(triggerElements[0])).toBeTrue();
        upArrowKey(triggerElements[0]);
        expect(isTriggerActive(triggerElements[2])).toBeTrue();
      });

      it('should not wrap on ArrowUp from first if wrap=false', () => {
        configureAccordionComponent({wrap: false});
        expect(isTriggerActive(triggerElements[0])).toBeTrue();
        upArrowKey(triggerElements[0]);
        expect(isTriggerActive(triggerElements[0])).toBeTrue();
      });
    });

    describe('skipDisabled behavior', () => {
      it('should skip disabled items if skipDisabled=true', () => {
        configureAccordionComponent({skipDisabled: true, disabledItemValues: ['item-2']});

        expect(isTriggerActive(triggerElements[0])).toBeTrue();
        downArrowKey(triggerElements[0]);
        expect(isTriggerActive(triggerElements[2])).toBeTrue();
      });

      it('should focus disabled items if skipDisabled=false', () => {
        configureAccordionComponent({skipDisabled: false, disabledItemValues: ['item-2']});

        expect(isTriggerActive(triggerElements[0])).toBeTrue();
        downArrowKey(triggerElements[0]);
        expect(isTriggerActive(triggerElements[1])).toBeTrue();
        enterKey(triggerElements[1]);
        expect(isTriggerExpanded(triggerElements[1])).toBeFalse();
      });
    });

    it('should not allow keyboard navigation if group is disabled', () => {
      configureAccordionComponent({disabledGroup: true});

      downArrowKey(triggerElements[0]);
      expect(isTriggerActive(triggerElements[1])).toBeFalse();
    });

    it('should not allow expansion if group is disabled', () => {
      configureAccordionComponent({disabledGroup: true});

      enterKey(triggerElements[0]);
      expect(isTriggerExpanded(triggerElements[0])).toBeFalse();
    });
  });
});

@Component({
  template: `
    <div
      cdkAccordionGroup
      [(value)]="value"
      [multiExpandable]="multiExpandable()"
      [disabled]="disabledGroup()"
      [skipDisabled]="skipDisabled()"
      [wrap]="wrap()"
    >
      @for (item of items(); track item.value) {
        <div class="item-container">
          <button
            cdkAccordionTrigger
            [value]="item.value"
            [disabled]="item.disabled"
          >{{ item.header }}</button>
          <div
            cdkAccordionPanel
            [value]="item.value"
          >
            <ng-template cdkAccordionContent>
              {{ item.content }}
            </ng-template>
          </div>
        </div>
      }
    </div>
  `,
  imports: [CdkAccordionGroup, CdkAccordionTrigger, CdkAccordionPanel, CdkAccordionContent],
})
class AccordionGroupExample {
  items = signal([
    {value: 'item-1', header: 'Item 1 Header', content: 'Item 1 Content', disabled: false},
    {value: 'item-2', header: 'Item 2 Header', content: 'Item 2 Content', disabled: false},
    {value: 'item-3', header: 'Item 3 Header', content: 'Item 3 Content', disabled: false},
  ]);

  value = model<string[]>([]);
  multiExpandable = signal(false);
  disabledGroup = signal(false);
  skipDisabled = signal(true);
  wrap = signal(false);

  disableItem(itemValue: string, disabled: boolean) {
    this.items.update(items =>
      items.map(item => (item.value === itemValue ? {...item, disabled} : item)),
    );
  }
}
