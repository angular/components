import {Component, DebugElement, signal} from '@angular/core';
import {CdkRadioButton, CdkRadioGroup} from './radio-group';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Direction} from '@angular/cdk/bidi';
import {provideFakeDirectionality, runAccessibilityChecks} from '@angular/cdk/testing/private';

describe('CdkRadioGroup', () => {
  let fixture: ComponentFixture<RadioGroupExample>;
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
    TestBed.configureTestingModule({
      providers: [provideFakeDirectionality(opts?.textDirection ?? 'ltr')],
    });

    fixture = TestBed.createComponent(RadioGroupExample);
    const testComponent = fixture.componentInstance;

    if (opts?.orientation !== undefined) {
      testComponent.orientation = opts.orientation;
    }
    if (opts?.disabled !== undefined) {
      testComponent.disabled = opts.disabled;
    }
    if (opts?.readonly !== undefined) {
      testComponent.readonly = opts.readonly;
    }
    if (opts?.value !== undefined) {
      testComponent.value = opts.value;
    }
    if (opts?.skipDisabled !== undefined) {
      testComponent.skipDisabled = opts.skipDisabled;
    }
    if (opts?.focusMode !== undefined) {
      testComponent.focusMode = opts.focusMode;
    }
    if (opts?.options !== undefined) {
      testComponent.options.set(opts.options);
    }
    if (opts?.disabledOptions !== undefined) {
      opts.disabledOptions.forEach(index => {
        testComponent.options()[index].disabled = true;
      });
    }

    fixture.detectChanges();
    defineTestVariables(fixture);
  }

  function setupDefaultRadioGroup() {
    TestBed.configureTestingModule({
      providers: [provideFakeDirectionality('ltr')],
    });

    const fixture = TestBed.createComponent(DefaultRadioGroupExample);
    fixture.detectChanges();
    defineTestVariables(fixture);
  }

  function defineTestVariables(fixture: ComponentFixture<unknown>) {
    radioGroup = fixture.debugElement.query(By.directive(CdkRadioGroup));
    radioButtons = fixture.debugElement.queryAll(By.directive(CdkRadioButton));
    radioGroupInstance = radioGroup.injector.get<CdkRadioGroup<number>>(CdkRadioGroup);
    radioGroupElement = radioGroup.nativeElement;
    radioButtonElements = radioButtons.map(radioButton => radioButton.nativeElement);
  }

  afterEach(async () => {
    await runAccessibilityChecks(radioGroupElement);
  });

  describe('ARIA attributes and roles', () => {
    describe('default configuration', () => {
      it('should correctly set the role attribute to "radiogroup"', () => {
        setupDefaultRadioGroup();
        expect(radioGroupElement.getAttribute('role')).toBe('radiogroup');
      });

      it('should correctly set the role attribute to "radio" for the radio buttons', () => {
        setupDefaultRadioGroup();
        radioButtonElements.forEach(radioButtonElement => {
          expect(radioButtonElement.getAttribute('role')).toBe('radio');
        });
      });

      it('should set aria-orientation to "vertical"', () => {
        setupDefaultRadioGroup();
        expect(radioGroupElement.getAttribute('aria-orientation')).toBe('vertical');
      });

      it('should set aria-disabled to false', () => {
        setupDefaultRadioGroup();
        expect(radioGroupElement.getAttribute('aria-disabled')).toBe('false');
      });

      it('should set aria-readonly to false', () => {
        setupDefaultRadioGroup();
        expect(radioGroupElement.getAttribute('aria-readonly')).toBe('false');
      });
    });

    describe('custom configuration', () => {
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
    it('should select the radio button corresponding to the value input', () => {
      setupRadioGroup();
      radioGroupInstance.value.set(1);
      fixture.detectChanges();
      expect(radioButtonElements[1].getAttribute('aria-checked')).toBe('true');
    });

    it('should update the value model when the value of a radio group is changed through the ui', () => {
      setupRadioGroup();
      click(1);
      expect(radioGroupInstance.value()).toBe(1);
    });

    describe('pointer interaction', () => {
      it('should update the group value when a radio button is selected via pointer click', () => {
        setupRadioGroup();
        click(1);
        expect(radioButtonElements[1].getAttribute('aria-checked')).toBe('true');
      });

      it('should only allow one radio button to be selected at a time', () => {
        setupRadioGroup();
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
        setupRadioGroup();
        space();
        expect(radioButtonElements[0].getAttribute('aria-checked')).toBe('true');
      });

      it('should update the group value on Enter', () => {
        setupRadioGroup();
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
        it('should update the group value on ArrowRight', () => {
          setupRadioGroup({orientation: 'horizontal'});
          right();
          expect(radioButtonElements[1].getAttribute('aria-checked')).toBe('true');
        });

        it('should update the group value on ArrowLeft', () => {
          setupRadioGroup({orientation: 'horizontal'});
          right();
          right();
          left();
          expect(radioButtonElements[1].getAttribute('aria-checked')).toBe('true');
        });

        describe('text direction rtl', () => {
          it('should update the group value on ArrowLeft', () => {
            setupRadioGroup({orientation: 'horizontal', textDirection: 'rtl'});
            left();
            expect(radioButtonElements[1].getAttribute('aria-checked')).toBe('true');
          });

          it('should update the group value on ArrowRight', () => {
            setupRadioGroup({orientation: 'horizontal', textDirection: 'rtl'});
            left();
            left();
            right();
            expect(radioButtonElements[1].getAttribute('aria-checked')).toBe('true');
          });
        });
      });

      describe('vertical orientation', () => {
        it('should update the group value on ArrowDown', () => {
          setupRadioGroup({orientation: 'vertical'});
          down();
          expect(radioButtonElements[1].getAttribute('aria-checked')).toBe('true');
        });

        it('should update the group value on ArrowUp', () => {
          setupRadioGroup({orientation: 'vertical'});
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
      it('should move focus to and select the last enabled radio button on End', () => {
        setupRadioGroup({focusMode});
        end();
        expect(isFocused(4)).toBe(true);
      });

      it('should move focus to and select the first enabled radio button on Home', () => {
        setupRadioGroup({focusMode});
        end();
        home();
        expect(isFocused(0)).toBe(true);
      });

      it('should not allow keyboard navigation or selection if the group is disabled', () => {
        setupRadioGroup({focusMode, orientation: 'horizontal', disabled: true});
        right();
        expect(isFocused(0)).toBe(false);
      });

      it('should allow keyboard navigation if the group is readonly', () => {
        setupRadioGroup({focusMode, orientation: 'horizontal', readonly: true});
        right();
        expect(isFocused(1)).toBe(true);
      });

      describe('vertical orientation', () => {
        it('should move focus to the next radio button on ArrowDown', () => {
          setupRadioGroup({focusMode, orientation: 'vertical'});
          down();
          expect(isFocused(1)).toBe(true);
        });

        it('should move focus to the previous radio button on ArrowUp', () => {
          setupRadioGroup({focusMode, orientation: 'vertical'});
          down();
          down();
          up();
          expect(isFocused(1)).toBe(true);
        });

        it('should skip disabled radio buttons (skipDisabled="true")', () => {
          setupRadioGroup({
            focusMode,
            orientation: 'vertical',
            skipDisabled: true,
            disabledOptions: [1, 2],
          });
          down();
          expect(isFocused(3)).toBe(true);
        });

        it('should not skip disabled radio buttons (skipDisabled="false")', () => {
          setupRadioGroup({
            focusMode,
            orientation: 'vertical',
            skipDisabled: false,
            disabledOptions: [1, 2],
          });
          down();
          expect(isFocused(1)).toBe(true);
        });
      });

      describe('horizontal orientation', () => {
        it('should move focus to the next radio button on ArrowRight', () => {
          setupRadioGroup({focusMode, orientation: 'horizontal'});
          right();
          expect(isFocused(1)).toBe(true);
        });

        it('should move focus to the previous radio button on ArrowLeft', () => {
          setupRadioGroup({focusMode, orientation: 'horizontal'});
          right();
          right();
          left();
          expect(isFocused(1)).toBe(true);
        });

        it('should skip disabled radio buttons (skipDisabled="true")', () => {
          setupRadioGroup({
            focusMode,
            orientation: 'horizontal',
            skipDisabled: true,
            disabledOptions: [1, 2],
          });
          right();
          expect(isFocused(3)).toBe(true);
        });

        it('should not skip disabled radio buttons (skipDisabled="false")', () => {
          setupRadioGroup({
            focusMode,
            orientation: 'horizontal',
            skipDisabled: false,
            disabledOptions: [1, 2],
          });
          right();
          expect(isFocused(1)).toBe(true);
        });

        describe('text direction rtl', () => {
          it('should move focus to the next radio button on ArrowLeft', () => {
            setupRadioGroup({focusMode, textDirection: 'rtl', orientation: 'horizontal'});
            left();
            expect(isFocused(1)).toBe(true);
          });

          it('should move focus to the previous radio button on ArrowRight', () => {
            setupRadioGroup({focusMode, textDirection: 'rtl', orientation: 'horizontal'});
            left();
            left();
            right();
            expect(isFocused(1)).toBe(true);
          });

          it('should skip disabled radio buttons when navigating', () => {
            setupRadioGroup({
              focusMode,
              skipDisabled: true,
              textDirection: 'rtl',
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
      it('should move focus to the clicked radio button', () => {
        setupRadioGroup({focusMode});
        click(3);
        expect(isFocused(3)).toBe(true);
      });

      it('should move focus to the clicked radio button if the group is disabled (skipDisabled="true")', () => {
        setupRadioGroup({focusMode, skipDisabled: true, disabled: true});
        click(3);
        expect(isFocused(3)).toBe(false);
      });

      it('should not move focus to the clicked radio button if the group is disabled (skipDisabled="false")', () => {
        setupRadioGroup({focusMode, skipDisabled: true, disabled: true});
        click(3);
        expect(isFocused(0)).toBe(false);
      });

      it('should move focus to the clicked radio button if the group is readonly', () => {
        setupRadioGroup({focusMode, readonly: true});
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
    it('should handle an empty set of radio buttons gracefully', () => {
      setupRadioGroup({options: []});
      expect(radioButtons.length).toBe(0);
    });

    describe('bad accessibility violations', () => {
      it('should report when the selected radio button is disabled and skipDisabled is true', () => {
        spyOn(console, 'error');
        setupRadioGroup({value: 1, skipDisabled: true, disabledOptions: [1]});
        expect(console.error).toHaveBeenCalled();
      });
    });
  });
});

interface TestOption {
  value: number;
  label: string;
  disabled: boolean;
}

@Component({
  template: `
    <div
      [(value)]="value"
      [disabled]="disabled"
      [readonly]="readonly"
      [focusMode]="focusMode"
      [orientation]="orientation"
      [skipDisabled]="skipDisabled"
      cdkRadioGroup>
      @for (option of options(); track option.value) {
        <div cdkRadioButton [value]="option.value" [disabled]="option.disabled">{{ option.label }}</div>
      }
    </div>
  `,
  imports: [CdkRadioGroup, CdkRadioButton],
})
class RadioGroupExample {
  options = signal<TestOption[]>([
    {value: 0, label: '0', disabled: false},
    {value: 1, label: '1', disabled: false},
    {value: 2, label: '2', disabled: false},
    {value: 3, label: '3', disabled: false},
    {value: 4, label: '4', disabled: false},
  ]);

  value: number | null = null;
  disabled = false;
  readonly = false;
  skipDisabled = true;
  focusMode: 'roving' | 'activedescendant' = 'roving';
  orientation: 'horizontal' | 'vertical' = 'horizontal';
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
