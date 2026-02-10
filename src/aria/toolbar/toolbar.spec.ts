import {Component, DebugElement, Directive, inject, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {provideFakeDirectionality, runAccessibilityChecks} from '@angular/cdk/testing/private';
import {Toolbar} from './toolbar';
import {ToolbarWidgetGroup} from './toolbar-widget-group';
import {ToolbarWidget} from './toolbar-widget';

describe('Toolbar', () => {
  let fixture: ComponentFixture<ToolbarExample>;
  let toolbarElement: HTMLElement;

  const keydown = (key: string, target?: HTMLElement, modifierKeys: {} = {}) => {
    const eventTarget = target || toolbarElement;
    eventTarget.dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        ...modifierKeys,
      }),
    );
    fixture.detectChanges();
  };

  const click = (element: HTMLElement, eventInit?: PointerEventInit) => {
    element.dispatchEvent(
      // Include pointerType to better simulate a real mouse click v.s. enter keyboard event.
      new PointerEvent('click', {bubbles: true, pointerType: 'mouse', ...eventInit}),
    );
    fixture.detectChanges();
  };

  const right = (target?: HTMLElement, modifierKeys?: {}) =>
    keydown('ArrowRight', target, modifierKeys);
  const left = (target?: HTMLElement, modifierKeys?: {}) =>
    keydown('ArrowLeft', target, modifierKeys);
  const up = (target?: HTMLElement, modifierKeys?: {}) => keydown('ArrowUp', target, modifierKeys);
  const down = (target?: HTMLElement, modifierKeys?: {}) =>
    keydown('ArrowDown', target, modifierKeys);
  const home = (target?: HTMLElement, modifierKeys?: {}) => keydown('Home', target, modifierKeys);
  const end = (target?: HTMLElement, modifierKeys?: {}) => keydown('End', target, modifierKeys);

  function setupToolbar(
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

    fixture.detectChanges();
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

  describe('Navigation', () => {
    describe('with horizontal orientation', () => {
      it('should navigate on click', () => {
        setupToolbar();
        const item3 = getWidgetEl('item 3')!;
        click(item3);
        expect(document.activeElement).toBe(item3);
      });

      describe('with ltr text direction', () => {
        beforeEach(() => setupToolbar());

        it('should navigate next on ArrowRight', () => {
          const item0 = getWidgetEl('item 0')!;
          click(item0);
          right();
          expect(document.activeElement).toBe(getWidgetEl('item 1'));
        });

        it('should navigate prev on ArrowLeft', () => {
          const item1 = getWidgetEl('item 1')!;
          click(item1);
          left();
          expect(document.activeElement).toBe(getWidgetEl('item 0'));
        });

        it('should not navigate next on ArrowDown when not in a widget group', () => {
          const item0 = getWidgetEl('item 0')!;
          click(item0);
          down();
          expect(document.activeElement).toBe(item0);
        });

        it('should not navigate prev on ArrowUp when not in a widget group', () => {
          const item0 = getWidgetEl('item 0')!;
          click(item0);
          up();
          expect(document.activeElement).toBe(item0);
        });

        it('should navigate next in a widget group on ArrowDown', () => {
          const item2 = getWidgetEl('item 2')!;
          click(item2);
          down();
          expect(document.activeElement).toBe(getWidgetEl('item 3'));
        });

        it('should navigate prev in a widget group on ArrowUp', () => {
          const item3 = getWidgetEl('item 3')!;
          click(item3);
          up();
          expect(document.activeElement).toBe(getWidgetEl('item 2'));
        });

        it('should navigate last to first in a widget group on ArrowDown', () => {
          const item4 = getWidgetEl('item 4')!;
          click(item4);
          down();
          expect(document.activeElement).toBe(getWidgetEl('item 2'));
        });

        it('should navigate first to last in a widget group on ArrowUp', () => {
          const item2 = getWidgetEl('item 2')!;
          click(item2);
          up();
          expect(document.activeElement).toBe(getWidgetEl('item 4'));
        });

        describe('with wrap false', () => {
          beforeEach(() => {
            fixture.componentInstance.wrap.set(false);
            fixture.detectChanges();
          });

          it('should not wrap from last to first', () => {
            const item5 = getWidgetEl('item 5')!;
            click(item5);
            right();
            expect(document.activeElement).toBe(item5);
          });

          it('should not wrap from first to last', () => {
            const item0 = getWidgetEl('item 0')!;
            click(item0);
            left();
            expect(document.activeElement).toBe(item0);
          });
        });

        describe('with softDisabled true', () => {
          beforeEach(() => {
            fixture.componentInstance.softDisabled.set(true);
            fixture.detectChanges();
          });

          it('should not skip disabled items when navigating next', () => {
            fixture.componentInstance.widgets[1].disabled.set(true);
            fixture.detectChanges();
            click(getWidgetEl('item 0')!);
            right();
            expect(document.activeElement).toBe(getWidgetEl('item 1'));
          });

          it('should not skip disabled items when navigating prev', () => {
            fixture.componentInstance.widgets[1].disabled.set(true);
            fixture.detectChanges();
            const item2 = getWidgetEl('item 2')!;
            click(item2);
            left();
            expect(document.activeElement).toBe(getWidgetEl('item 1'));
          });

          it('should not skip disabled groups when navigating next', () => {
            fixture.componentInstance.groups[0].disabled.set(true);
            fixture.detectChanges();
            const item1 = getWidgetEl('item 1')!;
            click(item1);
            right();
            expect(document.activeElement).toBe(getWidgetEl('item 2'));
          });

          it('should not skip disabled groups when navigating prev', () => {
            fixture.componentInstance.groups[0].disabled.set(true);
            fixture.detectChanges();
            const item5 = getWidgetEl('item 5')!;
            click(item5);
            left();
            expect(document.activeElement).toBe(getWidgetEl('item 4'));
          });

          it('should navigate to the last item on End', () => {
            const item0 = getWidgetEl('item 0')!;
            click(item0);
            end();
            expect(document.activeElement).toBe(getWidgetEl('item 5'));
          });

          it('should navigate to the first item on Home', () => {
            const item5 = getWidgetEl('item 5')!;
            click(item5);
            home();
            expect(document.activeElement).toBe(getWidgetEl('item 0'));
          });

          describe('with wrap true', () => {
            beforeEach(() => {
              fixture.componentInstance.wrap.set(true);
              fixture.detectChanges();
            });

            it('should wrap from last to first', () => {
              const item5 = getWidgetEl('item 5')!;
              click(item5);
              right();
              expect(document.activeElement).toBe(getWidgetEl('item 0'));
            });

            it('should wrap from first to last', () => {
              const item0 = getWidgetEl('item 0')!;
              click(item0);
              left();
              expect(document.activeElement).toBe(getWidgetEl('item 5'));
            });
          });
        });

        describe('with softDisabled false', () => {
          beforeEach(() => {
            fixture.componentInstance.softDisabled.set(false);
            fixture.detectChanges();
          });

          it('should not navigate to disabled items on click', () => {
            fixture.componentInstance.widgets[1].disabled.set(true);
            fixture.detectChanges();
            const item1 = getWidgetEl('item 1')!;
            click(item1);
            expect(document.activeElement).not.toBe(item1);
          });

          it('should skip disabled items when navigating next', () => {
            fixture.componentInstance.widgets[1].disabled.set(true);
            fixture.detectChanges();
            const item0 = getWidgetEl('item 0')!;
            click(item0);
            right();
            expect(document.activeElement).toBe(getWidgetEl('item 2'));
          });

          it('should skip disabled items when navigating prev', () => {
            fixture.componentInstance.widgets[1].disabled.set(true);
            fixture.detectChanges();
            const item2 = getWidgetEl('item 2')!;
            click(item2);
            left();
            expect(document.activeElement).toBe(getWidgetEl('item 0'));
          });

          it('should not navigate to items in disabled groups on click', () => {
            fixture.componentInstance.groups[0].disabled.set(true);
            fixture.detectChanges();
            const item3 = getWidgetEl('item 3')!;
            click(item3);
            expect(document.activeElement).not.toBe(item3);
          });

          it('should skip disabled groups when navigating next', () => {
            fixture.componentInstance.groups[0].disabled.set(true);
            fixture.detectChanges();
            const item1 = getWidgetEl('item 1')!;
            click(item1);
            right();
            expect(document.activeElement).toBe(getWidgetEl('item 5'));
          });

          it('should skip disabled groups when navigating prev', () => {
            fixture.componentInstance.groups[0].disabled.set(true);
            fixture.detectChanges();
            const item5 = getWidgetEl('item 5')!;
            click(item5);
            left();
            expect(document.activeElement).toBe(getWidgetEl('item 1'));
          });

          it('should navigate to the last focusable item on End', () => {
            fixture.componentInstance.widgets[5].disabled.set(true);
            fixture.detectChanges();
            const item0 = getWidgetEl('item 0')!;
            click(item0);
            end();
            expect(document.activeElement).toBe(getWidgetEl('item 4'));
          });

          it('should navigate to the first focusable item on Home', () => {
            fixture.componentInstance.widgets[0].disabled.set(true);
            fixture.detectChanges();
            const item5 = getWidgetEl('item 5')!;
            click(item5);
            home();
            expect(document.activeElement).toBe(getWidgetEl('item 1'));
          });

          describe('with wrap true', () => {
            beforeEach(() => {
              fixture.componentInstance.wrap.set(true);
              fixture.detectChanges();
            });

            it('should wrap from last to first focusable item', () => {
              fixture.componentInstance.widgets[0].disabled.set(true);
              fixture.detectChanges();
              const item5 = getWidgetEl('item 5')!;
              click(item5);
              right();
              expect(document.activeElement).toBe(getWidgetEl('item 1'));
            });

            it('should wrap from first to last focusable item', () => {
              fixture.componentInstance.widgets[5].disabled.set(true);
              fixture.detectChanges();
              const item0 = getWidgetEl('item 0')!;
              click(item0);
              left();
              expect(document.activeElement).toBe(getWidgetEl('item 4'));
            });
          });

          describe('with wrap false', () => {
            beforeEach(() => {
              fixture.componentInstance.wrap.set(false);
              fixture.detectChanges();
            });

            it('should not wrap from last to first focusable item', () => {
              fixture.componentInstance.widgets[0].disabled.set(true);
              fixture.detectChanges();
              const item5 = getWidgetEl('item 5')!;
              click(item5);
              right();
              expect(document.activeElement).toBe(item5);
            });

            it('should not wrap from first to last focusable item', () => {
              fixture.componentInstance.widgets[5].disabled.set(true);
              fixture.detectChanges();
              const item0 = getWidgetEl('item 0')!;
              click(item0);
              left();
              expect(document.activeElement).toBe(item0);
            });
          });
        });
      });

      describe('with rtl text direction', () => {
        beforeEach(() => setupToolbar({textDirection: 'rtl'}));

        it('should navigate on click', () => {
          const item3 = getWidgetEl('item 3')!;
          click(item3);
          expect(document.activeElement).toBe(item3);
        });

        it('should navigate next on ArrowLeft', () => {
          const item0 = getWidgetEl('item 0')!;
          click(item0);
          left();
          expect(document.activeElement).toBe(getWidgetEl('item 1'));
        });

        it('should navigate prev on ArrowRight', () => {
          click(getWidgetEl('item 1')!);
          right();
          expect(document.activeElement).toBe(getWidgetEl('item 0'));
        });

        it('should not navigate next on ArrowDown when not in a widget group', () => {
          const item0 = getWidgetEl('item 0')!;
          click(item0);
          down();
          expect(document.activeElement).toBe(item0);
        });

        it('should not navigate prev on ArrowUp when not in a widget group', () => {
          const item0 = getWidgetEl('item 0')!;
          click(item0);
          up();
          expect(document.activeElement).toBe(item0);
        });

        it('should navigate next in a widget group on ArrowDown', () => {
          const item2 = getWidgetEl('item 2')!;
          click(item2);
          down();
          expect(document.activeElement).toBe(getWidgetEl('item 3'));
        });

        it('should navigate prev in a widget group on ArrowUp', () => {
          const item3 = getWidgetEl('item 3')!;
          click(item3);
          up();
          expect(document.activeElement).toBe(getWidgetEl('item 2'));
        });

        it('should navigate first to last in a widget group on ArrowUp', () => {
          const item2 = getWidgetEl('item 2')!;
          click(item2);
          up();
          expect(document.activeElement).toBe(getWidgetEl('item 4'));
        });

        it('should navigate last to first in a widget group on ArrowDown', () => {
          const item4 = getWidgetEl('item 4')!;
          click(item4);
          down();
          expect(document.activeElement).toBe(getWidgetEl('item 2'));
        });
      });
    });

    describe('with vertical orientation', () => {
      beforeEach(() => setupToolbar({orientation: 'vertical'}));

      it('should navigate next on ArrowDown', () => {
        const item0 = getWidgetEl('item 0')!;
        click(item0);
        down();
        expect(document.activeElement).toBe(getWidgetEl('item 1'));
      });

      it('should navigate prev on ArrowUp', () => {
        const item1 = getWidgetEl('item 1')!;
        click(item1);
        up();
        expect(document.activeElement).toBe(getWidgetEl('item 0'));
      });

      it('should not navigate next on ArrowRight when not in a widget group', () => {
        const item0 = getWidgetEl('item 0')!;
        click(item0);
        right();
        expect(document.activeElement).toBe(item0);
      });

      it('should not navigate prev on ArrowLeft when not in a widget group', () => {
        const item0 = getWidgetEl('item 0')!;
        click(item0);
        left();
        expect(document.activeElement).toBe(item0);
      });

      it('should navigate next in a widget group on ArrowRight', () => {
        const item2 = getWidgetEl('item 2')!;
        click(item2);
        right();
        expect(document.activeElement).toBe(getWidgetEl('item 3'));
      });

      it('should navigate prev in a widget group on ArrowLeft', () => {
        const item3 = getWidgetEl('item 3')!;
        click(item3);
        left();
        expect(document.activeElement).toBe(getWidgetEl('item 2'));
      });

      it('should navigate last to first in a widget group on ArrowRight', () => {
        const item4 = getWidgetEl('item 4')!;
        click(item4);
        right();
        expect(document.activeElement).toBe(getWidgetEl('item 2'));
      });

      it('should navigate first to last in a widget group on ArrowLeft', () => {
        const item2 = getWidgetEl('item 2')!;
        click(item2);
        left();
        expect(document.activeElement).toBe(getWidgetEl('item 4'));
      });
    });

    describe('with disabled toolbar', () => {
      it('should not navigate on any key press', () => {
        setupToolbar({disabled: true});
        const item0 = getWidgetEl('item 0')!;
        const initialActiveElement = document.activeElement;
        click(item0);
        expect(document.activeElement).toBe(initialActiveElement);

        right();
        expect(document.activeElement).toBe(initialActiveElement);

        left();
        expect(document.activeElement).toBe(initialActiveElement);

        down();
        expect(document.activeElement).toBe(initialActiveElement);

        up();
        expect(document.activeElement).toBe(initialActiveElement);

        home();
        expect(document.activeElement).toBe(initialActiveElement);

        end();
        expect(document.activeElement).toBe(initialActiveElement);
      });
    });

    describe('with wrapped toolbar widgets', () => {
      beforeEach(() => {
        TestBed.configureTestingModule({imports: [WrappedToolbarExample]});
        fixture = TestBed.createComponent(WrappedToolbarExample) as any;
        fixture.detectChanges();
      });

      it('should navigate on click', () => {
        const widgets = fixture.debugElement
          .queryAll(By.css('[toolbar-button]'))
          .map((debugEl: DebugElement) => debugEl.nativeElement as HTMLElement);
        click(widgets[0]);
        expect(document.activeElement).toBe(widgets[0]);
      });
    });
  });

  describe('Selection', () => {
    beforeEach(() => setupToolbar());

    it('should toggle the active item on Enter', () => {
      const item0 = getWidgetEl('item 0')!;
      click(item0);
      keydown('Enter');
      expect(item0.getAttribute('aria-pressed')).toBe('false');
      keydown('Enter');
      expect(item0.getAttribute('aria-pressed')).toBe('true');
    });

    it('should toggle the active item on Space', () => {
      const item0 = getWidgetEl('item 0')!;
      click(item0);
      keydown(' ');
      expect(item0.getAttribute('aria-pressed')).toBe('false');
      keydown(' ');
      expect(item0.getAttribute('aria-pressed')).toBe('true');
    });

    it('should toggle the active item on click', () => {
      const item0 = getWidgetEl('item 0')!;
      click(item0);
      expect(item0.getAttribute('aria-pressed')).toBe('true');
      click(item0);
      expect(item0.getAttribute('aria-pressed')).toBe('false');
    });

    it('should be able to select multiple items in the toolbar', () => {
      const item0 = getWidgetEl('item 0')!;
      const item1 = getWidgetEl('item 1')!;
      click(item0);
      click(item1);
      expect(item0.getAttribute('aria-pressed')).toBe('true');
      expect(item1.getAttribute('aria-pressed')).toBe('true');
    });

    it('should not be able to select multiple items in a group', () => {
      const item2 = getWidgetEl('item 2')!;
      const item3 = getWidgetEl('item 3')!;
      click(item2);
      click(item3);
      expect(item2.getAttribute('aria-pressed')).toBe('false');
      expect(item3.getAttribute('aria-pressed')).toBe('true');
    });

    it('should not select disabled items', () => {
      fixture.componentInstance.widgets[1].disabled.set(true);
      fixture.detectChanges();
      const item1 = getWidgetEl('item 1')!;
      click(item1);
      expect(item1.getAttribute('aria-pressed')).toBe('false');
    });

    it('should not select items in a disabled group', () => {
      fixture.componentInstance.groups[0].disabled.set(true);
      fixture.detectChanges();
      const item2 = getWidgetEl('item 2')!;
      click(item2);
      expect(item2.getAttribute('aria-pressed')).toBe('false');
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
})
class WrappedToolbarExample {}
