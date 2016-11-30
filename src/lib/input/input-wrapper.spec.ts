import {async, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {FormsModule, ReactiveFormsModule, FormControl} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {MdInputModule} from './input';
import {MdInputWrapper} from './input-wrapper';

function isInternetExplorer11() {
  return 'ActiveXObject' in window;
}

describe('MdInputWrapper', function () {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdInputModule.forRoot(), FormsModule, ReactiveFormsModule],
      declarations: [
        MdInputWrapperNumberTypeConservedTestComponent,
        MdInputWrapperPlaceholderRequiredTestComponent,
        MdInputWrapperPlaceholderElementTestComponent,
        MdInputWrapperPlaceholderAttrTestComponent,
        MdInputWrapperHintLabel2TestController,
        MdInputWrapperHintLabelTestController,
        MdInputWrapperInvalidTypeTestController,
        MdInputWrapperInvalidPlaceholderTestController,
        MdInputWrapperInvalidHint2TestController,
        MdInputWrapperInvalidHintTestController,
        MdInputWrapperBaseTestController,
        MdInputWrapperAriaTestController,
        MdInputWrapperWithBlurAndFocusEvents,
        MdInputWrapperWithNameTestController,
        MdInputWrapperWithId,
        MdInputWrapperWithAutocomplete,
        MdInputWrapperWithUnboundAutocomplete,
        MdInputWrapperWithUnboundAutocompleteWithValue,
        MdInputWrapperWithAutocorrect,
        MdInputWrapperWithUnboundAutocorrect,
        MdInputWrapperWithAutocapitalize,
        MdInputWrapperWithUnboundAutocapitalize,
        MdInputWrapperWithAutofocus,
        MdInputWrapperWithUnboundAutofocus,
        MdInputWrapperWithReadonly,
        MdInputWrapperWithUnboundReadonly,
        MdInputWrapperWithSpellcheck,
        MdInputWrapperWithUnboundSpellcheck,
        MdInputWrapperWithDisabled,
        MdInputWrapperWithUnboundDisabled,
        MdInputWrapperWithRequired,
        MdInputWrapperWithUnboundRequired,
        MdInputWrapperWithList,
        MdInputWrapperWithMax,
        MdInputWrapperWithMin,
        MdInputWrapperWithStep,
        MdInputWrapperWithTabindex,
        MdInputWrapperDateTestController,
        MdInputWrapperTextTestController,
        MdInputWrapperPasswordTestController,
        MdInputWrapperNumberTestController,
        MdTextareaWithBindings,
        MdInputWrapperWithFormControl,
      ],
    });

    TestBed.compileComponents();
  }));

  it('should default to floating placeholders', () => {
    let fixture = TestBed.createComponent(MdInputWrapperBaseTestController);
    fixture.detectChanges();

    let mdInputWrapper = fixture.debugElement.query(By.directive(MdInputWrapper))
        .componentInstance as MdInputWrapper;
    expect(mdInputWrapper.floatingPlaceholder)
        .toBe(true, 'Expected MdInputWrapper to default to having floating placeholders turned on');
  });

  it('should not be treated as empty if type is date', () => {
    if (isInternetExplorer11()) {
      return;
    }
    let fixture = TestBed.createComponent(MdInputWrapperDateTestController);
    let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    inputEl.placeholder = 'Placeholder';
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.className.includes('md-empty')).toBe(false);
  });

  it('should treat text input type as empty at init', () => {
    if (isInternetExplorer11()) {
      return;
    }
    let fixture = TestBed.createComponent(MdInputWrapperTextTestController);
    let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    inputEl.placeholder = 'Placeholder';
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.className.includes('md-empty')).toBe(true);
  });

  it('should treat password input type as empty at init', () => {
    if (isInternetExplorer11()) {
      return;
    }
    let fixture = TestBed.createComponent(MdInputWrapperPasswordTestController);
    let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    inputEl.placeholder = 'Placeholder';
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.className.includes('md-empty')).toBe(true);
  });

  it('should treat number input type as empty at init', () => {
    if (isInternetExplorer11()) {
      return;
    }
    let fixture = TestBed.createComponent(MdInputWrapperNumberTestController);
    let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    inputEl.placeholder = 'Placeholder';
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.className.includes('md-empty')).toBe(true);
  });

  // TODO(kara): update when core/testing adds fix
  it('support ngModel', async(() => {
    let fixture = TestBed.createComponent(MdInputWrapperBaseTestController);

    fixture.detectChanges();
    let instance = fixture.componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    instance.model = 'hello';
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      // Temporary workaround, see https://github.com/angular/angular/issues/10148
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(el.value).toBe('hello');
      });
    });
  }));

  it('should not overwrite existing id', () => {
    let fixture = TestBed.createComponent(MdInputWrapperWithId);
    fixture.detectChanges();

    const inputElement: HTMLInputElement =
        fixture.debugElement.query(By.css('input')).nativeElement;

    expect(inputElement.id).toBe('test-id');
  });

  it(`validates there's only one hint label per side`, () => {
    let fixture = TestBed.createComponent(MdInputWrapperInvalidHintTestController);

    expect(() => fixture.detectChanges()).toThrow();
    // TODO(jelbourn): .toThrow(new MdInputWrapperDuplicatedHintError('start'));
    // See https://github.com/angular/angular/issues/8348
  });

  it(`validates there's only one hint label per side (attribute)`, () => {
    let fixture = TestBed.createComponent(MdInputWrapperInvalidHint2TestController);

    expect(() => fixture.detectChanges()).toThrow();
    // TODO(jelbourn): .toThrow(new MdInputWrapperDuplicatedHintError('start'));
    // See https://github.com/angular/angular/issues/8348
  });

  it('validates there\'s only one placeholder', () => {
    let fixture = TestBed.createComponent(MdInputWrapperInvalidPlaceholderTestController);

    expect(() => fixture.detectChanges()).toThrow();
    // TODO(jelbourn): .toThrow(new MdInputWrapperPlaceholderConflictError());
    // See https://github.com/angular/angular/issues/8348
  });

  it('validates the type', () => {
    let fixture = TestBed.createComponent(MdInputWrapperInvalidTypeTestController);

    // Technically this throws during the OnChanges detection phase,
    // so the error is really a ChangeDetectionError and it becomes
    // hard to build a full exception to compare with.
    // We just check for any exception in this case.
    expect(() => fixture.detectChanges()).toThrow(/* new MdInputWrapperUnsupportedTypeError('file') */);
  });

  it('supports hint labels attribute', () => {
    let fixture = TestBed.createComponent(MdInputWrapperHintLabelTestController);
    fixture.detectChanges();

    // If the hint label is empty, expect no label.
    expect(fixture.debugElement.query(By.css('.md-hint'))).toBeNull();

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.md-hint'))).not.toBeNull();
  });

  it('supports hint labels elements', () => {
    let fixture = TestBed.createComponent(MdInputWrapperHintLabel2TestController);
    fixture.detectChanges();

    // In this case, we should have an empty <md-hint>.
    let el = fixture.debugElement.query(By.css('md-hint')).nativeElement;
    expect(el.textContent).toBeFalsy();

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('md-hint')).nativeElement;
    expect(el.textContent).toBe('label');
  });

  it('supports placeholder attribute', () => {
    let fixture = TestBed.createComponent(MdInputWrapperPlaceholderAttrTestComponent);
    fixture.detectChanges();
    let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

    //let el = fixture.debugElement.query(By.css('label'));
    //expect(el).toBeNull();

    fixture.componentInstance.placeholder = 'Other placeholder';
    fixture.detectChanges();
    console.log('>>>', inputEl);

    let el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch('Other placeholder');
    expect(el.nativeElement.textContent).not.toMatch(/\*/g);
  });
/*
  it('supports placeholder element', () => {
    let fixture = TestBed.createComponent(MdInputWrapperPlaceholderElementTestComponent);
    fixture.detectChanges();
    let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;


    let el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch('Default Placeholder');

    inputEl.placeholder = 'Other placeholder';
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch('Other placeholder');
    expect(el.nativeElement.textContent).not.toMatch(/\*//*g);
  });
/*
  it('supports placeholder required star', () => {
    let fixture = TestBed.createComponent(MdInputWrapperPlaceholderRequiredTestComponent);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch(/hello\s+\*//*g);
  });

  it('supports number types and conserved its value type from Angular', () => {
    let fixture = TestBed.createComponent(MdInputWrapperNumberTypeConservedTestComponent);
    fixture.detectChanges();

    const input: MdInputWrapper = fixture.debugElement.query(By.directive(MdInputWrapper)).componentInstance;
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    // Fake a `change` event being triggered.
    inputElement.value = '3';
    input._handleChange(<any> {target: inputElement});

    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe(3);
    expect(typeof fixture.componentInstance.value).toBe('number');
  });

  it('supports blur and focus events', () => {
    let fixture = TestBed.createComponent(MdInputWrapperWithBlurAndFocusEvents);
    const testComponent = fixture.componentInstance;
    const inputComponent = fixture.debugElement.query(By.directive(MdInputWrapper)).componentInstance;
    const fakeEvent = <FocusEvent>{};

    spyOn(testComponent, 'onFocus');
    spyOn(testComponent, 'onBlur');

    expect(testComponent.onFocus).not.toHaveBeenCalled();
    expect(testComponent.onBlur).not.toHaveBeenCalled();

    inputComponent._handleFocus(fakeEvent);
    expect(testComponent.onFocus).toHaveBeenCalledWith(fakeEvent);

    inputComponent._handleBlur(fakeEvent);
    expect(testComponent.onBlur).toHaveBeenCalledWith(fakeEvent);
  });

  it('supports the autoComplete attribute', () => {
    let fixture = TestBed.createComponent(MdInputWrapperWithAutocomplete);
    fixture.detectChanges();

    let input: MdInputWrapper = fixture.debugElement.query(By.directive(MdInputWrapper)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('autocomplete')).toBeNull();

    input.autocomplete = 'on';
    fixture.detectChanges();
    expect(el.getAttribute('autocomplete')).toEqual('on');
  });

  it('supports the autoCorrect attribute', () => {
    let fixture = TestBed.createComponent(MdInputWrapperWithAutocorrect);
    fixture.detectChanges();

    let input: MdInputWrapper = fixture.debugElement.query(By.directive(MdInputWrapper)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('autocorrect')).toBeNull();

    input.autocorrect = 'on';
    fixture.detectChanges();
    expect(el.getAttribute('autocorrect')).toEqual('on');
  });

  it('supports the autoCapitalize attribute', () => {
    let fixture = TestBed.createComponent(MdInputWrapperWithAutocapitalize);
    fixture.detectChanges();

    let input: MdInputWrapper = fixture.debugElement.query(By.directive(MdInputWrapper)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('autocapitalize')).toBeNull();

    input.autocapitalize = 'on';
    fixture.detectChanges();
    expect(el.getAttribute('autocapitalize')).toEqual('on');
  });

  it('supports the autoComplete attribute as an unbound attribute', () => {
    let fixture = TestBed.createComponent(MdInputWrapperWithUnboundAutocomplete);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('autocomplete')).toEqual('');
  });

  it('supports the autoComplete attribute as an unbound value attribute', () => {
    let fixture = TestBed.createComponent(MdInputWrapperWithUnboundAutocompleteWithValue);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('autocomplete')).toEqual('name');
  });

  it('supports the autoFocus attribute', () => {
    let fixture = TestBed.createComponent(MdInputWrapperWithAutofocus);
    fixture.detectChanges();

    let input: MdInputWrapper = fixture.debugElement.query(By.directive(MdInputWrapper)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('autofocus')).toBeNull();

    input.autofocus = true;
    fixture.detectChanges();
    expect(el.getAttribute('autofocus')).toEqual('');
  });

  it('supports the autoFocus attribute as an unbound attribute', () => {
    let fixture = TestBed.createComponent(MdInputWrapperWithUnboundAutofocus);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('autofocus')).toEqual('');
  });

  it('supports the disabled attribute', () => {
    let fixture = TestBed.createComponent(MdInputWrapperWithDisabled);
    let input: MdInputWrapper = fixture.debugElement.query(By.directive(MdInputWrapper)).componentInstance;
    input.disabled = false;
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(el).not.toBeNull();

    fixture.detectChanges();
    expect(el.getAttribute('disabled')).toEqual(null);

    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(el.getAttribute('disabled')).toEqual('');
    });
  });

  it('supports the disabled attribute as an unbound attribute', () => {
    let fixture = TestBed.createComponent(MdInputWrapperWithUnboundDisabled);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    fixture.whenStable().then(() => {
      expect(el.getAttribute('disabled')).toEqual('');
    });
  });

  it('supports the list attribute', () => {
    let fixture = TestBed.createComponent(MdInputWrapperWithList);
    let input: MdInputWrapper = fixture.debugElement.query(By.directive(MdInputWrapper)).componentInstance;
    input.disabled = false;
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    fixture.detectChanges();
    expect(el.getAttribute('list')).toEqual(null);

    input.list = 'datalist-id';
    fixture.detectChanges();
    expect(el.getAttribute('list')).toEqual('datalist-id');
  });

  it('supports the max attribute', () => {
    let fixture = TestBed.createComponent(MdInputWrapperWithMax);
    let input: MdInputWrapper = fixture.debugElement.query(By.directive(MdInputWrapper)).componentInstance;
    input.disabled = false;
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(el).not.toBeNull();

    fixture.detectChanges();
    expect(el.getAttribute('max')).toEqual(null);

    input.max = 10;
    fixture.detectChanges();
    expect(el.getAttribute('max')).toEqual('10');

    input.max = '2000-01-02';
    fixture.detectChanges();
    expect(el.getAttribute('max')).toEqual('2000-01-02');
  });

  it('supports the min attribute', () => {
    let fixture = TestBed.createComponent(MdInputWrapperWithMin);
    let input: MdInputWrapper = fixture.debugElement.query(By.directive(MdInputWrapper)).componentInstance;
    input.disabled = false;
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(el).not.toBeNull();
    fixture.detectChanges();
    expect(el.getAttribute('min')).toEqual(null);

    input.min = 10;
    fixture.detectChanges();
    expect(el.getAttribute('min')).toEqual('10');

    input.min = '2000-01-02';
    fixture.detectChanges();
    expect(el.getAttribute('min')).toEqual('2000-01-02');
  });

  it('supports the readOnly attribute', () => {
    let fixture = TestBed.createComponent(MdInputWrapperWithReadonly);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    let input: MdInputWrapper = fixture.debugElement.query(By.directive(MdInputWrapper)).componentInstance;

    expect(el).not.toBeNull();
    expect(el.getAttribute('readonly')).toBeNull();

    input.readonly = true;
    fixture.detectChanges();
    expect(el.getAttribute('readonly')).toEqual('');
  });

  it('supports the readOnly attribute as an unbound attribute', () => {
    let fixture = TestBed.createComponent(MdInputWrapperWithUnboundReadonly);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('readonly')).toEqual('');
  });

  it('supports the required attribute', () => {
    let fixture = TestBed.createComponent(MdInputWrapperWithRequired);
    fixture.detectChanges();

    let input: MdInputWrapper = fixture.debugElement.query(By.directive(MdInputWrapper)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('required')).toBeNull();

    input.required = true;
    fixture.detectChanges();
    expect(el.getAttribute('required')).toEqual('');
  });

  it('supports the required attribute as an unbound attribute', () => {
    let fixture = TestBed.createComponent(MdInputWrapperWithUnboundRequired);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('required')).toEqual('');
  });

  it('supports the spellCheck attribute', () => {
    let fixture = TestBed.createComponent(MdInputWrapperWithSpellcheck);
    fixture.detectChanges();

    let input: MdInputWrapper = fixture.debugElement.query(By.directive(MdInputWrapper)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('spellcheck')).toEqual('false');

    input.spellcheck = true;
    fixture.detectChanges();
    expect(el.getAttribute('spellcheck')).toEqual('true');
  });

  it('supports the spellCheck attribute as an unbound attribute', () => {
    let fixture = TestBed.createComponent(MdInputWrapperWithUnboundSpellcheck);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('spellcheck')).toEqual('true');
  });

  it('supports the step attribute', () => {
    let fixture = TestBed.createComponent(MdInputWrapperWithStep);
    fixture.detectChanges();

    let input: MdInputWrapper = fixture.debugElement.query(By.directive(MdInputWrapper)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('step')).toEqual(null);

    input.step = 0.5;
    fixture.detectChanges();
    expect(el.getAttribute('step')).toEqual('0.5');
  });

  it('supports the tabIndex attribute', () => {
    let fixture = TestBed.createComponent(MdInputWrapperWithTabindex);
    fixture.detectChanges();

    let input: MdInputWrapper = fixture.debugElement.query(By.directive(MdInputWrapper)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('tabindex')).toEqual(null);

    input.tabindex = 1;
    fixture.detectChanges();
    expect(el.getAttribute('tabindex')).toEqual('1');
  });

  it('supports a name attribute', () => {
    let fixture = TestBed.createComponent(MdInputWrapperWithNameTestController);

    fixture.detectChanges();

    const inputElement: HTMLInputElement = fixture.debugElement.query(By.css('input'))
        .nativeElement;

    expect(inputElement.name).toBe('some-name');
  });

  it('toggles the disabled state when used with a FormControl', () => {
    let fixture = TestBed.createComponent(MdInputWrapperWithFormControl);

    fixture.detectChanges();

    let input: MdInputWrapper = fixture.debugElement.query(By.directive(MdInputWrapper)).componentInstance;
    let testComponent: MdInputWrapperWithFormControl = fixture.debugElement.componentInstance;

    expect(input.disabled).toBe(false);

    testComponent.formControl.disable();
    fixture.detectChanges();

    expect(input.disabled).toBe(true);

    testComponent.formControl.enable();
    fixture.detectChanges();

    expect(input.disabled).toBe(false);
  });

  describe('md-textarea', () => {
    it('supports the rows, cols, and wrap attributes', () => {
      let fixture = TestBed.createComponent(MdTextareaWithBindings);

      fixture.detectChanges();

      const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
      expect(textarea.rows).toBe(4);
      expect(textarea.cols).toBe(8);
      expect(textarea.wrap).toBe('hard');
    });
  });*/

});

@Component({
  template: `<md-input-wrapper><input id="test-id"></md-input-wrapper>`
})
class MdInputWrapperWithId {
  value: number = 0;
}

@Component({
  template: `<md-input-wrapper><input type="number" [(ngModel)]="value"></md-input-wrapper>`
})
class MdInputWrapperNumberTypeConservedTestComponent {
  value: number = 0;
}

@Component({
  template: `<md-input-wrapper><input required placeholder="hello"></md-input-wrapper>`
})
class MdInputWrapperPlaceholderRequiredTestComponent {}

@Component({
  template: `
    <md-input-wrapper>
      <input>
      <md-placeholder>{{placeholder}}</md-placeholder>
    </md-input-wrapper>`
})
class MdInputWrapperPlaceholderElementTestComponent {
  placeholder: string = 'Default Placeholder';
}

@Component({
  template: `<md-input-wrapper><input [placeholder]="placeholder"></md-input-wrapper>`
})
class MdInputWrapperPlaceholderAttrTestComponent {
  placeholder: string = '';
}

@Component({
  template: `<md-input-wrapper><input><md-hint>{{label}}</md-hint></md-input-wrapper>`
})
class MdInputWrapperHintLabel2TestController {
  label: string = '';
}

@Component({
  template: `<md-input-wrapper [hintLabel]="label"><input></md-input-wrapper>`
})
class MdInputWrapperHintLabelTestController {
  label: string = '';
}

@Component({
  template: `<md-input-wrapper><input type="file"></md-input-wrapper>`
})
class MdInputWrapperInvalidTypeTestController {}

@Component({
  template: `
    <md-input-wrapper>
      <input placeholder="Hello">
      <md-placeholder>World</md-placeholder>
    </md-input-wrapper>`
})
class MdInputWrapperInvalidPlaceholderTestController {}

@Component({
  template: `
    <md-input-wrapper hintLabel="Hello">
      <input>
      <md-hint>World</md-hint>
    </md-input-wrapper>`
})
class MdInputWrapperInvalidHint2TestController {}

@Component({
  template: `
    <md-input-wrapper>
      <input>
      <md-hint>Hello</md-hint>
      <md-hint>World</md-hint>
    </md-input-wrapper>`
})
class MdInputWrapperInvalidHintTestController {}

@Component({
  template: `<md-input-wrapper><input [(ngModel)]="model"></md-input-wrapper>`
})
class MdInputWrapperBaseTestController {
  model: any = '';
}

@Component({
  template: `
    <md-input-wrapper>
      <input [attr.aria-label]="ariaLabel" [attr.aria-disabled]="ariaDisabled">
    </md-input-wrapper>`
})
class MdInputWrapperAriaTestController {
  ariaLabel: string = 'label';
  ariaDisabled: boolean = true;
}

@Component({
  template: `
    <md-input-wrapper>
      <input (focus)="onFocus($event)" (blur)="onBlur($event)">
    </md-input-wrapper>`
})
class MdInputWrapperWithBlurAndFocusEvents {
  onBlur(event: FocusEvent) {}
  onFocus(event: FocusEvent) {}
}

@Component({
  template: `<md-input-wrapper><input name="some-name"></md-input-wrapper>`
})
class MdInputWrapperWithNameTestController {}

@Component({
  template: `<md-input-wrapper><input [autocomplete]="autoComplete"></md-input-wrapper>`
})
class MdInputWrapperWithAutocomplete {
  autoComplete: any;
}

@Component({
  template: `<md-input-wrapper><input autocomplete></md-input-wrapper>`
})
class MdInputWrapperWithUnboundAutocomplete {}

@Component({
  template: `<md-input-wrapper><input autocomplete="name"></md-input-wrapper>`
})
class MdInputWrapperWithUnboundAutocompleteWithValue {}

@Component({
  template: `<md-input-wrapper><input [attr.autocorrect]="autoCorrect"></md-input-wrapper>`
})
class MdInputWrapperWithAutocorrect {
  autoCorrect: any;
}

@Component({
  template: `<md-input-wrapper><input autocorrect></md-input-wrapper>`
})
class MdInputWrapperWithUnboundAutocorrect {}

@Component({
  template: `<md-input-wrapper><input [autocapitalize]="autoCapitalize"></md-input-wrapper>`
})
class MdInputWrapperWithAutocapitalize {
  autoCapitalize: any;
}

@Component({
  template: `<md-input-wrapper><input autocapitalize></md-input-wrapper>`
})
class MdInputWrapperWithUnboundAutocapitalize {}

@Component({
  template: `<md-input-wrapper><input [autofocus]="autoFocus"></md-input-wrapper>`
})
class MdInputWrapperWithAutofocus {
  autoFocus: any;
}

@Component({
  template: `<md-input-wrapper><input autofocus></md-input-wrapper>`
})
class MdInputWrapperWithUnboundAutofocus {}

@Component({
  template: `<md-input-wrapper><input [readonly]="readOnly"></md-input-wrapper>`
})
class MdInputWrapperWithReadonly {
  readOnly: any;
}

@Component({
  template: `<md-input-wrapper><input readonly></md-input-wrapper>`
})
class MdInputWrapperWithUnboundReadonly {}

@Component({
  template: `<md-input-wrapper><input [spellcheck]="spellcheck"></md-input-wrapper>`
})
class MdInputWrapperWithSpellcheck {
  spellcheck: any;
}

@Component({
  template: `<md-input-wrapper><input spellcheck></md-input-wrapper>`
})
class MdInputWrapperWithUnboundSpellcheck {}

@Component({
  template: `<md-input-wrapper><input [disabled]="disabled"></md-input-wrapper>`
})
class MdInputWrapperWithDisabled {
  disabled: boolean;
}

@Component({
  template: `<md-input-wrapper><input disabled></md-input-wrapper>`
})
class MdInputWrapperWithUnboundDisabled {}

@Component({
  template: `<md-input-wrapper><input [required]="required"></md-input-wrapper>`
})
class MdInputWrapperWithRequired {
  required: any;
}

@Component({
  template: `<md-input-wrapper><input required></md-input-wrapper>`
})
class MdInputWrapperWithUnboundRequired {}

@Component({
  template: `<md-input-wrapper><input [attr.list]="list"></md-input-wrapper>`
})
class MdInputWrapperWithList {
  list: any;
}

@Component({
  template: `<md-input-wrapper><input [max]="max"></md-input-wrapper>`
})
class MdInputWrapperWithMax {
  max: any;
}

@Component({
  template: `<md-input-wrapper><input [min]="min"></md-input-wrapper>`
})
class MdInputWrapperWithMin {
  min: any;
}

@Component({
  template: `<md-input-wrapper><input [step]="step"></md-input-wrapper>`
})
class MdInputWrapperWithStep {
  step: any;
}

@Component({
  template: `<md-input-wrapper><input [tabindex]="tabIndex"></md-input-wrapper>`
})
class MdInputWrapperWithTabindex {
  tabIndex: any;
}

@Component({
  template: `<md-input-wrapper><input type="date" [placeholder]="placeholder"></md-input-wrapper>`
})
class MdInputWrapperDateTestController {
  placeholder: string = '';
}

@Component({
  template: `<md-input-wrapper><input type="text" [placeholder]="placeholder"></md-input-wrapper>`
})
class MdInputWrapperTextTestController {
  placeholder: string = '';
}

@Component({
  template: `
    <md-input-wrapper>
      <input type="password" [placeholder]="placeholder">
    </md-input-wrapper>`
})
class MdInputWrapperPasswordTestController {
  placeholder: string = '';
}

@Component({
  template: `<md-input-wrapper><input type="number" [placeholder]="placeholder"></md-input-wrapper>`
})
class MdInputWrapperNumberTestController {
  placeholder: string = '';
}

@Component({
  template: `<md-input-wrapper><input [formControl]="formControl"></md-input-wrapper>`
})
class MdInputWrapperWithFormControl {
  formControl = new FormControl();
}

@Component({
  template: `
    <md-input-wrapper>
      <textarea [rows]="rows" [cols]="cols" [wrap]="wrap" placeholder="Snacks"></textarea>
    </md-input-wrapper>`
})
class MdTextareaWithBindings {
  rows: number = 4;
  cols: number = 8;
  wrap: string = 'hard';
}
