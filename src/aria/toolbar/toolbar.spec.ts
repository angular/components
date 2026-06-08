import {
  Component,
  DebugElement,
  Directive,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {waitForMicrotasks} from '../private/testing/test-helpers';
import {provideFakeDirectionality, runAccessibilityChecks} from '@angular/cdk/testing/private';
import {Toolbar} from './toolbar';
import {ToolbarWidgetGroup} from './toolbar-widget-group';
import {ToolbarWidget} from './toolbar-widget';

describe('Toolbar', () => {
  let fixture: ComponentFixture<ToolbarExample>;
  let toolbarElement: HTMLElement;

  const keydown = async (key: string, target?: HTMLElement, modifierKeys: {} = {}) => {
    const eventTarget = target || toolbarElement;
    eventTarget.dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        ...modifierKeys,
      }),
    );
    await fixture.whenStable();
  };

  const click = async (element: HTMLElement, eventInit?: PointerEventInit) => {
    element.dispatchEvent(
      // Include pointerType to better simulate a real mouse click v.s. enter keyboard event.
      new PointerEvent('click', {bubbles: true, pointerType: 'mouse', ...eventInit}),
    );
    await fixture.whenStable();
  };

  const right = async (target?: HTMLElement, modifierKeys?: {}) =>
    await keydown('ArrowRight', target, modifierKeys);
  const left = async (target?: HTMLElement, modifierKeys?: {}) =>
    await keydown('ArrowLeft', target, modifierKeys);
  const up = async (target?: HTMLElement, modifierKeys?: {}) =>
    await keydown('ArrowUp', target, modifierKeys);
  const down = async (target?: HTMLElement, modifierKeys?: {}) =>
    await keydown('ArrowDown', target, modifierKeys);
  const home = async (target?: HTMLElement, modifierKeys?: {}) =>
    await keydown('Home', target, modifierKeys);
  const end = async (target?: HTMLElement, modifierKeys?: {}) =>
    await keydown('End', target, modifierKeys);

  async function setupToolbar(
    opts: {
      orientation?: 'vertical' | 'horizontal';
      softDisabled?: boolean;
      disabled?: boolean;
      wrap?: boolean;
      textDirection?: 'ltr' | 'rtl';
    } = {},
  ) {
    TestBed.configureTestingModule({
      imports: [ToolbarExample],
      providers: [provideFakeDirectionality(opts?.textDirection ?? 'ltr')],
    });
    fixture = TestBed.createComponent(ToolbarExample);
    const testComponent = fixture.componentInstance as ToolbarExample;

    if (opts.orientation) {
      testComponent.orientation.set(opts.orientation);
    }
    if (opts.softDisabled !== undefined) {
      testComponent.softDisabled.set(opts.softDisabled);
    }
    if (opts.disabled !== undefined) {
      testComponent.disabled.set(opts.disabled);
    }
    if (opts.wrap !== undefined) {
      testComponent.wrap.set(opts.wrap);
    }

    await fixture.whenStable();
    defineTestVariables();
  }

  function defineTestVariables() {
    const toolbarDebugElement = fixture.debugElement.query(By.directive(Toolbar));
    toolbarElement = toolbarDebugElement.nativeElement as HTMLElement;
  }

  function getWidgetEl(text: string): HTMLElement | null {
    const widgets = getWidgetEls();
    return widgets.find(widget => widget.textContent?.trim() === text) || null;
  }

  function getWidgetEls(): HTMLElement[] {
    return fixture.debugElement
      .queryAll(By.directive(ToolbarWidget))
      .map((debugEl: DebugElement) => debugEl.nativeElement as HTMLElement);
  }

  afterEach(async () => await runAccessibilityChecks(fixture.nativeElement));

  describe('dynamic updates', () => {
    it('should update widget order correctly after widgets are shuffled', async () => {
      TestBed.configureTestingModule({imports: [ShuffledToolbarExample]});
      fixture = TestBed.createComponent(
        ShuffledToolbarExample,
      ) as unknown as ComponentFixture<ToolbarExample>;
      await fixture.whenStable();
      const shuffledToolbarDebugEl = fixture.debugElement.query(By.directive(Toolbar));
      const shuffledToolbarInstance = shuffledToolbarDebugEl.injector.get(Toolbar);

      const widgetsBefore = shuffledToolbarInstance._itemPatterns();
      expect(widgetsBefore.length).toBe(3);
      expect(widgetsBefore[0].element()?.textContent?.trim()).toBe('item 0');

      const items = (fixture.componentInstance as unknown as ShuffledToolbarExample).items();
      const firstItem = items.shift()!;
      items.push(firstItem);
      (fixture.componentInstance as unknown as ShuffledToolbarExample).items.set([...items]);
      await fixture.whenStable();
      await waitForMicrotasks();

      const widgetsAfter = shuffledToolbarInstance._itemPatterns();
      expect(widgetsAfter.length).toBe(3);
      expect(widgetsAfter[0].element()?.textContent?.trim()).toBe('item 1');
    });
  });

  describe('Navigation', () => {
    describe('with horizontal orientation', () => {
      it('should navigate on click (horizontal)', async () => {
        await setupToolbar();
        const item3 = getWidgetEl('item 3')!;
        await click(item3);
        expect(document.activeElement).toBe(item3);
      });

      describe('with ltr text direction', () => {
        beforeEach(async () => await setupToolbar());

        it('should navigate next on ArrowRight', async () => {
          const item0 = getWidgetEl('item 0')!;
          await click(item0);
          await right();
          expect(document.activeElement).toBe(getWidgetEl('item 1'));
        });

        it('should navigate prev on ArrowLeft', async () => {
          const item1 = getWidgetEl('item 1')!;
          await click(item1);
          await left();
          expect(document.activeElement).toBe(getWidgetEl('item 0'));
        });

        it('should not navigate next on ArrowDown when not in a widget group (horizontal, ltr)', async () => {
          const item0 = getWidgetEl('item 0')!;
          await click(item0);
          await down();
          expect(document.activeElement).toBe(item0);
        });

        it('should not navigate prev on ArrowUp when not in a widget group (horizontal, ltr)', async () => {
          const item0 = getWidgetEl('item 0')!;
          await click(item0);
          await up();
          expect(document.activeElement).toBe(item0);
        });

        it('should navigate next in a widget group on ArrowDown (horizontal, ltr)', async () => {
          const item2 = getWidgetEl('item 2')!;
          await click(item2);
          await down();
          expect(document.activeElement).toBe(getWidgetEl('item 3'));
        });

        it('should navigate prev in a widget group on ArrowUp (horizontal, ltr)', async () => {
          const item3 = getWidgetEl('item 3')!;
          await click(item3);
          await up();
          expect(document.activeElement).toBe(getWidgetEl('item 2'));
        });

        it('should navigate last to first in a widget group on ArrowDown (horizontal, ltr)', async () => {
          const item4 = getWidgetEl('item 4')!;
          await click(item4);
          await down();
          expect(document.activeElement).toBe(getWidgetEl('item 2'));
        });

        it('should navigate first to last in a widget group on ArrowUp (horizontal, ltr)', async () => {
          const item2 = getWidgetEl('item 2')!;
          await click(item2);
          await up();
          expect(document.activeElement).toBe(getWidgetEl('item 4'));
        });

        describe('with wrap false', () => {
          beforeEach(async () => {
            fixture.componentInstance.wrap.set(false);
            await fixture.whenStable();
          });

          it('should not wrap from last to first', async () => {
            const item5 = getWidgetEl('item 5')!;
            await click(item5);
            await right();
            expect(document.activeElement).toBe(item5);
          });

          it('should not wrap from first to last', async () => {
            const item0 = getWidgetEl('item 0')!;
            await click(item0);
            await left();
            expect(document.activeElement).toBe(item0);
          });
        });

        describe('with softDisabled true', () => {
          beforeEach(async () => {
            fixture.componentInstance.softDisabled.set(true);
            await fixture.whenStable();
          });

          it('should not skip disabled items when navigating next', async () => {
            fixture.componentInstance.widgets[1].disabled.set(true);
            await fixture.whenStable();
            await click(getWidgetEl('item 0')!);
            await right();
            expect(document.activeElement).toBe(getWidgetEl('item 1'));
          });

          it('should not skip disabled items when navigating prev', async () => {
            fixture.componentInstance.widgets[1].disabled.set(true);
            await fixture.whenStable();
            const item2 = getWidgetEl('item 2')!;
            await click(item2);
            await left();
            expect(document.activeElement).toBe(getWidgetEl('item 1'));
          });

          it('should not skip disabled groups when navigating next', async () => {
            fixture.componentInstance.groups[0].disabled.set(true);
            await fixture.whenStable();
            const item1 = getWidgetEl('item 1')!;
            await click(item1);
            await right();
            expect(document.activeElement).toBe(getWidgetEl('item 2'));
          });

          it('should not skip disabled groups when navigating prev', async () => {
            fixture.componentInstance.groups[0].disabled.set(true);
            await fixture.whenStable();
            const item5 = getWidgetEl('item 5')!;
            await click(item5);
            await left();
            expect(document.activeElement).toBe(getWidgetEl('item 4'));
          });

          it('should navigate to the last item on End', async () => {
            const item0 = getWidgetEl('item 0')!;
            await click(item0);
            await end();
            expect(document.activeElement).toBe(getWidgetEl('item 5'));
          });

          it('should navigate to the first item on Home', async () => {
            const item5 = getWidgetEl('item 5')!;
            await click(item5);
            await home();
            expect(document.activeElement).toBe(getWidgetEl('item 0'));
          });

          describe('with wrap true', () => {
            beforeEach(async () => {
              fixture.componentInstance.wrap.set(true);
              await fixture.whenStable();
            });

            it('should wrap from last to first', async () => {
              const item5 = getWidgetEl('item 5')!;
              await click(item5);
              await right();
              expect(document.activeElement).toBe(getWidgetEl('item 0'));
            });

            it('should wrap from first to last', async () => {
              const item0 = getWidgetEl('item 0')!;
              await click(item0);
              await left();
              expect(document.activeElement).toBe(getWidgetEl('item 5'));
            });
          });
        });

        describe('with softDisabled false', () => {
          beforeEach(async () => {
            fixture.componentInstance.softDisabled.set(false);
            await fixture.whenStable();
          });

          it('should not navigate to disabled items on click', async () => {
            fixture.componentInstance.widgets[1].disabled.set(true);
            await fixture.whenStable();
            const item1 = getWidgetEl('item 1')!;
            await click(item1);
            expect(document.activeElement).not.toBe(item1);
          });

          it('should skip disabled items when navigating next', async () => {
            fixture.componentInstance.widgets[1].disabled.set(true);
            await fixture.whenStable();
            const item0 = getWidgetEl('item 0')!;
            await click(item0);
            await right();
            expect(document.activeElement).toBe(getWidgetEl('item 2'));
          });

          it('should skip disabled items when navigating prev', async () => {
            fixture.componentInstance.widgets[1].disabled.set(true);
            await fixture.whenStable();
            const item2 = getWidgetEl('item 2')!;
            await click(item2);
            await left();
            expect(document.activeElement).toBe(getWidgetEl('item 0'));
          });

          it('should not navigate to items in disabled groups on click', async () => {
            fixture.componentInstance.groups[0].disabled.set(true);
            await fixture.whenStable();
            const item3 = getWidgetEl('item 3')!;
            await click(item3);
            expect(document.activeElement).not.toBe(item3);
          });

          it('should skip disabled groups when navigating next', async () => {
            fixture.componentInstance.groups[0].disabled.set(true);
            await fixture.whenStable();
            const item1 = getWidgetEl('item 1')!;
            await click(item1);
            await right();
            expect(document.activeElement).toBe(getWidgetEl('item 5'));
          });

          it('should skip disabled groups when navigating prev', async () => {
            fixture.componentInstance.groups[0].disabled.set(true);
            await fixture.whenStable();
            const item5 = getWidgetEl('item 5')!;
            await click(item5);
            await left();
            expect(document.activeElement).toBe(getWidgetEl('item 1'));
          });

          it('should navigate to the last focusable item on End', async () => {
            fixture.componentInstance.widgets[5].disabled.set(true);
            await fixture.whenStable();
            const item0 = getWidgetEl('item 0')!;
            await click(item0);
            await end();
            expect(document.activeElement).toBe(getWidgetEl('item 4'));
          });

          it('should navigate to the first focusable item on Home', async () => {
            fixture.componentInstance.widgets[0].disabled.set(true);
            await fixture.whenStable();
            const item5 = getWidgetEl('item 5')!;
            await click(item5);
            await home();
            expect(document.activeElement).toBe(getWidgetEl('item 1'));
          });

          describe('with wrap true', () => {
            beforeEach(async () => {
              fixture.componentInstance.wrap.set(true);
              await fixture.whenStable();
            });

            it('should wrap from last to first focusable item', async () => {
              fixture.componentInstance.widgets[0].disabled.set(true);
              await fixture.whenStable();
              const item5 = getWidgetEl('item 5')!;
              await click(item5);
              await right();
              expect(document.activeElement).toBe(getWidgetEl('item 1'));
            });

            it('should wrap from first to last focusable item', async () => {
              fixture.componentInstance.widgets[5].disabled.set(true);
              await fixture.whenStable();
              const item0 = getWidgetEl('item 0')!;
              await click(item0);
              await left();
              expect(document.activeElement).toBe(getWidgetEl('item 4'));
            });
          });

          describe('with wrap false', () => {
            beforeEach(async () => {
              fixture.componentInstance.wrap.set(false);
              await fixture.whenStable();
            });

            it('should not wrap from last to first focusable item', async () => {
              fixture.componentInstance.widgets[0].disabled.set(true);
              await fixture.whenStable();
              const item5 = getWidgetEl('item 5')!;
              await click(item5);
              await right();
              expect(document.activeElement).toBe(item5);
            });

            it('should not wrap from first to last focusable item', async () => {
              fixture.componentInstance.widgets[5].disabled.set(true);
              await fixture.whenStable();
              const item0 = getWidgetEl('item 0')!;
              await click(item0);
              await left();
              expect(document.activeElement).toBe(item0);
            });
          });
        });
      });

      describe('with rtl text direction', () => {
        beforeEach(async () => await setupToolbar({textDirection: 'rtl'}));

        it('should navigate on click (horizontal, rtl)', async () => {
          const item3 = getWidgetEl('item 3')!;
          await click(item3);
          expect(document.activeElement).toBe(item3);
        });

        it('should navigate next on ArrowLeft', async () => {
          const item0 = getWidgetEl('item 0')!;
          await click(item0);
          await left();
          expect(document.activeElement).toBe(getWidgetEl('item 1'));
        });

        it('should navigate prev on ArrowRight', async () => {
          await click(getWidgetEl('item 1')!);
          await right();
          expect(document.activeElement).toBe(getWidgetEl('item 0'));
        });

        it('should not navigate next on ArrowDown when not in a widget group (horizontal, rtl)', async () => {
          const item0 = getWidgetEl('item 0')!;
          await click(item0);
          await down();
          expect(document.activeElement).toBe(item0);
        });

        it('should not navigate prev on ArrowUp when not in a widget group (horizontal, rtl)', async () => {
          const item0 = getWidgetEl('item 0')!;
          await click(item0);
          await up();
          expect(document.activeElement).toBe(item0);
        });

        it('should navigate next in a widget group on ArrowDown (horizontal, rtl)', async () => {
          const item2 = getWidgetEl('item 2')!;
          await click(item2);
          await down();
          expect(document.activeElement).toBe(getWidgetEl('item 3'));
        });

        it('should navigate prev in a widget group on ArrowUp (horizontal, rtl)', async () => {
          const item3 = getWidgetEl('item 3')!;
          await click(item3);
          await up();
          expect(document.activeElement).toBe(getWidgetEl('item 2'));
        });

        it('should navigate first to last in a widget group on ArrowUp (horizontal, rtl)', async () => {
          const item2 = getWidgetEl('item 2')!;
          await click(item2);
          await up();
          expect(document.activeElement).toBe(getWidgetEl('item 4'));
        });

        it('should navigate last to first in a widget group on ArrowDown (horizontal, rtl)', async () => {
          const item4 = getWidgetEl('item 4')!;
          await click(item4);
          await down();
          expect(document.activeElement).toBe(getWidgetEl('item 2'));
        });
      });
    });

    describe('with vertical orientation', () => {
      beforeEach(async () => await setupToolbar({orientation: 'vertical'}));

      it('should navigate next on ArrowDown', async () => {
        const item0 = getWidgetEl('item 0')!;
        await click(item0);
        await down();
        expect(document.activeElement).toBe(getWidgetEl('item 1'));
      });

      it('should navigate prev on ArrowUp', async () => {
        const item1 = getWidgetEl('item 1')!;
        await click(item1);
        await up();
        expect(document.activeElement).toBe(getWidgetEl('item 0'));
      });

      it('should not navigate next on ArrowRight when not in a widget group', async () => {
        const item0 = getWidgetEl('item 0')!;
        await click(item0);
        await right();
        expect(document.activeElement).toBe(item0);
      });

      it('should not navigate prev on ArrowLeft when not in a widget group', async () => {
        const item0 = getWidgetEl('item 0')!;
        await click(item0);
        await left();
        expect(document.activeElement).toBe(item0);
      });

      it('should navigate next in a widget group on ArrowRight', async () => {
        const item2 = getWidgetEl('item 2')!;
        await click(item2);
        await right();
        expect(document.activeElement).toBe(getWidgetEl('item 3'));
      });

      it('should navigate prev in a widget group on ArrowLeft', async () => {
        const item3 = getWidgetEl('item 3')!;
        await click(item3);
        await left();
        expect(document.activeElement).toBe(getWidgetEl('item 2'));
      });

      it('should navigate last to first in a widget group on ArrowRight', async () => {
        const item4 = getWidgetEl('item 4')!;
        await click(item4);
        await right();
        expect(document.activeElement).toBe(getWidgetEl('item 2'));
      });

      it('should navigate first to last in a widget group on ArrowLeft', async () => {
        const item2 = getWidgetEl('item 2')!;
        await click(item2);
        await left();
        expect(document.activeElement).toBe(getWidgetEl('item 4'));
      });
    });

    describe('with disabled toolbar', () => {
      it('should not navigate on any key press', async () => {
        await setupToolbar({disabled: true});
        const item0 = getWidgetEl('item 0')!;
        const initialActiveElement = document.activeElement;
        await click(item0);
        expect(document.activeElement).toBe(initialActiveElement);

        await right();
        expect(document.activeElement).toBe(initialActiveElement);

        await left();
        expect(document.activeElement).toBe(initialActiveElement);

        await down();
        expect(document.activeElement).toBe(initialActiveElement);

        await up();
        expect(document.activeElement).toBe(initialActiveElement);

        await home();
        expect(document.activeElement).toBe(initialActiveElement);

        await end();
        expect(document.activeElement).toBe(initialActiveElement);
      });
    });

    describe('with wrapped toolbar widgets', () => {
      beforeEach(async () => {
        TestBed.configureTestingModule({imports: [WrappedToolbarExample]});
        fixture = TestBed.createComponent(WrappedToolbarExample) as any;
        await fixture.whenStable();
      });

      it('should navigate on click (wrapped)', async () => {
        const widgets = fixture.debugElement
          .queryAll(By.css('[toolbar-button]'))
          .map((debugEl: DebugElement) => debugEl.nativeElement as HTMLElement);
        await click(widgets[0]);
        expect(document.activeElement).toBe(widgets[0]);
      });
    });
  });

  describe('Selection', () => {
    beforeEach(async () => await setupToolbar());

    it('should toggle the active item on Enter', async () => {
      const item0 = getWidgetEl('item 0')!;
      await click(item0);
      await keydown('Enter');
      expect(item0.getAttribute('aria-pressed')).toBe('false');
      await keydown('Enter');
      expect(item0.getAttribute('aria-pressed')).toBe('true');
    });

    it('should toggle the active item on Space', async () => {
      const item0 = getWidgetEl('item 0')!;
      await click(item0);
      await keydown(' ');
      expect(item0.getAttribute('aria-pressed')).toBe('false');
      await keydown(' ');
      expect(item0.getAttribute('aria-pressed')).toBe('true');
    });

    it('should toggle the active item on click', async () => {
      const item0 = getWidgetEl('item 0')!;
      await click(item0);
      expect(item0.getAttribute('aria-pressed')).toBe('true');
      await click(item0);
      expect(item0.getAttribute('aria-pressed')).toBe('false');
    });

    it('should be able to select multiple items in the toolbar', async () => {
      const item0 = getWidgetEl('item 0')!;
      const item1 = getWidgetEl('item 1')!;
      await click(item0);
      await click(item1);
      expect(item0.getAttribute('aria-pressed')).toBe('true');
      expect(item1.getAttribute('aria-pressed')).toBe('true');
    });

    it('should not be able to select multiple items in a group', async () => {
      const item2 = getWidgetEl('item 2')!;
      const item3 = getWidgetEl('item 3')!;
      await click(item2);
      await click(item3);
      expect(item2.getAttribute('aria-pressed')).toBe('false');
      expect(item3.getAttribute('aria-pressed')).toBe('true');
    });

    it('should not select disabled items', async () => {
      fixture.componentInstance.widgets[1].disabled.set(true);
      await fixture.whenStable();
      const item1 = getWidgetEl('item 1')!;
      await click(item1);
      expect(item1.getAttribute('aria-pressed')).toBe('false');
    });

    it('should not select items in a disabled group', async () => {
      fixture.componentInstance.groups[0].disabled.set(true);
      await fixture.whenStable();
      const item2 = getWidgetEl('item 2')!;
      await click(item2);
      expect(item2.getAttribute('aria-pressed')).toBe('false');
    });
  });

  describe('ARIA attributes and roles', () => {
    beforeEach(async () => await setupToolbar());

    it('should have role="toolbar"', () => {
      expect(toolbarElement.getAttribute('role')).toBe('toolbar');
    });

    it('should set aria-orientation based on input', async () => {
      expect(toolbarElement.getAttribute('aria-orientation')).toBe('horizontal');
      fixture.componentInstance.orientation.set('vertical');
      await fixture.whenStable();
      expect(toolbarElement.getAttribute('aria-orientation')).toBe('vertical');
    });

    it('should set aria-disabled based on input', async () => {
      expect(toolbarElement.getAttribute('aria-disabled')).toBe('false');
      fixture.componentInstance.disabled.set(true);
      await fixture.whenStable();
      expect(toolbarElement.getAttribute('aria-disabled')).toBe('true');
    });
  });

  describe('Focus management', () => {
    beforeEach(async () => await setupToolbar());

    it('should have tabindex on widgets set by active state', async () => {
      const widgets = getWidgetEls();
      expect(widgets[0].getAttribute('tabindex')).toBe('0');
      expect(widgets[1].getAttribute('tabindex')).toBe('-1');

      await click(widgets[1]);
      expect(widgets[0].getAttribute('tabindex')).toBe('-1');
      expect(widgets[1].getAttribute('tabindex')).toBe('0');
    });
  });

  describe('Hard disabled state attributes', () => {
    beforeEach(async () => await setupToolbar({softDisabled: false}));

    it('should set inert and disabled attributes on hard-disabled widgets', async () => {
      fixture.componentInstance.widgets[0].disabled.set(true);
      await fixture.whenStable();

      const widgets = getWidgetEls();
      expect(widgets[0].hasAttribute('inert')).toBe(true);
      expect(widgets[0].getAttribute('disabled')).toBe('true');
    });
  });

  describe('structural validations', () => {
    let consoleSpy: jasmine.Spy;

    beforeEach(() => {
      consoleSpy = spyOn(console, 'warn');
    });

    afterEach(async () => {
      TestBed.resetTestingModule();
      await setupToolbar();
    });

    it('should warn when duplicate values are detected inside ngToolbar', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [ToolbarWithDuplicateValues],
      });
      const duplicateFixture = TestBed.createComponent(ToolbarWithDuplicateValues);
      duplicateFixture.detectChanges();

      expect(consoleSpy).toHaveBeenCalledWith("Duplicate value 'item0' detected inside ngToolbar.");
    });

    it('should warn when ngToolbarWidgetGroup is outside ngToolbar', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [ToolbarGroupOutsideToolbar],
      });
      const noToolbarFixture = TestBed.createComponent(ToolbarGroupOutsideToolbar);
      noToolbarFixture.detectChanges();

      expect(consoleSpy).toHaveBeenCalledWith(
        'ngToolbarWidgetGroup must be placed inside an ngToolbar container.',
      );
    });
  });
});

@Component({
  template: `
    <div
      ngToolbar
      [orientation]="orientation()"
      [softDisabled]="softDisabled()"
      [disabled]="disabled()"
      [wrap]="wrap()"
    >
      <button
        ngToolbarWidget
        #item0="ngToolbarWidget"
        [aria-pressed]="item0.selected()"
        [disabled]="widgets[0].disabled()"
        value="item 0">item 0</button>

      <button
        ngToolbarWidget
        #item1="ngToolbarWidget"
        [aria-pressed]="item1.selected()"
        [disabled]="widgets[1].disabled()"
        value="item 1">item 1</button>

      <div ngToolbarWidgetGroup [disabled]="groups[0].disabled()">
        <button
          ngToolbarWidget
          #item2="ngToolbarWidget"
          [aria-pressed]="item2.selected()"
          [disabled]="widgets[2].disabled()"
          value="item 2">item 2</button>
        <button
          ngToolbarWidget
          #item3="ngToolbarWidget"
          [aria-pressed]="item3.selected()"
          [disabled]="widgets[3].disabled()"
          value="item 3">item 3</button>
        <button
          ngToolbarWidget
          #item4="ngToolbarWidget"
          [aria-pressed]="item4.selected()"
          [disabled]="widgets[4].disabled()"
          value="item 4">item 4</button>
      </div>
      <button
        ngToolbarWidget
        #item5="ngToolbarWidget"
        [aria-pressed]="item5.selected()"
        [disabled]="widgets[5].disabled()"
        value="item 5">item 5</button>
    </div>
  `,
  imports: [Toolbar, ToolbarWidget, ToolbarWidgetGroup],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ToolbarExample {
  orientation = signal<'vertical' | 'horizontal'>('horizontal');
  softDisabled = signal(true);
  disabled = signal(false);
  wrap = signal(true);

  widgets = [
    {disabled: signal(false)},
    {disabled: signal(false)},
    {disabled: signal(false)},
    {disabled: signal(false)},
    {disabled: signal(false)},
    {disabled: signal(false)},
  ];

  groups = [{disabled: signal(false)}];
}

@Directive({
  selector: 'button[toolbar-button]',
  hostDirectives: [{directive: ToolbarWidget, inputs: ['value', 'disabled']}],
  host: {
    type: 'button',
    class: 'example-button material-symbols-outlined',
    '[aria-label]': 'widget.value()',
  },
})
export class SimpleToolbarButton {
  widget = inject(ToolbarWidget);
}

@Component({
  template: `
    <div ngToolbar>
      <button toolbar-button value="undo">undo</button>
      <button toolbar-button value="redo">redo</button>
    </div>
  `,
  imports: [Toolbar, SimpleToolbarButton],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class WrappedToolbarExample {}

@Component({
  template: `
    <div ngToolbar>
      @for (item of items(); track item) {
        <button ngToolbarWidget [value]="item.value">{{item.value}}</button>
      }
    </div>
  `,
  imports: [Toolbar, ToolbarWidget],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ShuffledToolbarExample {
  items = signal([{value: 'item 0'}, {value: 'item 1'}, {value: 'item 2'}]);
}

@Component({
  template: `
    <div ngToolbar>
      <button ngToolbarWidget value="item0">Item 0</button>
      <button ngToolbarWidget value="item0">Item 0 Copy</button>
    </div>
  `,
  imports: [Toolbar, ToolbarWidget],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ToolbarWithDuplicateValues {}

@Component({
  template: `
    <div ngToolbarWidgetGroup>
      Widget Group Content
    </div>
  `,
  imports: [ToolbarWidgetGroup],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ToolbarGroupOutsideToolbar {}
