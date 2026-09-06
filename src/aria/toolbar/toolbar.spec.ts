import {Component, DebugElement, Directive, signal, ChangeDetectionStrategy} from '@angular/core';
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

  describe('Interactions', () => {
    beforeEach(async () => await setupToolbar());

    it('should set active item on click', async () => {
      const item1 = getWidgetEl('item 1')!;
      await click(item1);
      expect(document.activeElement).toBe(item1);
    });

    it('should not intercept Enter or Space key events for toolbar-level selection', async () => {
      const item0 = getWidgetEl('item 0')!;
      await click(item0);
      expect(document.activeElement).toBe(item0);

      await keydown('Enter');
      expect(document.activeElement).toBe(item0);

      await keydown(' ');
      expect(document.activeElement).toBe(item0);
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

  describe('Form controls and embedded widgets', () => {
    let formFixture: ComponentFixture<ToolbarWithFormControlsExample>;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [ToolbarWithFormControlsExample],
        providers: [provideFakeDirectionality('ltr')],
      });
      formFixture = TestBed.createComponent(ToolbarWithFormControlsExample);
      fixture = formFixture as any;
      await formFixture.whenStable();
    });

    it('should not move toolbar focus on ArrowUp/ArrowDown on select in horizontal toolbar', async () => {
      const selectEl = formFixture.debugElement.query(By.css('select'))
        .nativeElement as HTMLElement;
      await click(selectEl);
      expect(document.activeElement).toBe(selectEl);

      await down(selectEl);
      expect(document.activeElement).toBe(selectEl);

      await up(selectEl);
      expect(document.activeElement).toBe(selectEl);
    });

    it('should navigate across toolbar on ArrowRight / ArrowLeft from select', async () => {
      const selectEl = formFixture.debugElement.query(By.css('select'))
        .nativeElement as HTMLElement;
      const inputEl = formFixture.debugElement.query(By.css('input')).nativeElement as HTMLElement;
      const buttons = formFixture.debugElement
        .queryAll(By.css('button'))
        .map(de => de.nativeElement as HTMLElement);

      await click(selectEl);
      expect(document.activeElement).toBe(selectEl);

      await right(selectEl);
      expect(document.activeElement).toBe(inputEl);

      await right(inputEl);
      expect(document.activeElement).toBe(buttons[1]); // Italic button

      await left(buttons[1]);
      expect(document.activeElement).toBe(inputEl);

      await left(inputEl);
      expect(document.activeElement).toBe(selectEl);

      await left(selectEl);
      expect(document.activeElement).toBe(buttons[0]); // Bold button
    });

    it('should not move toolbar focus on ArrowUp/ArrowDown on number input in horizontal toolbar', async () => {
      const inputEl = formFixture.debugElement.query(By.css('input')).nativeElement as HTMLElement;
      await click(inputEl);
      expect(document.activeElement).toBe(inputEl);

      await down(inputEl);
      expect(document.activeElement).toBe(inputEl);

      await up(inputEl);
      expect(document.activeElement).toBe(inputEl);
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
        [disabled]="widgets[0].disabled()">item 0</button>

      <button
        ngToolbarWidget
        [disabled]="widgets[1].disabled()">item 1</button>

      <div ngToolbarWidgetGroup [disabled]="groups[0].disabled()">
        <button
          ngToolbarWidget
          [disabled]="widgets[2].disabled()">item 2</button>
        <button
          ngToolbarWidget
          [disabled]="widgets[3].disabled()">item 3</button>
        <button
          ngToolbarWidget
          [disabled]="widgets[4].disabled()">item 4</button>
      </div>
      <button
        ngToolbarWidget
        [disabled]="widgets[5].disabled()">item 5</button>
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
  hostDirectives: [{directive: ToolbarWidget, inputs: ['disabled']}],
  host: {
    type: 'button',
    class: 'example-button material-symbols-outlined',
  },
})
export class SimpleToolbarButton {}

@Component({
  template: `
    <div ngToolbar>
      <button toolbar-button>undo</button>
      <button toolbar-button>redo</button>
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
        <button ngToolbarWidget>{{item.value}}</button>
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
    <div ngToolbarWidgetGroup>
      Widget Group Content
    </div>
  `,
  imports: [ToolbarWidgetGroup],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ToolbarGroupOutsideToolbar {}

@Component({
  template: `
    <div ngToolbar>
      <button ngToolbarWidget>Bold</button>
      <select ngToolbarWidget aria-label="Font family">
        <option value="sans-serif">Sans-Serif</option>
        <option value="serif">Serif</option>
      </select>
      <input ngToolbarWidget type="number" value="16" aria-label="Font size" />
      <button ngToolbarWidget>Italic</button>
    </div>
  `,
  imports: [Toolbar, ToolbarWidget],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ToolbarWithFormControlsExample {}
