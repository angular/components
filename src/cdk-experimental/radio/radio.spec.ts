import {Component, DebugElement, EventEmitter, signal, Type, WritableSignal} from '@angular/core';
import {CdkRadioButton, CdkRadioGroup} from './radio';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {BidiModule, Direction, Directionality} from '@angular/cdk/bidi';
import axe from 'axe-core';

// Basic ANSI color functions because chalk has issues with unit tests.
const colors = {
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  magenta: (text: string) => `\x1b[35m${text}\x1b[0m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
  gray: (text: string) => `\x1b[90m${text}\x1b[0m`,
  underline: (text: string) => `\x1b[4m${text}\x1b[0m`,
  default: (text: string) => `\x1b[0m${text}\x1b[0m`,
};

// TODO: Move this to a separate folder/file so it can be reused across components.
async function getAccessibilityViolationsReport(root: HTMLElement): Promise<string | null> {
  const results = await axe.run(root);

  if (!results.violations.length) {
    return null;
  }

  const reportLines: string[] = [];
  const append = (text: string) => reportLines.push(colors.default(text));
  append(colors.red(`Found ${results.violations.length} accessibility violation(s):`));

  results.violations.forEach((violation, index) => {
    append('');
    append(colors.red(`Violation ${index + 1}: ${violation.id}\n`));

    let impactText = violation.impact || 'unknown';
    switch (violation.impact) {
      case 'critical':
        impactText = colors.red(impactText);
        break;
      case 'serious':
        impactText = colors.yellow(impactText);
        break;
      case 'moderate':
        impactText = colors.blue(impactText);
        break;
      case 'minor':
        impactText = colors.gray(impactText);
        break;
      default:
        impactText = colors.default(impactText);
        break;
    }

    append(`  Impact: ${impactText}`);
    append(`  Description: ${violation.description}`);
    append(`  Help: ${violation.help}`);
    append(`  Help URL: ${colors.underline(colors.blue(violation.helpUrl))}\n`);

    if (violation.nodes && violation.nodes.length > 0) {
      append('  Failing Elements:');
      violation.nodes.forEach((node, nodeIndex) => {
        append(colors.cyan(`    Node ${nodeIndex + 1}:`));
        if (node.target && node.target.length > 0) {
          append(`      Selector: ${colors.magenta(node.target.join(', '))}`);
        }
        if (node.failureSummary) {
          append('      Failure Summary:');
          node.failureSummary
            .split('\n')
            .forEach(line => append(colors.yellow(`        ${line.trim()}`)));
        }
      });
    }
  });

  return reportLines.join('\n');
}

describe('CdkRadioGroup', () => {
  let fixture: ComponentFixture<RadioGroupExample>;
  let textDirection = new EventEmitter<Direction>();

  let radioGroup: DebugElement;
  let radioButtons: DebugElement[];
  let radioGroupInstance: CdkRadioGroup<number>;
  let radioGroupElement: HTMLElement;
  let radioButtonElements: HTMLElement[];

  const keydown = (key: string) => {
    radioGroupElement.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, key}));
    fixture.detectChanges();
  };

  const click = (index: number) => {
    radioButtonElements[index].dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}));
    fixture.detectChanges();
  };

  const space = () => keydown(' ');
  const enter = () => keydown('Enter');
  const up = () => keydown('ArrowUp');
  const down = () => keydown('ArrowDown');
  const left = () => keydown('ArrowLeft');
  const right = () => keydown('ArrowRight');
  const home = () => keydown('Home');
  const end = () => keydown('End');

  function setupTestEnvironment<T>(component: Type<T>) {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Directionality,
          useValue: {value: 'ltr', change: textDirection},
        },
      ],
      imports: [BidiModule, component],
    }).compileComponents();

    const fixture = TestBed.createComponent<T>(component);
    fixture.detectChanges();
    defineTestVariables(fixture);
    return fixture;
  }

  function defineTestVariables(fixture: ComponentFixture<unknown>) {
    radioGroup = fixture.debugElement.query(By.directive(CdkRadioGroup));
    radioButtons = fixture.debugElement.queryAll(By.directive(CdkRadioButton));
    radioGroupInstance = radioGroup.injector.get<CdkRadioGroup<number>>(CdkRadioGroup);
    radioGroupElement = radioGroup.nativeElement;
    radioButtonElements = radioButtons.map(radioButton => radioButton.nativeElement);
  }

  function setupRadioGroup(opts?: {
    orientation?: 'horizontal' | 'vertical';
    disabled?: boolean;
    readonly?: boolean;
    value?: number | null;
    skipDisabled?: boolean;
    focusMode?: 'roving' | 'activedescendant';
    disabledOptions?: number[];
    options?: TestOption[];
    textDirection?: Direction;
  }) {
    const testComponent = fixture.componentInstance;

    if (opts?.orientation !== undefined) {
      testComponent.orientation.set(opts.orientation);
    }
    if (opts?.disabled !== undefined) {
      testComponent.disabled.set(opts.disabled);
    }
    if (opts?.readonly !== undefined) {
      testComponent.readonly.set(opts.readonly);
    }
    if (opts?.value !== undefined) {
      testComponent.value.set(opts.value);
    }
    if (opts?.skipDisabled !== undefined) {
      testComponent.skipDisabled.set(opts.skipDisabled);
    }
    if (opts?.focusMode !== undefined) {
      testComponent.focusMode.set(opts.focusMode);
    }
    if (opts?.options !== undefined) {
      testComponent.options.set(opts.options);
    }
    if (opts?.disabledOptions !== undefined) {
      opts.disabledOptions.forEach(index => {
        testComponent.options()[index].disabled.set(true);
      });
    }
    if (opts?.textDirection !== undefined) {
      textDirection.emit(opts.textDirection);
    }
    fixture.detectChanges();
    defineTestVariables(fixture); // Ensure env vars are up-to-date with the dom.
  }

  afterEach(async () => {
    const report = await getAccessibilityViolationsReport(radioGroupElement);

    if (report) {
      fail(report);
    }
  });

  describe('ARIA attributes and roles', () => {
    describe('default configuration', () => {
      beforeEach(() => {
        setupTestEnvironment(DefaultRadioGroupExample);
      });

      it('should correctly set the role attribute to "radiogroup"', () => {
        expect(radioGroupElement.getAttribute('role')).toBe('radiogroup');
      });

      it('should correctly set the role attribute to "radio" for the radio buttons', () => {
        radioButtonElements.forEach(radioButtonElement => {
          expect(radioButtonElement.getAttribute('role')).toBe('radio');
        });
      });

      it('should set aria-orientation to "horizontal"', () => {
        expect(radioGroupElement.getAttribute('aria-orientation')).toBe('horizontal');
      });

      it('should set aria-disabled to false', () => {
        expect(radioGroupElement.getAttribute('aria-disabled')).toBe('false');
      });

      it('should set aria-readonly to false', () => {
        expect(radioGroupElement.getAttribute('aria-readonly')).toBe('false');
      });
    });

    describe('custom configuration', () => {
      beforeEach(() => {
        fixture = setupTestEnvironment(RadioGroupExample);
      });

      it('should be able to set aria-orientation to "vertical"', () => {
        setupRadioGroup({orientation: 'vertical'});
        expect(radioGroupElement.getAttribute('aria-orientation')).toBe('vertical');
      });

      it('should be able to set aria-disabled to true', () => {
        setupRadioGroup({disabled: true});
        expect(radioGroupElement.getAttribute('aria-disabled')).toBe('true');
      });

      it('should be able to set aria-readonly to true', () => {
        setupRadioGroup({readonly: true});
        expect(radioGroupElement.getAttribute('aria-readonly')).toBe('true');
      });
    });

    describe('roving focus mode', () => {
      beforeEach(() => {
        fixture = setupTestEnvironment(RadioGroupExample);
      });

      it('should have tabindex="-1" when focusMode is "roving"', () => {
        setupRadioGroup({focusMode: 'roving'});
        expect(radioGroupElement.getAttribute('tabindex')).toBe('-1');
      });

      it('should set tabindex="0" when disabled', () => {
        setupRadioGroup({disabled: true, focusMode: 'roving'});
        expect(radioGroupElement.getAttribute('tabindex')).toBe('0');
      });

      it('should set initial focus on the selected option', () => {
        setupRadioGroup({focusMode: 'roving', value: 3});
        expect(radioButtonElements[3].getAttribute('tabindex')).toBe('0');
      });

      it('should set initial focus on the first option if none are selected', () => {
        setupRadioGroup({focusMode: 'roving'});
        expect(radioButtonElements[0].getAttribute('tabindex')).toBe('0');
      });

      it('should not have aria-activedescendant when focusMode is "roving"', () => {
        setupRadioGroup({focusMode: 'roving'});
        expect(radioGroupElement.getAttribute('aria-activedescendant')).toBeNull();
      });
    });

    describe('activedescendant focus mode', () => {
      beforeEach(() => {
        fixture = setupTestEnvironment(RadioGroupExample);
      });

      it('should have tabindex="0"', () => {
        setupRadioGroup({focusMode: 'activedescendant'});
        expect(radioGroupElement.getAttribute('tabindex')).toBe('0');
      });

      it('should set initial focus on the selected option', () => {
        setupRadioGroup({focusMode: 'activedescendant', value: 3});
        expect(radioGroupElement.getAttribute('aria-activedescendant')).toBe(
          radioButtonElements[3].id,
        );
      });

      it('should set initial focus on the first option if none are selected', () => {
        setupRadioGroup({focusMode: 'activedescendant'});
        expect(radioGroupElement.getAttribute('aria-activedescendant')).toBe(
          radioButtonElements[0].id,
        );
      });
    });
  });

  describe('value and selection', () => {
    beforeEach(() => {
      fixture = setupTestEnvironment(RadioGroupExample);
    });

    it('should select the radio button corresponding to the value input', () => {
      radioGroupInstance.value.set(1);
      fixture.detectChanges();
      expect(radioButtonElements[1].getAttribute('aria-checked')).toBe('true');
    });

    describe('pointer interaction', () => {
      it('should update the group value when a radio button is selected via pointer click', () => {
        click(1);
        expect(radioButtonElements[1].getAttribute('aria-checked')).toBe('true');
      });

      it('should only allow one radio button to be selected at a time', () => {
        click(1);
        click(2);
        expect(radioButtonElements[0].getAttribute('aria-checked')).toBe('false');
        expect(radioButtonElements[1].getAttribute('aria-checked')).toBe('false');
        expect(radioButtonElements[2].getAttribute('aria-checked')).toBe('true');
        expect(radioButtonElements[3].getAttribute('aria-checked')).toBe('false');
        expect(radioButtonElements[4].getAttribute('aria-checked')).toBe('false');
      });

      it('should not change the value if the radio group is readonly', () => {
        setupRadioGroup({readonly: true});
        click(3);
        expect(radioButtonElements[3].getAttribute('aria-checked')).toBe('false');
      });

      it('should not change the value if the radio group is disabled', () => {
        setupRadioGroup({disabled: true});
        click(3);
        expect(radioButtonElements[3].getAttribute('aria-checked')).toBe('false');
      });

      it('should not change the value if a disabled radio button is clicked', () => {
        setupRadioGroup({disabledOptions: [2]});
        click(2);
        expect(radioButtonElements[2].getAttribute('aria-checked')).toBe('false');
      });

      it('should not change the value if a radio button is clicked in a readonly group', () => {
        setupRadioGroup({readonly: true});
        click(1);
        expect(radioButtonElements[1].getAttribute('aria-checked')).toBe('false');
      });
    });

    describe('keyboard interaction', () => {
      it('should update the group value on Space', () => {
        space();
        expect(radioButtonElements[0].getAttribute('aria-checked')).toBe('true');
      });

      it('should update the group value on Enter', () => {
        enter();
        expect(radioButtonElements[0].getAttribute('aria-checked')).toBe('true');
      });

      it('should not change the value if the radio group is readonly', () => {
        setupRadioGroup({orientation: 'horizontal', readonly: true});
        right();
        expect(radioButtonElements[1].getAttribute('aria-checked')).toBe('false');
      });

      it('should not change the value if the radio group is disabled', () => {
        setupRadioGroup({orientation: 'horizontal', disabled: true});
        right();
        expect(radioButtonElements[1].getAttribute('aria-checked')).toBe('false');
      });

      describe('horizontal orientation', () => {
        beforeEach(() => setupRadioGroup({orientation: 'horizontal'}));

        it('should update the group value on ArrowRight', () => {
          right();
          expect(radioButtonElements[1].getAttribute('aria-checked')).toBe('true');
        });

        it('should update the group value on ArrowLeft', () => {
          right();
          right();
          left();
          expect(radioButtonElements[1].getAttribute('aria-checked')).toBe('true');
        });

        describe('text direction rtl', () => {
          beforeEach(() => setupRadioGroup({textDirection: 'rtl'}));

          it('should update the group value on ArrowLeft', () => {
            left();
            expect(radioButtonElements[1].getAttribute('aria-checked')).toBe('true');
          });

          it('should update the group value on ArrowRight', () => {
            left();
            left();
            right();
            expect(radioButtonElements[1].getAttribute('aria-checked')).toBe('true');
          });
        });
      });

      describe('vertical orientation', () => {
        beforeEach(() => setupRadioGroup({orientation: 'vertical'}));

        it('should update the group value on ArrowDown', () => {
          down();
          expect(radioButtonElements[1].getAttribute('aria-checked')).toBe('true');
        });

        it('should update the group value on ArrowUp', () => {
          down();
          down();
          up();
          expect(radioButtonElements[1].getAttribute('aria-checked')).toBe('true');
        });
      });
    });
  });

  function runNavigationTests(
    focusMode: 'activedescendant' | 'roving',
    isFocused: (index: number) => boolean,
  ) {
    describe(`keyboard navigation (focusMode="${focusMode}")`, () => {
      beforeEach(() => {
        fixture = setupTestEnvironment(RadioGroupExample);
        setupRadioGroup({focusMode});
      });

      it('should move focus to and select the last enabled radio button on End', () => {
        end();
        expect(isFocused(4)).toBe(true);
      });

      it('should move focus to and select the first enabled radio button on Home', () => {
        end();
        home();
        expect(isFocused(0)).toBe(true);
      });

      it('should not allow keyboard navigation or selection if the group is disabled', () => {
        setupRadioGroup({orientation: 'horizontal', disabled: true});
        right();
        expect(isFocused(0)).toBe(false);
      });

      it('should allow keyboard navigation if the group is readonly', () => {
        setupRadioGroup({orientation: 'horizontal', readonly: true});
        right();
        expect(isFocused(1)).toBe(true);
      });

      describe('vertical orientation', () => {
        beforeEach(() => setupRadioGroup({orientation: 'vertical'}));

        it('should move focus to the next radio button on ArrowDown', () => {
          down();
          expect(isFocused(1)).toBe(true);
        });

        it('should move focus to the previous radio button on ArrowUp', () => {
          down();
          down();
          up();
          expect(isFocused(1)).toBe(true);
        });

        it('should skip disabled radio buttons (skipDisabled="true")', () => {
          setupRadioGroup({skipDisabled: true, disabledOptions: [1, 2]});
          down();
          expect(isFocused(3)).toBe(true);
        });

        it('should not skip disabled radio buttons (skipDisabled="false")', () => {
          setupRadioGroup({skipDisabled: false, disabledOptions: [1, 2]});
          down();
          expect(isFocused(1)).toBe(true);
        });
      });

      describe('horizontal orientation', () => {
        beforeEach(() => setupRadioGroup({orientation: 'horizontal'}));

        it('should move focus to the next radio button on ArrowRight', () => {
          right();
          expect(isFocused(1)).toBe(true);
        });

        it('should move focus to the previous radio button on ArrowLeft', () => {
          right();
          right();
          left();
          expect(isFocused(1)).toBe(true);
        });

        it('should skip disabled radio buttons (skipDisabled="true")', () => {
          setupRadioGroup({skipDisabled: true, disabledOptions: [1, 2]});
          right();
          expect(isFocused(3)).toBe(true);
        });

        it('should not skip disabled radio buttons (skipDisabled="false")', () => {
          setupRadioGroup({skipDisabled: false, disabledOptions: [1, 2]});
          right();
          expect(isFocused(1)).toBe(true);
        });

        describe('text direction rtl', () => {
          beforeEach(() => setupRadioGroup({textDirection: 'rtl'}));

          it('should move focus to the next radio button on ArrowLeft', () => {
            setupRadioGroup({orientation: 'horizontal'});
            left();
            expect(isFocused(1)).toBe(true);
          });

          it('should move focus to the previous radio button on ArrowRight', () => {
            setupRadioGroup({orientation: 'horizontal'});
            left();
            left();
            right();
            expect(isFocused(1)).toBe(true);
          });

          it('should skip disabled radio buttons when navigating', () => {
            setupRadioGroup({
              skipDisabled: true,
              disabledOptions: [1, 2],
              orientation: 'horizontal',
            });
            left();
            expect(isFocused(3)).toBe(true);
          });
        });
      });
    });

    describe(`pointer navigation (focusMode="${focusMode}")`, () => {
      beforeEach(() => {
        fixture = setupTestEnvironment(RadioGroupExample);
        setupRadioGroup({focusMode});
      });

      it('should move focus to the clicked radio button', () => {
        click(3);
        expect(isFocused(3)).toBe(true);
      });

      it('should move focus to the clicked radio button if the group is disabled (skipDisabled="true")', () => {
        setupRadioGroup({skipDisabled: true, disabled: true});
        click(3);
        expect(isFocused(3)).toBe(false);
      });

      it('should not move focus to the clicked radio button if the group is disabled (skipDisabled="false")', () => {
        setupRadioGroup({skipDisabled: true, disabled: true});
        click(3);
        expect(isFocused(0)).toBe(false);
      });

      it('should move focus to the clicked radio button if the group is readonly', () => {
        setupRadioGroup({readonly: true});
        click(3);
        expect(isFocused(3)).toBe(true);
      });
    });
  }

  runNavigationTests('roving', i => {
    return radioButtonElements[i].getAttribute('tabindex') === '0';
  });

  runNavigationTests('activedescendant', i => {
    return radioGroupElement.getAttribute('aria-activedescendant') === radioButtonElements[i].id;
  });

  describe('failure cases', () => {
    beforeEach(() => {
      fixture = setupTestEnvironment(RadioGroupExample);
    });

    it('should handle an empty set of radio buttons gracefully', () => {
      setupRadioGroup({options: []});
      expect(radioButtons.length).toBe(0);
    });
  });
});

interface TestOption {
  value: number;
  label: string;
  disabled: WritableSignal<boolean>;
}

@Component({
  template: `
    <div
      [value]="value()"
      [disabled]="disabled()"
      [readonly]="readonly()"
      [focusMode]="focusMode()"
      [orientation]="orientation()"
      [skipDisabled]="skipDisabled()"
      cdkRadioGroup>
      @for (option of options(); track option.value) {
        <div cdkRadioButton [value]="option.value" [disabled]="option.disabled()">{{ option.label }}</div>
      }
    </div>
  `,
  imports: [CdkRadioGroup, CdkRadioButton],
})
class RadioGroupExample {
  options = signal<TestOption[]>([
    {value: 0, label: '0', disabled: signal(false)},
    {value: 1, label: '1', disabled: signal(false)},
    {value: 2, label: '2', disabled: signal(false)},
    {value: 3, label: '3', disabled: signal(false)},
    {value: 4, label: '4', disabled: signal(false)},
  ]);

  disabled = signal<boolean>(false);
  readonly = signal<boolean>(false);
  value = signal<number | null>(null);
  skipDisabled = signal<boolean>(true);
  focusMode = signal<'roving' | 'activedescendant'>('roving');
  orientation = signal<'horizontal' | 'vertical'>('horizontal');
}

@Component({
  template: `
  <div cdkRadioGroup>
    <div cdkRadioButton [value]="0">0</div>
    <div cdkRadioButton [value]="1">1</div>
    <div cdkRadioButton [value]="2">2</div>
  </div>
  `,
  imports: [CdkRadioGroup, CdkRadioButton],
})
class DefaultRadioGroupExample {}
