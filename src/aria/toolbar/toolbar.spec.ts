import {Component, inject, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Direction} from '@angular/cdk/bidi';
import {provideFakeDirectionality} from '@angular/cdk/testing/private';
import {Toolbar, ToolbarWidget, ToolbarWidgetGroup} from './toolbar';

interface ModifierKeys {
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

describe('Toolbar', () => {
  let fixture: ComponentFixture<TestToolbarComponent>;
  let testComponent: TestToolbarComponent;
  let toolbarElement: HTMLElement;
  let widgetElements: HTMLElement[];
  let testWidgetGroupInstance: TestToolbarWidgetGroup;

  const keydown = (key: string, modifierKeys: ModifierKeys = {}) => {
    const event = new KeyboardEvent('keydown', {key, bubbles: true, ...modifierKeys});
    toolbarElement.dispatchEvent(event);
    fixture.detectChanges();
    defineTestVariables();
  };

  const pointerDown = (target: HTMLElement, eventInit: PointerEventInit = {}) => {
    target.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, ...eventInit}));
    fixture.detectChanges();
    defineTestVariables();
  };

  const up = (modifierKeys?: ModifierKeys) => keydown('ArrowUp', modifierKeys);
  const down = (modifierKeys?: ModifierKeys) => keydown('ArrowDown', modifierKeys);
  const left = (modifierKeys?: ModifierKeys) => keydown('ArrowLeft', modifierKeys);
  const right = (modifierKeys?: ModifierKeys) => keydown('ArrowRight', modifierKeys);
  const home = (modifierKeys?: ModifierKeys) => keydown('Home', modifierKeys);
  const end = (modifierKeys?: ModifierKeys) => keydown('End', modifierKeys);
  const enter = (modifierKeys?: ModifierKeys) => keydown('Enter', modifierKeys);
  const space = (modifierKeys?: ModifierKeys) => keydown(' ', modifierKeys);
  const click = (target: HTMLElement) => pointerDown(target);

  function setupTestToolbar(textDirection: Direction = 'ltr') {
    TestBed.configureTestingModule({
      imports: [Toolbar, ToolbarWidget, ToolbarWidgetGroup, TestToolbarComponent],
      providers: [provideFakeDirectionality(textDirection)],
    });

    fixture = TestBed.createComponent(TestToolbarComponent);
    testComponent = fixture.componentInstance;

    fixture.detectChanges();
    defineTestVariables();
  }

  function defineTestVariables() {
    const toolbarDebugElement = fixture.debugElement.query(By.directive(Toolbar));
    const widgetDebugElements = fixture.debugElement.queryAll(By.css('[data-value="widget"]'));
    const testWidgetGroupElement = fixture.debugElement.query(By.directive(TestToolbarWidgetGroup));

    toolbarElement = toolbarDebugElement.nativeElement as HTMLElement;
    widgetElements = widgetDebugElements.map(debugEl => debugEl.nativeElement);
    testWidgetGroupInstance = testWidgetGroupElement.componentInstance as TestToolbarWidgetGroup;
  }

  function updateToolbar(
    config: {
      disabled?: boolean;
      widgetGroupDisabled?: boolean;
      orientation?: 'horizontal' | 'vertical';
      wrap?: boolean;
      softDisabled?: boolean;
    } = {},
  ) {
    if (config.disabled !== undefined) testComponent.disabled.set(config.disabled);
    if (config.widgetGroupDisabled !== undefined)
      testComponent.widgetGroupDisabled.set(config.widgetGroupDisabled);
    if (config.orientation !== undefined) testComponent.orientation.set(config.orientation);
    if (config.wrap !== undefined) testComponent.wrap.set(config.wrap);
    if (config.softDisabled !== undefined) testComponent.softDisabled.set(config.softDisabled);

    fixture.detectChanges();
    defineTestVariables();
  }

  describe('ARIA attributes and roles', () => {
    describe('default configuration', () => {
      beforeEach(() => {
        setupTestToolbar();
      });

      it('should correctly set the role attribute to "toolbar" for Toolbar', () => {
        expect(toolbarElement.getAttribute('role')).toBe('toolbar');
      });

      it('should set aria-orientation to "horizontal" by default', () => {
        expect(toolbarElement.getAttribute('aria-orientation')).toBe('horizontal');
      });

      it('should set aria-disabled to "false" by default for the toolbar', () => {
        expect(toolbarElement.getAttribute('aria-disabled')).toBe('false');
      });

      it('should set aria-disabled to "false" by default for widgets', () => {
        expect(widgetElements[0].getAttribute('aria-disabled')).toBe('false');
        expect(widgetElements[1].getAttribute('aria-disabled')).toBe('true');
        expect(widgetElements[2].getAttribute('aria-disabled')).toBe('false');
      });

      it('should set initial focus (tabindex="0") on the first non-disabled widget', () => {
        expect(widgetElements[0].getAttribute('tabindex')).toBe('0');
        expect(widgetElements[1].getAttribute('tabindex')).toBe('-1');
        expect(widgetElements[2].getAttribute('tabindex')).toBe('-1');
      });

      it('should not have aria-activedescendant by default', () => {
        expect(toolbarElement.hasAttribute('aria-activedescendant')).toBe(false);
      });
    });

    describe('custom configuration', () => {
      beforeEach(() => {
        setupTestToolbar();
      });

      it('should set aria-orientation to "vertical"', () => {
        updateToolbar({orientation: 'vertical'});
        expect(toolbarElement.getAttribute('aria-orientation')).toBe('vertical');
      });

      it('should set aria-disabled to "true" for the toolbar', () => {
        updateToolbar({disabled: true});
        expect(toolbarElement.getAttribute('aria-disabled')).toBe('true');
      });

      it('should set aria-disabled to "true" for all widgets when toolbar is disabled', () => {
        updateToolbar({disabled: true});
        expect(widgetElements[0].getAttribute('aria-disabled')).toBe('true');
        expect(widgetElements[1].getAttribute('aria-disabled')).toBe('true');
        expect(widgetElements[2].getAttribute('aria-disabled')).toBe('true');
      });
    });
  });

  describe('keyboard navigation', () => {
    describe('LTR', () => {
      beforeEach(() => {
        setupTestToolbar('ltr');
        updateToolbar({widgetGroupDisabled: true});
      });

      describe('vertical orientation', () => {
        beforeEach(() => {
          updateToolbar({orientation: 'vertical'});
        });

        it('should move focus to the next widget on ArrowDown', () => {
          down();
          expect(document.activeElement).toBe(widgetElements[2]);
        });

        it('should move focus to the previous widget on ArrowUp', () => {
          down();
          expect(document.activeElement).toBe(widgetElements[2]);

          up();
          expect(document.activeElement).toBe(widgetElements[0]);
        });
      });

      describe('horizontal orientation', () => {
        beforeEach(() => {
          updateToolbar({orientation: 'horizontal'});
        });

        it('should move focus to the next widget on ArrowRight', () => {
          right();
          expect(document.activeElement).toBe(widgetElements[2]);
        });

        it('should move focus to the previous widget on ArrowLeft', () => {
          right();
          expect(document.activeElement).toBe(widgetElements[2]);

          left();
          expect(document.activeElement).toBe(widgetElements[0]);
        });
      });

      it('should move focus to the last enabled widget on End', () => {
        end();
        expect(document.activeElement).toBe(widgetElements[2]);
      });

      it('should move focus to the first enabled widget on Home', () => {
        end();
        expect(document.activeElement).toBe(widgetElements[2]);

        home();
        expect(document.activeElement).toBe(widgetElements[0]);
      });

      it('should skip disabled widgets with arrow keys if softDisabled=false', () => {
        updateToolbar({softDisabled: false});
        right();
        expect(document.activeElement).toBe(widgetElements[2]);
      });

      it('should not skip disabled widgets with arrow keys if softDisabled=true', () => {
        updateToolbar({softDisabled: true});
        right();
        expect(document.activeElement).toBe(widgetElements[1]);
      });

      it('should wrap focus from last to first when wrap is true', () => {
        updateToolbar({wrap: true});
        end();
        expect(document.activeElement).toBe(widgetElements[2]);

        right();
        expect(document.activeElement).toBe(widgetElements[0]);
      });

      it('should not wrap focus from last to first when wrap is false', () => {
        updateToolbar({wrap: false});
        end();
        expect(document.activeElement).toBe(widgetElements[2]);

        right();
        expect(document.activeElement).toBe(widgetElements[2]);
      });
    });

    describe('RTL', () => {
      beforeEach(() => {
        setupTestToolbar('rtl');
        updateToolbar({widgetGroupDisabled: true, orientation: 'horizontal'});
      });

      describe('horizontal orientation', () => {
        it('should move focus to the next widget on ArrowLeft', () => {
          left();
          expect(document.activeElement).toBe(widgetElements[2]);
        });

        it('should move focus to the previous widget on ArrowRight', () => {
          left();
          expect(document.activeElement).toBe(widgetElements[2]);

          right();
          expect(document.activeElement).toBe(widgetElements[0]);
        });
      });
    });
  });

  describe('pointer navigation', () => {
    beforeEach(() => setupTestToolbar());

    it('should move focus to the clicked widget', () => {
      click(widgetElements[2]);
      expect(document.activeElement).toBe(widgetElements[2]);
    });

    it('should move focus to the clicked disabled widget if softDisabled=true', () => {
      updateToolbar({softDisabled: true});
      click(widgetElements[1]);
      expect(document.activeElement).toBe(widgetElements[1]);
    });

    it('should not move focus to the clicked disabled widget if softDisabled=false', () => {
      updateToolbar({softDisabled: false});
      const initiallyFocused = document.activeElement;

      click(widgetElements[1]);

      expect(document.activeElement).toBe(initiallyFocused);
    });
  });

  describe('widget group', () => {
    describe('LTR', () => {
      beforeEach(() => {
        setupTestToolbar('ltr');
        const widgetGroupElement = testWidgetGroupInstance.toolbarWidgetGroup.element();
        click(widgetGroupElement);
        testWidgetGroupInstance.lastAction.set(undefined);
      });

      describe('vertical orientation', () => {
        beforeEach(() => {
          updateToolbar({orientation: 'vertical'});
        });

        it('should call "next" on ArrowDown', () => {
          down();
          expect(testWidgetGroupInstance.lastAction()).toBe('next');
        });

        it('should call "prev" on ArrowUp', () => {
          up();
          expect(testWidgetGroupInstance.lastAction()).toBe('prev');
        });

        it('should call "next" with wrap on ArrowRight', () => {
          right();
          expect(testWidgetGroupInstance.lastAction()).toBe('nextWithWrap');
        });

        it('should call "prev" with wrap on ArrowLeft', () => {
          left();
          expect(testWidgetGroupInstance.lastAction()).toBe('prevWithWrap');
        });
      });

      describe('horizontal orientation', () => {
        beforeEach(() => {
          updateToolbar({orientation: 'horizontal'});
        });

        it('should call "next" on ArrowRight', () => {
          right();
          expect(testWidgetGroupInstance.lastAction()).toBe('next');
        });

        it('should call "prev" on ArrowLeft', () => {
          left();
          expect(testWidgetGroupInstance.lastAction()).toBe('prev');
        });

        it('should call "next" with wrap on ArrowDown', () => {
          down();
          expect(testWidgetGroupInstance.lastAction()).toBe('nextWithWrap');
        });

        it('should call "prev" with wrap on ArrowUp', () => {
          up();
          expect(testWidgetGroupInstance.lastAction()).toBe('prevWithWrap');
        });
      });

      it('should call "unfocus" on Home key', () => {
        home();
        expect(testWidgetGroupInstance.lastAction()).toBe('unfocus');
        expect(document.activeElement).toBe(widgetElements[0]);
      });

      it('should call "unfocus" on End key', () => {
        end();
        expect(testWidgetGroupInstance.lastAction()).toBe('unfocus');
        expect(document.activeElement).toBe(widgetElements[2]);
      });

      it('should call "trigger" on Enter key', () => {
        enter();
        expect(testWidgetGroupInstance.lastAction()).toBe('trigger');
      });

      it('should call "trigger" on Space key', () => {
        space();
        expect(testWidgetGroupInstance.lastAction()).toBe('trigger');
      });

      it('should call "first" when navigating into a group from the previous widget', () => {
        click(widgetElements[0]);
        right();
        expect(testWidgetGroupInstance.lastAction()).toBe('first');
      });

      it('should call "last" when navigating into a group from the next widget', () => {
        click(widgetElements[2]);
        left();
        expect(testWidgetGroupInstance.lastAction()).toBe('last');
      });

      it('should call "goto" on click', () => {
        click(testWidgetGroupInstance.toolbarWidgetGroup.element());
        expect(testWidgetGroupInstance.lastAction()).toBe('goto');
      });
    });

    describe('RTL', () => {
      beforeEach(() => {
        setupTestToolbar('rtl');
        const widgetGroupElement = testWidgetGroupInstance.toolbarWidgetGroup.element();
        click(widgetGroupElement);
        testWidgetGroupInstance.lastAction.set(undefined);
        updateToolbar({orientation: 'horizontal'});
      });

      describe('horizontal orientation', () => {
        it('should call "next" on ArrowLeft', () => {
          left();
          expect(testWidgetGroupInstance.lastAction()).toBe('next');
        });

        it('should call "prev" on ArrowRight', () => {
          right();
          expect(testWidgetGroupInstance.lastAction()).toBe('prev');
        });
      });
    });
  });
});

@Component({
  template: 'a black box',
  selector: 'testWidgetGroup',
  hostDirectives: [
    {
      directive: ToolbarWidgetGroup,
      inputs: ['disabled'],
    },
  ],
})
class TestToolbarWidgetGroup {
  readonly toolbarWidgetGroup = inject(ToolbarWidgetGroup);
  readonly lastAction = signal<string | undefined>(undefined);

  constructor() {
    this.toolbarWidgetGroup.controls.set({
      isOnFirstItem: () => false,
      isOnLastItem: () => false,
      next: wrap => {
        this.lastAction.set(wrap ? 'nextWithWrap' : 'next');
      },
      prev: wrap => {
        this.lastAction.set(wrap ? 'prevWithWrap' : 'prev');
      },
      first: () => {
        this.lastAction.set('first');
      },
      last: () => {
        this.lastAction.set('last');
      },
      unfocus: () => {
        this.lastAction.set('unfocus');
      },
      trigger: () => {
        this.lastAction.set('trigger');
      },
      goto: () => {
        this.lastAction.set('goto');
      },
      setDefaultState: () => {
        this.lastAction.set('setDefaultState');
      },
    });
  }
}

@Component({
  template: `
    <div
      ngToolbar
      [orientation]="orientation()"
      [disabled]="disabled()"
      [wrap]="wrap()"
      [softDisabled]="softDisabled()"
    >
      <button ngToolbarWidget data-value="widget">Widget Button 1</button>
      <button ngToolbarWidget data-value="widget" [disabled]="true">Widget Button 2</button>
      <testWidgetGroup [disabled]="widgetGroupDisabled()"></testWidgetGroup>
      <button ngToolbarWidget data-value="widget">Widget Button 3</button>
    </div>
  `,
  imports: [Toolbar, ToolbarWidget, ToolbarWidgetGroup, TestToolbarWidgetGroup],
})
class TestToolbarComponent {
  orientation = signal<'vertical' | 'horizontal'>('horizontal');
  disabled = signal(false);
  widgetGroupDisabled = signal(false);
  wrap = signal(true);
  softDisabled = signal(false);
}
