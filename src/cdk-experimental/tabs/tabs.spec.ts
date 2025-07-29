import {Component, DebugElement, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Direction} from '@angular/cdk/bidi';
import {provideFakeDirectionality, runAccessibilityChecks} from '@angular/cdk/testing/private';
import {CdkTabs, CdkTabList, CdkTab, CdkTabPanel, CdkTabContent} from './tabs';

interface ModifierKeys {
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

interface TestTabDefinition {
  value: string;
  label: string;
  content: string;
  disabled?: boolean;
}

describe('CdkTabs', () => {
  let fixture: ComponentFixture<TestTabsComponent>;
  let testComponent: TestTabsComponent;

  let tabsDebugElement: DebugElement;
  let tabListDebugElement: DebugElement;
  let tabDebugElements: DebugElement[];
  let tabPanelDebugElements: DebugElement[];

  let tabsElement: HTMLElement;
  let tabListElement: HTMLElement;
  let tabElements: HTMLElement[];
  let tabPanelElements: HTMLElement[];

  const keydown = (key: string, modifierKeys: ModifierKeys = {}) => {
    tabListElement.dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        ...modifierKeys,
      }),
    );
    fixture.detectChanges();
    defineTestVariables();
  };

  const pointerDown = (target: HTMLElement, eventInit?: PointerEventInit) => {
    target.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, ...eventInit}));
    fixture.detectChanges();
    defineTestVariables();
  };

  const space = (modifierKeys?: ModifierKeys) => keydown(' ', modifierKeys);
  const enter = (modifierKeys?: ModifierKeys) => keydown('Enter', modifierKeys);
  const up = (modifierKeys?: ModifierKeys) => keydown('ArrowUp', modifierKeys);
  const down = (modifierKeys?: ModifierKeys) => keydown('ArrowDown', modifierKeys);
  const left = (modifierKeys?: ModifierKeys) => keydown('ArrowLeft', modifierKeys);
  const right = (modifierKeys?: ModifierKeys) => keydown('ArrowRight', modifierKeys);
  const home = (modifierKeys?: ModifierKeys) => keydown('Home', modifierKeys);
  const end = (modifierKeys?: ModifierKeys) => keydown('End', modifierKeys);

  function setupTestTabs(options: {textDirection?: Direction} = {}) {
    TestBed.configureTestingModule({
      providers: [provideFakeDirectionality(options.textDirection ?? 'ltr')],
    });

    fixture = TestBed.createComponent(TestTabsComponent);
    testComponent = fixture.componentInstance;

    fixture.detectChanges();
    defineTestVariables();
  }

  function updateTabs(
    options: {
      initialTabs?: TestTabDefinition[];
      selectedTab?: string | undefined;
      orientation?: 'horizontal' | 'vertical';
      disabled?: boolean;
      wrap?: boolean;
      skipDisabled?: boolean;
      focusMode?: 'roving' | 'activedescendant';
      selectionMode?: 'follow' | 'explicit';
    } = {},
  ) {
    if (options.initialTabs !== undefined) testComponent.tabsData.set(options.initialTabs);
    if (options.selectedTab !== undefined) testComponent.selectedTab.set(options.selectedTab);
    if (options.orientation !== undefined) testComponent.orientation.set(options.orientation);
    if (options.disabled !== undefined) testComponent.disabled.set(options.disabled);
    if (options.wrap !== undefined) testComponent.wrap.set(options.wrap);
    if (options.skipDisabled !== undefined) testComponent.skipDisabled.set(options.skipDisabled);
    if (options.focusMode !== undefined) testComponent.focusMode.set(options.focusMode);
    if (options.selectionMode !== undefined) testComponent.selectionMode.set(options.selectionMode);

    fixture.detectChanges();
    defineTestVariables();
  }

  function defineTestVariables() {
    tabsDebugElement = fixture.debugElement.query(By.directive(CdkTabs));
    tabListDebugElement = fixture.debugElement.query(By.directive(CdkTabList));
    tabDebugElements = fixture.debugElement.queryAll(By.directive(CdkTab));
    tabPanelDebugElements = fixture.debugElement.queryAll(By.directive(CdkTabPanel));

    tabsElement = tabsDebugElement.nativeElement;
    tabListElement = tabListDebugElement.nativeElement;
    tabElements = tabDebugElements.map(debugEl => debugEl.nativeElement);
    tabPanelElements = tabPanelDebugElements.map(debugEl => debugEl.nativeElement);
  }

  function isTabFocused(index: number): boolean {
    if (testComponent.focusMode() === 'roving') {
      return tabElements[index]?.getAttribute('tabindex') === '0';
    } else {
      return tabListElement?.getAttribute('aria-activedescendant') === tabElements[index]?.id;
    }
  }

  afterEach(async () => {
    if (tabsElement) {
      await runAccessibilityChecks(tabsElement);
    }
  });

  describe('ARIA attributes and roles', () => {
    beforeEach(() => {
      setupTestTabs();
      updateTabs({
        initialTabs: [
          {value: 'tab1', label: 'Tab 1', content: 'Content 1'},
          {value: 'tab2', label: 'Tab 2', content: 'Content 2', disabled: true},
          {value: 'tab3', label: 'Tab 3', content: 'Content 3'},
        ],
      });
    });

    describe('CdkTabList', () => {
      it('should have role="tablist"', () => {
        expect(tabListElement.getAttribute('role')).toBe('tablist');
      });

      it('should set aria-orientation based on input', () => {
        expect(tabListElement.getAttribute('aria-orientation')).toBe('horizontal');
        updateTabs({orientation: 'vertical'});
        expect(tabListElement.getAttribute('aria-orientation')).toBe('vertical');
      });

      it('should set aria-disabled based on input', () => {
        expect(tabListElement.getAttribute('aria-disabled')).toBe('false');
        updateTabs({disabled: true});
        expect(tabListElement.getAttribute('aria-disabled')).toBe('true');
      });

      it('should have tabindex set by focusMode', () => {
        updateTabs({focusMode: 'roving'});
        expect(tabListElement.getAttribute('tabindex')).toBe('-1');

        updateTabs({focusMode: 'activedescendant'});
        expect(tabListElement.getAttribute('tabindex')).toBe('0');
      });

      it('should set aria-activedescendant in activedescendant mode', () => {
        updateTabs({focusMode: 'activedescendant', selectedTab: 'tab1'});
        expect(tabListElement.getAttribute('aria-activedescendant')).toBe(tabElements[0].id);
      });

      it('should not set aria-activedescendant in roving mode', () => {
        updateTabs({selectedTab: 'tab1'});
        expect(tabListElement.hasAttribute('aria-activedescendant')).toBe(false);
      });
    });

    describe('CdkTab', () => {
      it('should have role="tab"', () => {
        tabElements.forEach(tabElement => {
          expect(tabElement.getAttribute('role')).toBe('tab');
        });
      });

      it('should have aria-selected based on selection state', () => {
        updateTabs({selectedTab: 'tab1'});
        expect(tabElements[0].getAttribute('aria-selected')).toBe('true');
        expect(tabElements[1].getAttribute('aria-selected')).toBe('false');
        expect(tabElements[2].getAttribute('aria-selected')).toBe('false');

        updateTabs({selectedTab: 'tab3'});
        expect(tabElements[0].getAttribute('aria-selected')).toBe('false');
        expect(tabElements[1].getAttribute('aria-selected')).toBe('false');
        expect(tabElements[2].getAttribute('aria-selected')).toBe('true');
      });

      it('should have aria-controls pointing to its panel id', () => {
        tabElements.forEach((tabElement, index) => {
          expect(tabElement.getAttribute('aria-controls')).toBe(tabPanelElements[index].id);
        });
      });

      it('should have aria-disabled based on input', () => {
        expect(tabElements[0].getAttribute('aria-disabled')).toBe('false');
        expect(tabElements[1].getAttribute('aria-disabled')).toBe('true');
        expect(tabElements[2].getAttribute('aria-disabled')).toBe('false');
      });

      it('should have tabindex set by focusMode and active state', () => {
        updateTabs({focusMode: 'roving', selectedTab: 'tab1'});
        expect(tabElements[0].getAttribute('tabindex')).toBe('0');
        expect(tabElements[1].getAttribute('tabindex')).toBe('-1');
        expect(tabElements[2].getAttribute('tabindex')).toBe('-1');

        updateTabs({focusMode: 'activedescendant'});
        tabElements.forEach(tabElement => {
          expect(tabElement.getAttribute('tabindex')).toBe('-1');
        });
      });
    });

    describe('CdkTabPanel', () => {
      it('should have role="tabpanel"', () => {
        tabPanelElements.forEach(panelElement => {
          expect(panelElement.getAttribute('role')).toBe('tabpanel');
        });
      });

      it('should have tabindex="0" when visible.', () => {
        updateTabs({selectedTab: 'tab1'});
        expect(tabPanelElements[0].getAttribute('tabindex')).toBe('0');
      });

      it('should have tabindex="-1" when hidden.', () => {
        updateTabs({selectedTab: 'tab1'});
        expect(tabPanelElements[1].getAttribute('tabindex')).toBe('-1');
        expect(tabPanelElements[2].getAttribute('tabindex')).toBe('-1');
      });

      it('should have aria-labelledby pointing to its tab id', () => {
        expect(tabPanelElements[0].getAttribute('aria-labelledby')).toBe(tabElements[0].id);
        expect(tabPanelElements[1].getAttribute('aria-labelledby')).toBe(tabElements[1].id);
        expect(tabPanelElements[2].getAttribute('aria-labelledby')).toBe(tabElements[2].id);
      });

      it('should have inert attribute when hidden and not when visible', () => {
        updateTabs({selectedTab: 'tab1'});
        expect(tabPanelElements[0].hasAttribute('inert')).toBe(false);
        expect(tabPanelElements[1].hasAttribute('inert')).toBe(true);
        expect(tabPanelElements[2].hasAttribute('inert')).toBe(true);

        updateTabs({selectedTab: 'tab3'});
        expect(tabPanelElements[0].hasAttribute('inert')).toBe(true);
        expect(tabPanelElements[1].hasAttribute('inert')).toBe(true);
        expect(tabPanelElements[2].hasAttribute('inert')).toBe(false);
      });
    });
  });

  describe('Keyboard navigation', () => {
    for (const focusMode of ['roving', 'activedescendant'] as const) {
      describe(`focusMode="${focusMode}"`, () => {
        describe('LTR', () => {
          beforeEach(() => {
            setupTestTabs({textDirection: 'ltr'});
            updateTabs({
              initialTabs: [
                {value: 'tab1', label: 'Tab 1', content: 'Content 1'},
                {value: 'tab2', label: 'Tab 2', content: 'Content 2', disabled: true},
                {value: 'tab3', label: 'Tab 3', content: 'Content 3'},
              ],
              focusMode,
              selectedTab: 'tab1',
            });
          });

          it('should move focus with ArrowRight', () => {
            expect(isTabFocused(0)).toBe(true);
            right();
            expect(isTabFocused(2)).toBe(true);
          });

          it('should move focus with ArrowLeft', () => {
            right();
            expect(isTabFocused(2)).toBe(true);
            left();
            expect(isTabFocused(0)).toBe(true);
          });

          it('should wrap focus with ArrowRight if wrap is true', () => {
            updateTabs({wrap: true});
            right();
            expect(isTabFocused(2)).toBe(true);
            right();
            expect(isTabFocused(0)).toBe(true);
          });

          it('should not wrap focus with ArrowRight if wrap is false', () => {
            updateTabs({wrap: false});
            right();
            expect(isTabFocused(2)).toBe(true);
            right();
            expect(isTabFocused(2)).toBe(true);
          });

          it('should wrap focus with ArrowLeft if wrap is true', () => {
            updateTabs({wrap: true});
            expect(isTabFocused(0)).toBe(true);
            left();
            expect(isTabFocused(2)).toBe(true);
          });

          it('should not wrap focus with ArrowLeft if wrap is false', () => {
            updateTabs({wrap: false});
            expect(isTabFocused(0)).toBe(true);
            left();
            expect(isTabFocused(0)).toBe(true);
          });

          it('should move focus to first tab with Home', () => {
            left();
            expect(isTabFocused(2)).toBe(true);
            home();
            expect(isTabFocused(0)).toBe(true);
          });

          it('should move focus to last tab with End', () => {
            expect(isTabFocused(0)).toBe(true);
            end();
            expect(isTabFocused(2)).toBe(true);
          });

          it('should skip disabled tabs if skipDisabled is true', () => {
            updateTabs({skipDisabled: true});
            expect(isTabFocused(0)).toBe(true);
            right();
            expect(isTabFocused(2)).toBe(true);
          });

          it('should not skip disabled tabs if skipDisabled is false', () => {
            updateTabs({skipDisabled: false});
            tabListElement.focus();
            fixture.detectChanges();
            expect(isTabFocused(0)).toBe(true);
            right();
            expect(isTabFocused(1)).toBe(true);
          });
        });

        describe('RTL', () => {
          beforeEach(() => {
            setupTestTabs({textDirection: 'rtl'});
            updateTabs({
              initialTabs: [
                {value: 'tab1', label: 'Tab 1', content: 'Content 1'},
                {value: 'tab2', label: 'Tab 2', content: 'Content 2', disabled: true},
                {value: 'tab3', label: 'Tab 3', content: 'Content 3'},
              ],
              focusMode,
              selectedTab: 'tab1',
            });
          });
          it('should move focus with ArrowLeft (effectively next)', () => {
            expect(isTabFocused(0)).toBe(true);
            left();
            expect(isTabFocused(2)).toBe(true);
          });

          it('should move focus with ArrowRight (effectively previous)', () => {
            left();
            expect(isTabFocused(2)).toBe(true);
            right();
            expect(isTabFocused(0)).toBe(true);
          });

          it('should wrap focus with ArrowLeft if wrap is true', () => {
            updateTabs({wrap: true});
            left();
            left();
            expect(isTabFocused(0)).toBe(true);
          });

          it('should not wrap focus with ArrowLeft if wrap is false', () => {
            updateTabs({wrap: false});
            left();
            left();
            expect(isTabFocused(2)).toBe(true);
          });
        });

        describe('orientation="vertical"', () => {
          beforeEach(() => {
            setupTestTabs({textDirection: 'ltr'});
            updateTabs({
              orientation: 'vertical',
              initialTabs: [
                {value: 'tab1', label: 'Tab 1', content: 'Content 1'},
                {value: 'tab2', label: 'Tab 2', content: 'Content 2', disabled: true},
                {value: 'tab3', label: 'Tab 3', content: 'Content 3'},
              ],
              focusMode,
              selectedTab: 'tab1',
            });
          });

          it('should move focus with ArrowDown', () => {
            expect(isTabFocused(0)).toBe(true);
            down();
            expect(isTabFocused(2)).toBe(true);
          });

          it('should move focus with ArrowUp', () => {
            down();
            expect(isTabFocused(2)).toBe(true);
            up();
            expect(isTabFocused(0)).toBe(true);
          });

          it('should wrap focus with ArrowDown if wrap is true', () => {
            updateTabs({wrap: true});
            down();
            expect(isTabFocused(2)).toBe(true);
            down();
            expect(isTabFocused(0)).toBe(true);
          });

          it('should not wrap focus with ArrowDown if wrap is false', () => {
            updateTabs({wrap: false});
            down();
            expect(isTabFocused(2)).toBe(true);
            down();
            expect(isTabFocused(2)).toBe(true);
          });

          it('should wrap focus with ArrowUp if wrap is true', () => {
            updateTabs({wrap: true});
            expect(isTabFocused(0)).toBe(true);
            up();
            expect(isTabFocused(2)).toBe(true);
          });

          it('should not wrap focus with ArrowUp if wrap is false', () => {
            updateTabs({wrap: false});
            expect(isTabFocused(0)).toBe(true);
            up();
            expect(isTabFocused(0)).toBe(true);
          });

          it('should move focus to first tab with Home', () => {
            down();
            expect(isTabFocused(2)).toBe(true);
            home();
            expect(isTabFocused(0)).toBe(true);
          });

          it('should move focus to last tab with End', () => {
            expect(isTabFocused(0)).toBe(true);
            end();
            expect(isTabFocused(2)).toBe(true);
          });

          it('should not move focus with ArrowLeft/ArrowRight', () => {
            expect(isTabFocused(0)).toBe(true);
            left();
            expect(isTabFocused(0)).toBe(true);
            right();
            expect(isTabFocused(0)).toBe(true);
          });
        });
      });
    }
  });

  describe('Tab selection', () => {
    beforeEach(() => {
      setupTestTabs();
      updateTabs({
        initialTabs: [
          {value: 'tab1', label: 'Tab 1', content: 'Content 1'},
          {value: 'tab2', label: 'Tab 2', content: 'Content 2'},
          {value: 'tab3', label: 'Tab 3', content: 'Content 3'},
        ],
        selectedTab: 'tab1',
      });
    });

    describe('selectionMode="follow"', () => {
      beforeEach(() => {
        updateTabs({selectionMode: 'follow'});
      });

      it('should select tab on focus via ArrowKeys', () => {
        updateTabs({selectedTab: 'tab1'});
        expect(testComponent.selectedTab()).toBe('tab1');
        expect(tabElements[0].getAttribute('aria-selected')).toBe('true');

        right();
        expect(testComponent.selectedTab()).toBe('tab2');
        expect(tabElements[1].getAttribute('aria-selected')).toBe('true');
        expect(tabElements[0].getAttribute('aria-selected')).toBe('false');

        left();
        expect(testComponent.selectedTab()).toBe('tab1');
        expect(tabElements[0].getAttribute('aria-selected')).toBe('true');
        expect(tabElements[1].getAttribute('aria-selected')).toBe('false');
      });

      it('should select tab on focus via Home/End', () => {
        updateTabs({selectedTab: 'tab2'});
        expect(testComponent.selectedTab()).toBe('tab2');

        home();
        expect(testComponent.selectedTab()).toBe('tab1');
        expect(tabElements[0].getAttribute('aria-selected')).toBe('true');

        end();
        expect(testComponent.selectedTab()).toBe('tab3');
        expect(tabElements[2].getAttribute('aria-selected')).toBe('true');
      });

      it('should select tab on click', () => {
        updateTabs({selectedTab: 'tab1'});
        expect(testComponent.selectedTab()).toBe('tab1');
        pointerDown(tabElements[1]);
        expect(testComponent.selectedTab()).toBe('tab2');
        expect(tabElements[1].getAttribute('aria-selected')).toBe('true');
      });

      it('should not change selection with Space/Enter on already selected tab', () => {
        updateTabs({selectedTab: 'tab1'});
        expect(testComponent.selectedTab()).toBe('tab1');
        space();
        expect(testComponent.selectedTab()).toBe('tab1');
        enter();
        expect(testComponent.selectedTab()).toBe('tab1');
      });
    });

    describe('selectionMode="explicit"', () => {
      beforeEach(() => {
        updateTabs({selectionMode: 'explicit'});
      });

      it('should not select tab on focus via ArrowKeys', () => {
        updateTabs({selectedTab: 'tab1'});
        expect(testComponent.selectedTab()).toBe('tab1');
        expect(tabElements[0].getAttribute('aria-selected')).toBe('true');

        right();
        expect(testComponent.selectedTab()).toBe('tab1');
        expect(tabElements[0].getAttribute('aria-selected')).toBe('true');
        expect(tabElements[1].getAttribute('aria-selected')).toBe('false');
        expect(isTabFocused(1)).toBe(true);

        left();
        expect(testComponent.selectedTab()).toBe('tab1');
        expect(tabElements[0].getAttribute('aria-selected')).toBe('true');
        expect(tabElements[1].getAttribute('aria-selected')).toBe('false');
        expect(isTabFocused(0)).toBe(true);
      });

      it('should select focused tab on Space', () => {
        updateTabs({selectedTab: 'tab1'});
        expect(testComponent.selectedTab()).toBe('tab1');

        right();
        expect(isTabFocused(1)).toBe(true);
        expect(testComponent.selectedTab()).toBe('tab1');

        space();
        expect(testComponent.selectedTab()).toBe('tab2');
        expect(tabElements[1].getAttribute('aria-selected')).toBe('true');
      });

      it('should select focused tab on Enter', () => {
        updateTabs({selectedTab: 'tab1'});
        expect(testComponent.selectedTab()).toBe('tab1');

        right();
        expect(isTabFocused(1)).toBe(true);
        expect(testComponent.selectedTab()).toBe('tab1');

        enter();
        expect(testComponent.selectedTab()).toBe('tab2');
        expect(tabElements[1].getAttribute('aria-selected')).toBe('true');
      });

      it('should select tab on click', () => {
        updateTabs({selectedTab: 'tab1'});
        expect(testComponent.selectedTab()).toBe('tab1');
        pointerDown(tabElements[1]);
        expect(testComponent.selectedTab()).toBe('tab2');
        expect(tabElements[1].getAttribute('aria-selected')).toBe('true');
      });
    });

    it('should update selectedTab model on selection change', () => {
      updateTabs({selectedTab: 'tab1', selectionMode: 'follow'});
      expect(testComponent.selectedTab()).toBe('tab1');

      right();
      expect(testComponent.selectedTab()).toBe('tab2');

      updateTabs({selectionMode: 'explicit'});
      right();
      expect(testComponent.selectedTab()).toBe('tab2');
      enter();
      expect(testComponent.selectedTab()).toBe('tab3');

      pointerDown(tabElements[0]);
      expect(testComponent.selectedTab()).toBe('tab1');
    });

    it('should update selection when selectedTab model changes', () => {
      updateTabs({selectedTab: 'tab1'});
      expect(tabElements[0].getAttribute('aria-selected')).toBe('true');

      updateTabs({selectedTab: 'tab2'});
      expect(tabElements[1].getAttribute('aria-selected')).toBe('true');
      expect(tabElements[0].getAttribute('aria-selected')).toBe('false');

      updateTabs({selectedTab: 'tab3'});
      expect(tabElements[2].getAttribute('aria-selected')).toBe('true');
      expect(tabElements[1].getAttribute('aria-selected')).toBe('false');
    });

    it('should not select a disabled tab via click', () => {
      updateTabs({
        initialTabs: [
          {value: 'tab1', label: 'Tab 1', content: 'Content 1'},
          {value: 'tab2', label: 'Tab 2', content: 'Content 2', disabled: true},
          {value: 'tab3', label: 'Tab 3', content: 'Content 3'},
        ],
        selectedTab: 'tab1',
      });
      expect(testComponent.selectedTab()).toBe('tab1');
      pointerDown(tabElements[1]);
      expect(testComponent.selectedTab()).toBe('tab1');
      expect(tabElements[1].getAttribute('aria-selected')).toBe('false');
    });

    it('should not select a disabled tab via keyboard', () => {
      updateTabs({
        initialTabs: [
          {value: 'tab1', label: 'Tab 1', content: 'Content 1'},
          {value: 'tab2', label: 'Tab 2', content: 'Content 2', disabled: true},
          {value: 'tab3', label: 'Tab 3', content: 'Content 3'},
        ],
        selectedTab: 'tab1',
        selectionMode: 'explicit',
        skipDisabled: false,
      });
      expect(testComponent.selectedTab()).toBe('tab1');
      right();
      expect(isTabFocused(1)).toBe(true);
      enter();
      expect(testComponent.selectedTab()).toBe('tab1');
      expect(tabElements[1].getAttribute('aria-selected')).toBe('false');
    });

    it('should not change selection if tablist is disabled', () => {
      updateTabs({selectedTab: 'tab1', disabled: true});
      expect(testComponent.selectedTab()).toBe('tab1');
      pointerDown(tabElements[1]);
      expect(testComponent.selectedTab()).toBe('tab1');
      right();
      expect(testComponent.selectedTab()).toBe('tab1');
    });

    it('should handle initial selection via input', () => {
      updateTabs({selectedTab: 'tab2'});
      expect(testComponent.selectedTab()).toBe('tab2');
      expect(tabElements[1].getAttribute('aria-selected')).toBe('true');
      expect(tabElements[0].getAttribute('aria-selected')).toBe('false');
    });
  });
});

@Component({
  template: `
    <div cdkTabs>
      <ul cdkTabList
          [(tab)]="selectedTab"
          [orientation]="orientation()"
          [disabled]="disabled()"
          [wrap]="wrap()"
          [skipDisabled]="skipDisabled()"
          [focusMode]="focusMode()"
          [selectionMode]="selectionMode()">
        @for (tabDef of tabsData(); track tabDef.value) {
          <li cdkTab [value]="tabDef.value" [disabled]="!!tabDef.disabled">{{ tabDef.label }}</li>
        }
      </ul>

      @for (tabDef of tabsData(); track tabDef.value) {
        <div cdkTabPanel [value]="tabDef.value">
          <ng-template cdkTabContent>{{ tabDef.content }}</ng-template>
        </div>
      }
    </div>
  `,
  imports: [CdkTabs, CdkTabList, CdkTab, CdkTabPanel, CdkTabContent],
})
class TestTabsComponent {
  tabsData = signal<TestTabDefinition[]>([
    {
      value: 'tab1',
      label: 'Tab 1',
      content: 'Content 1',
      disabled: false,
    },
    {
      value: 'tab2',
      label: 'Tab 2',
      content: 'Content 2',
      disabled: false,
    },
    {
      value: 'tab3',
      label: 'Tab 3',
      content: 'Content 3',
      disabled: true,
    },
  ]);

  selectedTab = signal<string | undefined>(undefined);
  orientation = signal<'horizontal' | 'vertical'>('horizontal');
  disabled = signal(false);
  wrap = signal(true);
  skipDisabled = signal(true);
  focusMode = signal<'roving' | 'activedescendant'>('roving');
  selectionMode = signal<'follow' | 'explicit'>('follow');
}
