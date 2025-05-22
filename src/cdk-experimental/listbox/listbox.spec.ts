import {Component, DebugElement, signal} from '@angular/core';
import {CdkListbox, CdkOption} from './listbox';
import {ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {BidiModule, Direction} from '@angular/cdk/bidi';
import {provideFakeDirectionality, runAccessibilityChecks} from '@angular/cdk/testing/private';

interface ModifierKeys {
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

describe('CdkListbox', () => {
  let fixture: ComponentFixture<ListboxExample | DefaultListboxExample>;
  let listboxDebugElement: DebugElement;
  let optionDebugElements: DebugElement[];
  let listboxInstance: CdkListbox<unknown>;
  let listboxElement: HTMLElement;
  let optionElements: HTMLElement[];

  const keydown = (key: string, modifierKeys: ModifierKeys = {}) => {
    listboxElement.dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        ...modifierKeys,
      }),
    );
    fixture.detectChanges();
  };

  const click = (index: number, eventInit?: PointerEventInit, targets?: HTMLElement[]) => {
    (targets || optionElements)[index].dispatchEvent(
      new PointerEvent('pointerdown', {bubbles: true, ...eventInit}),
    );
    fixture.detectChanges();
  };

  const space = (modifierKeys?: ModifierKeys) => keydown(' ', modifierKeys);
  const enter = (modifierKeys?: ModifierKeys) => keydown('Enter', modifierKeys);
  const up = (modifierKeys?: ModifierKeys) => keydown('ArrowUp', modifierKeys);
  const down = (modifierKeys?: ModifierKeys) => keydown('ArrowDown', modifierKeys);
  const left = (modifierKeys?: ModifierKeys) => keydown('ArrowLeft', modifierKeys);
  const right = (modifierKeys?: ModifierKeys) => keydown('ArrowRight', modifierKeys);
  const home = (modifierKeys?: ModifierKeys) => keydown('Home', modifierKeys);
  const end = (modifierKeys?: ModifierKeys) => keydown('End', modifierKeys);
  const type = (char: string) => keydown(char);

  function setupListbox(opts?: {
    orientation?: 'horizontal' | 'vertical';
    disabled?: boolean;
    readonly?: boolean;
    value?: number[];
    skipDisabled?: boolean;
    focusMode?: 'roving' | 'activedescendant';
    multi?: boolean;
    wrap?: boolean;
    selectionMode?: 'follow' | 'explicit';
    typeaheadDelay?: number;
    disabledOptions?: number[];
    options?: TestOption[];
    textDirection?: Direction;
  }) {
    TestBed.configureTestingModule({
      providers: [provideFakeDirectionality(opts?.textDirection ?? 'ltr')],
      imports: [BidiModule, ListboxExample],
    }).compileComponents();

    fixture = TestBed.createComponent(ListboxExample);
    const testComponent = fixture.componentInstance as ListboxExample;

    if (opts?.orientation !== undefined) testComponent.orientation = opts.orientation;
    if (opts?.disabled !== undefined) testComponent.disabled = opts.disabled;
    if (opts?.readonly !== undefined) testComponent.readonly = opts.readonly;
    if (opts?.value !== undefined) testComponent.value = opts.value;
    if (opts?.skipDisabled !== undefined) testComponent.skipDisabled = opts.skipDisabled;
    if (opts?.focusMode !== undefined) testComponent.focusMode = opts.focusMode;
    if (opts?.multi !== undefined) testComponent.multi = opts.multi;
    if (opts?.wrap !== undefined) testComponent.wrap = opts.wrap;
    if (opts?.selectionMode !== undefined) testComponent.selectionMode = opts.selectionMode;
    if (opts?.typeaheadDelay !== undefined) testComponent.typeaheadDelay = opts.typeaheadDelay;
    if (opts?.options !== undefined) testComponent.options.set(opts.options);

    if (opts?.disabledOptions !== undefined) {
      const currentOptions = testComponent.options();
      opts.disabledOptions.forEach(index => {
        if (currentOptions[index]) currentOptions[index].disabled = true;
      });
      testComponent.options.set([...currentOptions]);
    }

    fixture.detectChanges();
    defineTestVariables(fixture);
  }

  function setupDefaultListbox() {
    TestBed.configureTestingModule({
      providers: [provideFakeDirectionality('ltr')],
      imports: [BidiModule, DefaultListboxExample],
    }).compileComponents();

    const defaultFixture = TestBed.createComponent(DefaultListboxExample);
    defaultFixture.detectChanges();
    defineTestVariables(defaultFixture);
  }

  function defineTestVariables(fixture: ComponentFixture<unknown>) {
    listboxDebugElement = fixture.debugElement.query(By.directive(CdkListbox));
    optionDebugElements = fixture.debugElement.queryAll(By.directive(CdkOption));
    listboxInstance = listboxDebugElement.injector.get<CdkListbox<unknown>>(CdkListbox);
    listboxElement = listboxDebugElement.nativeElement;
    optionElements = optionDebugElements.map(option => option.nativeElement);
  }

  afterEach(async () => await runAccessibilityChecks(listboxElement));

  describe('ARIA attributes and roles', () => {
    describe('default configuration', () => {
      beforeEach(() => setupDefaultListbox());

      it('should correctly set the role attribute to "listbox"', () => {
        expect(listboxElement.getAttribute('role')).toBe('listbox');
      });

      it('should correctly set the role attribute to "option" for the listbox options', () => {
        optionElements.forEach(optionElement => {
          expect(optionElement.getAttribute('role')).toBe('option');
        });
      });

      it('should set aria-orientation to "vertical"', () => {
        expect(listboxElement.getAttribute('aria-orientation')).toBe('vertical');
      });

      it('should set aria-disabled to "false"', () => {
        expect(listboxElement.getAttribute('aria-disabled')).toBe('false');
      });

      it('should set aria-readonly to "false"', () => {
        expect(listboxElement.getAttribute('aria-readonly')).toBe('false');
      });

      it('should set aria-multiselectable to "false"', () => {
        expect(listboxElement.getAttribute('aria-multiselectable')).toBe('false');
      });

      it('should set aria-selected to "false" for all options by default', () => {
        optionElements.forEach(optionElement => {
          expect(optionElement.getAttribute('aria-selected')).toBe('false');
        });
      });
    });

    describe('custom configuration', () => {
      it('should be able to set aria-orientation to "horizontal"', () => {
        setupListbox({orientation: 'horizontal'});
        expect(listboxElement.getAttribute('aria-orientation')).toBe('horizontal');
      });

      it('should be able to set aria-disabled to "true"', () => {
        setupListbox({disabled: true});
        expect(listboxElement.getAttribute('aria-disabled')).toBe('true');
      });

      it('should be able to set aria-readonly to "true"', () => {
        setupListbox({readonly: true});
        expect(listboxElement.getAttribute('aria-readonly')).toBe('true');
      });

      it('should be able to set aria-multiselectable to "true"', () => {
        setupListbox({multi: true});
        expect(listboxElement.getAttribute('aria-multiselectable')).toBe('true');
      });

      it('should set aria-selected to "true" for selected options', () => {
        setupListbox({multi: true, value: [1, 3]});
        expect(optionElements[0].getAttribute('aria-selected')).toBe('false');
        expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
        expect(optionElements[2].getAttribute('aria-selected')).toBe('false');
        expect(optionElements[3].getAttribute('aria-selected')).toBe('true');
        expect(optionElements[4].getAttribute('aria-selected')).toBe('false');
      });

      it('should set aria-disabled to "true" for disabled options', () => {
        setupListbox({disabledOptions: [1]});
        expect(optionElements[0].getAttribute('aria-disabled')).toBe('false');
        expect(optionElements[1].getAttribute('aria-disabled')).toBe('true');
        expect(optionElements[2].getAttribute('aria-disabled')).toBe('false');
      });
    });

    describe('roving focus mode', () => {
      it('should have tabindex="-1" for the listbox when focusMode is "roving"', () => {
        setupListbox({focusMode: 'roving'});
        expect(listboxElement.getAttribute('tabindex')).toBe('-1');
      });

      it('should set tabindex="0" for the listbox when disabled and focusMode is "roving"', () => {
        setupListbox({disabled: true, focusMode: 'roving'});
        expect(listboxElement.getAttribute('tabindex')).toBe('0');
      });

      it('should set initial focus (tabindex="0") on the first non-disabled option if no value is set', () => {
        setupListbox({focusMode: 'roving'});
        expect(optionElements[0].getAttribute('tabindex')).toBe('0');
        expect(optionElements[1].getAttribute('tabindex')).toBe('-1');
        expect(optionElements[2].getAttribute('tabindex')).toBe('-1');
        expect(optionElements[3].getAttribute('tabindex')).toBe('-1');
        expect(optionElements[4].getAttribute('tabindex')).toBe('-1');
      });

      it('should set initial focus (tabindex="0") on the first selected option', () => {
        setupListbox({focusMode: 'roving', value: [2]});
        expect(optionElements[0].getAttribute('tabindex')).toBe('-1');
        expect(optionElements[1].getAttribute('tabindex')).toBe('-1');
        expect(optionElements[2].getAttribute('tabindex')).toBe('0');
        expect(optionElements[3].getAttribute('tabindex')).toBe('-1');
        expect(optionElements[4].getAttribute('tabindex')).toBe('-1');
      });

      it('should set initial focus (tabindex="0") on the first non-disabled option if selected option is disabled', () => {
        setupListbox({focusMode: 'roving', value: [1], disabledOptions: [1]});
        expect(optionElements[0].getAttribute('tabindex')).toBe('0');
        expect(optionElements[1].getAttribute('tabindex')).toBe('-1');
      });

      it('should not have aria-activedescendant when focusMode is "roving"', () => {
        setupListbox({focusMode: 'roving'});
        expect(listboxElement.hasAttribute('aria-activedescendant')).toBe(false);
      });
    });

    describe('activedescendant focus mode', () => {
      it('should have tabindex="0" for the listbox', () => {
        setupListbox({focusMode: 'activedescendant'});
        expect(listboxElement.getAttribute('tabindex')).toBe('0');
      });

      it('should set aria-activedescendant to the ID of the first non-disabled option if no value is set', () => {
        setupListbox({focusMode: 'activedescendant'});
        expect(listboxElement.getAttribute('aria-activedescendant')).toBe(optionElements[0].id);
      });

      it('should set aria-activedescendant to the ID of the first selected option', () => {
        setupListbox({focusMode: 'activedescendant', value: [2]});
        expect(listboxElement.getAttribute('aria-activedescendant')).toBe(optionElements[2].id);
      });

      it('should set aria-activedescendant to the ID of the first non-disabled option if selected option is disabled', () => {
        setupListbox({focusMode: 'activedescendant', value: [1], disabledOptions: [1]});
        expect(listboxElement.getAttribute('aria-activedescendant')).toBe(optionElements[0].id);
      });

      it('should set tabindex="-1" for all options', () => {
        setupListbox({focusMode: 'activedescendant'});
        expect(optionElements[0].getAttribute('tabindex')).toBe('-1');
        expect(optionElements[1].getAttribute('tabindex')).toBe('-1');
        expect(optionElements[2].getAttribute('tabindex')).toBe('-1');
        expect(optionElements[3].getAttribute('tabindex')).toBe('-1');
        expect(optionElements[4].getAttribute('tabindex')).toBe('-1');
      });
    });
  });

  describe('value and selection', () => {
    it('should select the options corresponding to the value input', () => {
      setupListbox({multi: true, value: [1, 3]});
      expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
      expect(optionElements[3].getAttribute('aria-selected')).toBe('true');
      expect(listboxInstance.value()).toEqual([1, 3]);
    });

    it('should update the value model when an option is selected via UI (single select)', () => {
      setupListbox({multi: false});
      click(1);
      expect(listboxInstance.value()).toEqual([1]);
      click(2);
      expect(listboxInstance.value()).toEqual([2]);
    });

    it('should update the value model when options are selected via UI (multi select)', () => {
      setupListbox({multi: true});
      click(1);
      expect(listboxInstance.value()).toEqual([1]);
      click(3);
      expect(listboxInstance.value()).toEqual([1, 3]);
      click(1);
      expect(listboxInstance.value()).toEqual([3]);
    });

    describe('pointer interactions', () => {
      describe('single select', () => {
        it('should select an option on click', () => {
          setupListbox({multi: false});
          click(1);
          expect(listboxInstance.value()).toEqual([1]);
          expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
        });

        it('should select a new option and deselect the old one on click', () => {
          setupListbox({multi: false, value: [0]});
          click(1);
          expect(listboxInstance.value()).toEqual([1]);
          expect(optionElements[0].getAttribute('aria-selected')).toBe('false');
          expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
        });
      });

      describe('multi select', () => {
        describe('selection follows focus', () => {
          it('should select only the clicked option with a simple click', () => {
            setupListbox({multi: true, selectionMode: 'follow', value: [0]});
            click(1);
            expect(listboxInstance.value()).toEqual([1]);
            expect(optionElements[0].getAttribute('aria-selected')).toBe('false');
            expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
          });

          it('should toggle the selected state of an option with ctrl + click', () => {
            setupListbox({multi: true, selectionMode: 'follow', value: [0]});
            click(1, {ctrlKey: true});
            expect(listboxInstance.value().sort()).toEqual([0, 1]);
            expect(optionElements[0].getAttribute('aria-selected')).toBe('true');
            expect(optionElements[1].getAttribute('aria-selected')).toBe('true');

            click(0, {ctrlKey: true});
            expect(listboxInstance.value()).toEqual([1]);
            expect(optionElements[0].getAttribute('aria-selected')).toBe('false');
            expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
          });

          it('should select a range starting from the first option on shift + click', () => {
            setupListbox({multi: true, selectionMode: 'follow', value: [0]});
            click(2, {shiftKey: true});
            expect(listboxInstance.value().sort()).toEqual([0, 1, 2]);
            expect(optionElements[0].getAttribute('aria-selected')).toBe('true');
            expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
            expect(optionElements[2].getAttribute('aria-selected')).toBe('true');
          });

          it('should select a range starting from the current active option on shift + click', () => {
            setupListbox({multi: true, selectionMode: 'follow'});
            click(1);
            click(3, {shiftKey: true});
            expect(listboxInstance.value().sort()).toEqual([1, 2, 3]);
          });

          it('should not select disabled options on shift + click', () => {
            setupListbox({multi: true, selectionMode: 'follow', disabledOptions: [1]});
            click(2, {shiftKey: true});
            expect(listboxInstance.value()).toEqual([0, 2]);
          });
        });

        describe('explicit selection', () => {
          it('should toggle selection of the clicked option with a simple click', () => {
            setupListbox({multi: true, selectionMode: 'explicit', value: [0]});
            click(1);
            expect(listboxInstance.value().sort()).toEqual([0, 1]);
            expect(optionElements[0].getAttribute('aria-selected')).toBe('true');
            expect(optionElements[1].getAttribute('aria-selected')).toBe('true');

            click(0);
            expect(listboxInstance.value()).toEqual([1]);
            expect(optionElements[0].getAttribute('aria-selected')).toBe('false');
          });

          it('should select a range starting from the first option on shift + click', () => {
            setupListbox({multi: true, selectionMode: 'explicit', value: [0]});
            click(2, {shiftKey: true});
            expect(listboxInstance.value().sort()).toEqual([0, 1, 2]);
          });

          it('should select a range starting from the current active option on shift + click', () => {
            setupListbox({multi: true, selectionMode: 'explicit'});
            click(1);
            click(3, {shiftKey: true});
            expect(listboxInstance.value().sort()).toEqual([1, 2, 3]);
          });

          it('should not select disabled options on shift + click', () => {
            setupListbox({multi: true, selectionMode: 'follow', disabledOptions: [1]});
            click(2, {shiftKey: true});
            expect(listboxInstance.value()).toEqual([0, 2]);
          });
        });
      });
    });

    describe('keyboard interactions', () => {
      describe('single select', () => {
        describe('selection follows focus', () => {
          it('should select the next option on ArrowDown', () => {
            setupListbox({multi: false, selectionMode: 'follow'});
            down();
            expect(listboxInstance.value()).toEqual([1]);
            expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
            down();
            expect(listboxInstance.value()).toEqual([2]);
            expect(optionElements[2].getAttribute('aria-selected')).toBe('true');
          });

          it('should select the previous option on ArrowUp', () => {
            setupListbox({multi: false, selectionMode: 'follow', value: [2]});
            up();
            expect(listboxInstance.value()).toEqual([1]);
            expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
          });

          it('should select the first option on Home', () => {
            setupListbox({multi: false, selectionMode: 'follow', value: [2]});
            home();
            expect(listboxInstance.value()).toEqual([0]);
          });

          it('should select the last option on End', () => {
            setupListbox({multi: false, selectionMode: 'follow', value: [2]});
            end();
            expect(listboxInstance.value()).toEqual([4]);
          });
        });

        describe('explicit selection', () => {
          it('should move focus but not select on navigation', () => {
            setupListbox({multi: false, selectionMode: 'explicit'});
            down();
            up();
            home();
            end();
            expect(listboxInstance.value()).toEqual([]);
            expect(optionElements[1].getAttribute('aria-selected')).toBe('false');
          });

          it('should select the focused option on Space', () => {
            setupListbox({multi: false, selectionMode: 'explicit'});
            down();
            space();
            expect(listboxInstance.value()).toEqual([1]);
            expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
            down();
            down();
            space();
            expect(listboxInstance.value()).toEqual([3]);
            expect(optionElements[1].getAttribute('aria-selected')).toBe('false');
            expect(optionElements[3].getAttribute('aria-selected')).toBe('true');
          });

          it('should select the focused option on Enter', () => {
            setupListbox({multi: false, selectionMode: 'explicit'});
            down();
            enter();
            expect(listboxInstance.value()).toEqual([1]);
            expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
          });
        });
      });

      describe('multi select', () => {
        describe('selection follows focus', () => {
          it('should select only the focused option on ArrowDown (no modifier)', () => {
            setupListbox({multi: true, selectionMode: 'follow', value: [0]});
            down();
            expect(listboxInstance.value()).toEqual([1]);
            expect(optionElements[0].getAttribute('aria-selected')).toBe('false');
            expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
          });

          it('should move focus but not change selection on ctrl + ArrowDown, then toggle with ctrl + Space', () => {
            setupListbox({multi: true, selectionMode: 'follow', value: [0]});
            down({ctrlKey: true});
            expect(listboxInstance.value()).toEqual([0]);
            space({ctrlKey: true});
            expect(listboxInstance.value().sort()).toEqual([0, 1]);
          });

          it('should toggle selection of the focused item on ctrl + Space', () => {
            setupListbox({multi: true, selectionMode: 'follow', value: [0]});
            space({ctrlKey: true});
            expect(listboxInstance.value()).toEqual([]);
            down();
            expect(listboxInstance.value()).toEqual([1]);
            space({ctrlKey: true});
            expect(listboxInstance.value()).toEqual([]);
          });

          it('should extend selection on shift + ArrowDown', () => {
            setupListbox({multi: true, selectionMode: 'follow', value: [0]});
            down({shiftKey: true});
            expect(listboxInstance.value().sort()).toEqual([0, 1]);
            down({shiftKey: true});
            expect(listboxInstance.value().sort()).toEqual([0, 1, 2]);
          });

          it('should select all on Ctrl+A, then select active on second Ctrl+A', () => {
            setupListbox({multi: true, selectionMode: 'follow', value: [0]});
            keydown('A', {ctrlKey: true});
            expect(listboxInstance.value().sort()).toEqual([0, 1, 2, 3, 4]);

            keydown('A', {ctrlKey: true});
            expect(listboxInstance.value()).toEqual([0]);
          });
        });

        describe('explicit selection', () => {
          it('should move focus but not select on ArrowDown', () => {
            setupListbox({multi: true, selectionMode: 'explicit'});
            down();
            expect(listboxInstance.value()).toEqual([]);
          });

          it('should toggle selection of the focused item on Space', () => {
            setupListbox({multi: true, selectionMode: 'explicit'});
            down();
            space();
            expect(listboxInstance.value()).toEqual([1]);
            down();
            space();
            expect(listboxInstance.value().sort()).toEqual([1, 2]);
            space();
            expect(listboxInstance.value()).toEqual([1]);
          });

          it('should toggle selection of the focused item on Enter', () => {
            setupListbox({multi: true, selectionMode: 'explicit'});
            down();
            enter();
            expect(listboxInstance.value()).toEqual([1]);
          });

          it('should extend selection on Shift+ArrowDown', () => {
            setupListbox({multi: true, selectionMode: 'explicit'});
            down({shiftKey: true});
            expect(listboxInstance.value().sort()).toEqual([0, 1]);
            down({shiftKey: true});
            expect(listboxInstance.value().sort()).toEqual([0, 1, 2]);
          });

          it('should toggle selection of all options on Ctrl+A', () => {
            setupListbox({multi: true, selectionMode: 'explicit', value: [0]});
            keydown('A', {ctrlKey: true});
            expect(listboxInstance.value().sort()).toEqual([0, 1, 2, 3, 4]);

            keydown('A', {ctrlKey: true});
            expect(listboxInstance.value()).toEqual([]);
          });
        });
      });
    });
  });

  function runNavigationTests(
    focusMode: 'roving' | 'activedescendant',
    isFocused: (index: number) => boolean,
  ) {
    describe(`keyboard navigation (focusMode="${focusMode}")`, () => {
      it('should move focus to the last enabled option on End', () => {
        setupListbox({focusMode, disabledOptions: [4]});
        end();
        expect(isFocused(3)).toBe(true);
      });

      it('should move focus to the first enabled option on Home', () => {
        setupListbox({focusMode, disabledOptions: [0]});
        end();
        home();
        expect(isFocused(1)).toBe(true);
      });

      it('should allow keyboard navigation if the group is readonly', () => {
        setupListbox({focusMode, orientation: 'horizontal', readonly: true});
        right();
        expect(isFocused(1)).toBe(true);
      });

      it('should wrap focus from last to first with ArrowDown when wrap is true (vertical)', () => {
        setupListbox({focusMode, orientation: 'vertical', wrap: true});
        for (let i = 0; i < optionElements.length - 1; i++) down();
        down();
        expect(isFocused(0)).toBe(true);
      });

      it('should not wrap focus from last to first with ArrowDown when wrap is false (vertical)', () => {
        setupListbox({focusMode, orientation: 'vertical', wrap: false});
        for (let i = 0; i < optionElements.length - 1; i++) down();
        down();
        expect(isFocused(optionElements.length - 1)).toBe(true);
      });

      describe('vertical orientation', () => {
        it('should move focus to the next option on ArrowDown', () => {
          setupListbox({focusMode, orientation: 'vertical'});
          down();
          expect(isFocused(1)).toBe(true);
        });

        it('should skip disabled options with ArrowDown (skipDisabled="true")', () => {
          setupListbox({
            focusMode,
            orientation: 'vertical',
            skipDisabled: true,
            disabledOptions: [1, 2],
          });
          down();
          expect(isFocused(3)).toBe(true);
        });

        it('should not skip disabled options with ArrowDown (skipDisabled="false")', () => {
          setupListbox({
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
        it('should move focus to the next option on ArrowRight', () => {
          setupListbox({focusMode, orientation: 'horizontal'});
          right();
          expect(isFocused(1)).toBe(true);
        });

        describe('text direction rtl', () => {
          it('should move focus to the next option on ArrowLeft (rtl)', () => {
            setupListbox({focusMode, textDirection: 'rtl', orientation: 'horizontal'});
            left();
            expect(isFocused(1)).toBe(true);
          });
        });
      });
    });

    describe(`pointer navigation (focusMode="${focusMode}")`, () => {
      it('should move focus to the clicked option', () => {
        setupListbox({focusMode});
        click(3);
        expect(isFocused(3)).toBe(true);
      });

      it('should move focus to the clicked disabled option', () => {
        setupListbox({focusMode, disabledOptions: [2], skipDisabled: false});
        click(2);
        expect(isFocused(2)).toBe(true);
      });

      it('should move focus if listbox is readonly', () => {
        setupListbox({focusMode, readonly: true});
        click(3);
        expect(isFocused(3)).toBe(true);
      });
    });

    describe('typeahead functionality', () => {
      const getOptions = () => [
        {value: 0, label: 'Apple', disabled: false},
        {value: 1, label: 'Apricot', disabled: false},
        {value: 2, label: 'Banana', disabled: false},
        {value: 3, label: 'Blueberry', disabled: false},
        {value: 4, label: 'Orange', disabled: false},
      ];

      it('should focus the first matching option when typing characters', () => {
        setupListbox({options: getOptions(), focusMode});
        type('B');
        expect(isFocused(2)).toBe(true);
        type('l');
        expect(isFocused(3)).toBe(true);
      });

      it('should select the focused option if selectionMode is "follow"', () => {
        setupListbox({options: getOptions(), focusMode, selectionMode: 'follow'});
        type('O');
        expect(isFocused(4)).toBe(true);
        expect(listboxInstance.value()).toEqual([4]);
        expect(optionElements[4].getAttribute('aria-selected')).toBe('true');
      });

      it('should not select the focused option if selectionMode is "explicit"', () => {
        setupListbox({options: getOptions(), focusMode, selectionMode: 'explicit'});
        type('O');
        expect(isFocused(4)).toBe(true);
        expect(listboxInstance.value()).toEqual([]);
        expect(optionElements[4].getAttribute('aria-selected')).toBe('false');
      });

      it('should reset search term after typeaheadDelay', fakeAsync(() => {
        setupListbox({options: getOptions(), focusMode, typeaheadDelay: 0.1});

        type('A');
        expect(isFocused(1)).toBe(true);
        tick(100);
        type('A');
        expect(isFocused(0)).toBe(true);
      }));

      it('should skip disabled options with typeahead (skipDisabled=true)', () => {
        setupListbox({options: getOptions(), focusMode, disabledOptions: [2], skipDisabled: true});
        type('B');
        expect(isFocused(3)).toBe(true);
      });

      it('should focus disabled options with typeahead if skipDisabled=false', () => {
        setupListbox({options: getOptions(), focusMode, disabledOptions: [2], skipDisabled: false});
        type('B');
        expect(isFocused(2)).toBe(true);
      });
    });
  }

  runNavigationTests('roving', i => {
    return optionElements[i] && optionElements[i].getAttribute('tabindex') === '0';
  });

  runNavigationTests('activedescendant', i => {
    return (
      listboxElement &&
      optionElements[i] &&
      listboxElement.getAttribute('aria-activedescendant') === optionElements[i].id
    );
  });

  describe('failure cases', () => {
    it('should handle an empty set of options gracefully', () => {
      setupListbox({options: []});
      expect(optionElements.length).toBe(0);
      expect(() => down()).not.toThrow();
      expect(() => space()).not.toThrow();
      expect(listboxInstance.value()).toEqual([]);
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
    <ul
      cdkListbox
      aria-label="Test Listbox"
      [(value)]="value"
      [disabled]="disabled"
      [readonly]="readonly"
      [focusMode]="focusMode"
      [orientation]="orientation"
      [skipDisabled]="skipDisabled"
      [multi]="multi"
      [wrap]="wrap"
      [selectionMode]="selectionMode"
      [typeaheadDelay]="typeaheadDelay">
      @for (option of options(); track option.value) {
        <li cdkOption [value]="option.value" [disabled]="option.disabled" [label]="option.label">{{ option.label }}</li>
      }
    </ul>
  `,
  imports: [CdkListbox, CdkOption],
})
class ListboxExample {
  options = signal<TestOption[]>([
    {value: 0, label: 'Option 0', disabled: false},
    {value: 1, label: 'Option 1', disabled: false},
    {value: 2, label: 'Option 2', disabled: false},
    {value: 3, label: 'Option 3', disabled: false},
    {value: 4, label: 'Option 4', disabled: false},
  ]);

  value: number[] = [];
  disabled = false;
  readonly = false;
  skipDisabled = true;
  focusMode: 'roving' | 'activedescendant' = 'roving';
  orientation: 'vertical' | 'horizontal' = 'vertical';
  multi = false;
  wrap = true;
  selectionMode: 'follow' | 'explicit' = 'explicit';
  typeaheadDelay = 0.5;
}

@Component({
  template: `
    <ul aria-label="Test Listbox" cdkListbox>
      <li cdkOption [value]="0">0</li>
      <li cdkOption [value]="1">1</li>
      <li cdkOption [value]="2">2</li>
    </ul>
  `,
  imports: [CdkListbox, CdkOption],
})
class DefaultListboxExample {}
