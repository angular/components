import {
  async,
  TestBed,
} from '@angular/core/testing';
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {MatInput, MatInputModule} from './input';

function isInternetExplorer11() {
    return 'ActiveXObject' in window;
}

describe('MatInput', function () {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatInputModule.forRoot(), FormsModule],
      declarations: [
        MatInputNumberTypeConservedTestComponent,
        MatInputPlaceholderRequiredTestComponent,
        MatInputPlaceholderElementTestComponent,
        MatInputPlaceholderAttrTestComponent,
        MatInputHintLabel2TestController,
        MatInputHintLabelTestController,
        MatInputInvalidTypeTestController,
        MatInputInvalidPlaceholderTestController,
        MatInputInvalidHint2TestController,
        MatInputInvalidHintTestController,
        MatInputBaseTestController,
        MatInputAriaTestController,
        MatInputWithBlurAndFocusEvents,
        MatInputWithNameTestController,
        MatInputWithId,
        MatInputWithAutocomplete,
        MatInputWithUnboundAutocomplete,
        MatInputWithUnboundAutocompleteWithValue,
        MatInputWithAutocorrect,
        MatInputWithUnboundAutocorrect,
        MatInputWithAutocapitalize,
        MatInputWithUnboundAutocapitalize,
        MatInputWithAutofocus,
        MatInputWithUnboundAutofocus,
        MatInputWithReadonly,
        MatInputWithUnboundReadonly,
        MatInputWithSpellcheck,
        MatInputWithUnboundSpellcheck,
        MatInputWithDisabled,
        MatInputWithUnboundDisabled,
        MatInputWithRequired,
        MatInputWithUnboundRequired,
        MatInputWithList,
        MatInputWithMax,
        MatInputWithMin,
        MatInputWithStep,
        MatInputWithTabindex,
        MatInputDateTestController,
        MatInputTextTestController,
        MatInputPasswordTestController,
        MatInputNumberTestController,
      ],
    });

    TestBed.compileComponents();
  }));

  it('creates a native <input> element', () => {
    let fixture = TestBed.createComponent(MatInputBaseTestController);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('input'))).toBeTruthy();
  });

  it('should not be treated as empty if type is date', async(() => {
    if (isInternetExplorer11()) {
      return;
    }
    let fixture = TestBed.createComponent(MatInputDateTestController);
    fixture.componentInstance.placeholder = 'Placeholder';
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.className.includes('mat-empty')).toBe(false);
  }));

  it('should treat text input type as empty at init', async(() => {
    if (isInternetExplorer11()) {
      return;
    }
    let fixture = TestBed.createComponent(MatInputTextTestController);
    fixture.componentInstance.placeholder = 'Placeholder';
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.className.includes('mat-empty')).toBe(true);
  }));

  it('should treat password input type as empty at init', async(() => {
    if (isInternetExplorer11()) {
      return;
    }
    let fixture = TestBed.createComponent(MatInputPasswordTestController);
    fixture.componentInstance.placeholder = 'Placeholder';
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.className.includes('mat-empty')).toBe(true);
  }));

  it('should treat number input type as empty at init', async(() => {
    if (isInternetExplorer11()) {
      return;
    }
    let fixture = TestBed.createComponent(MatInputNumberTestController);
    fixture.componentInstance.placeholder = 'Placeholder';
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.className.includes('mat-empty')).toBe(true);
  }));

  // TODO(kara): update when core/testing adds fix
  it('support ngModel', async(() => {
    let fixture = TestBed.createComponent(MatInputBaseTestController);

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

  it('should have a different ID for outer element and internal input', () => {
    let fixture = TestBed.createComponent(MatInputWithId);
    fixture.detectChanges();

    const componentElement: HTMLElement =
        fixture.debugElement.query(By.directive(MatInput)).nativeElement;
    const inputElement: HTMLInputElement =
        fixture.debugElement.query(By.css('input')).nativeElement;

    expect(componentElement.id).toBe('test-id');
    expect(inputElement.id).toBeTruthy();
    expect(inputElement.id).not.toBe(componentElement.id);
  });

  it('counts characters', async(() => {
    let fixture = TestBed.createComponent(MatInputBaseTestController);
    let instance = fixture.componentInstance;
    fixture.detectChanges();
    let inputInstance = fixture.debugElement.query(By.directive(MatInput)).componentInstance;
    expect(inputInstance.characterCount).toEqual(0);

    instance.model = 'hello';
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(inputInstance.characterCount).toEqual(5);
    });
  }));

  it('copies aria attributes to the inner input', () => {
    let fixture = TestBed.createComponent(MatInputAriaTestController);
    let instance = fixture.componentInstance;
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(el.getAttribute('aria-label')).toEqual('label');
    instance.ariaLabel = 'label 2';
    fixture.detectChanges();
    expect(el.getAttribute('aria-label')).toEqual('label 2');

    expect(el.getAttribute('aria-disabled')).toBeTruthy();
  });

  it(`validates there's only one hint label per side`, () => {
    let fixture = TestBed.createComponent(MatInputInvalidHintTestController);

    expect(() => fixture.detectChanges()).toThrow();
    // TODO(jelbourn): .toThrow(new MatInputDuplicatedHintError('start'));
    // See https://github.com/angular/angular/issues/8348
  });

  it(`validates there's only one hint label per side (attribute)`, () => {
    let fixture = TestBed.createComponent(MatInputInvalidHint2TestController);

    expect(() => fixture.detectChanges()).toThrow();
    // TODO(jelbourn): .toThrow(new MatInputDuplicatedHintError('start'));
    // See https://github.com/angular/angular/issues/8348
  });

  it('validates there\'s only one placeholder', () => {
    let fixture = TestBed.createComponent(MatInputInvalidPlaceholderTestController);

    expect(() => fixture.detectChanges()).toThrow();
    // TODO(jelbourn): .toThrow(new MatInputPlaceholderConflictError());
    // See https://github.com/angular/angular/issues/8348
  });

  it('validates the type', () => {
    let fixture = TestBed.createComponent(MatInputInvalidTypeTestController);

    // Technically this throws during the OnChanges detection phase,
    // so the error is really a ChangeDetectionError and it becomes
    // hard to build a full exception to compare with.
    // We just check for any exception in this case.
    expect(() => fixture.detectChanges()).toThrow(/* new MatInputUnsupportedTypeError('file') */);
  });

  it('supports hint labels attribute', () => {
    let fixture = TestBed.createComponent(MatInputHintLabelTestController);
    fixture.detectChanges();

    // If the hint label is empty, expect no label.
    expect(fixture.debugElement.query(By.css('.mat-hint'))).toBeNull();

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.mat-hint'))).not.toBeNull();
  });

  it('supports hint labels elements', () => {
    let fixture = TestBed.createComponent(MatInputHintLabel2TestController);
    fixture.detectChanges();

    // In this case, we should have an empty <mat-hint>.
    let el = fixture.debugElement.query(By.css('mat-hint')).nativeElement;
    expect(el.textContent).toBeFalsy();

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('mat-hint')).nativeElement;
    expect(el.textContent).toBe('label');
  });

  it('supports placeholder attribute', () => {
    let fixture = TestBed.createComponent(MatInputPlaceholderAttrTestComponent);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label'));
    expect(el).toBeNull();

    fixture.componentInstance.placeholder = 'Other placeholder';
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch('Other placeholder');
    expect(el.nativeElement.textContent).not.toMatch(/\*/g);
  });

  it('supports placeholder element', () => {
    let fixture = TestBed.createComponent(MatInputPlaceholderElementTestComponent);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch('Default Placeholder');

    fixture.componentInstance.placeholder = 'Other placeholder';
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch('Other placeholder');
    expect(el.nativeElement.textContent).not.toMatch(/\*/g);
  });

  it('supports placeholder required star', () => {
    let fixture = TestBed.createComponent(MatInputPlaceholderRequiredTestComponent);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch(/hello\s+\*/g);
  });

  it('supports number types and conserved its value type from Angular', () => {
    let fixture = TestBed.createComponent(MatInputNumberTypeConservedTestComponent);
    fixture.detectChanges();

    const input: MatInput = fixture.debugElement.query(By.directive(MatInput)).componentInstance;
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    // Fake a `change` event being triggered.
    inputElement.value = '3';
    input._handleChange(<any> {target: inputElement});

    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe(3);
    expect(typeof fixture.componentInstance.value).toBe('number');
  });

  it('supports blur and focus events', () => {
    let fixture = TestBed.createComponent(MatInputWithBlurAndFocusEvents);
    const testComponent = fixture.componentInstance;
    const inputComponent = fixture.debugElement.query(By.directive(MatInput)).componentInstance;
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
    let fixture = TestBed.createComponent(MatInputWithAutocomplete);
    fixture.detectChanges();

    let input: MatInput = fixture.debugElement.query(By.directive(MatInput)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('autocomplete')).toBeNull();

    input.autocomplete = 'on';
    fixture.detectChanges();
    expect(el.getAttribute('autocomplete')).toEqual('on');
  });

  it('supports the autoCorrect attribute', () => {
    let fixture = TestBed.createComponent(MatInputWithAutocorrect);
    fixture.detectChanges();

    let input: MatInput = fixture.debugElement.query(By.directive(MatInput)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('autocorrect')).toBeNull();

    input.autocorrect = 'on';
    fixture.detectChanges();
    expect(el.getAttribute('autocorrect')).toEqual('on');
  });

  it('supports the autoCapitalize attribute', () => {
    let fixture = TestBed.createComponent(MatInputWithAutocapitalize);
    fixture.detectChanges();

    let input: MatInput = fixture.debugElement.query(By.directive(MatInput)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('autocapitalize')).toBeNull();

    input.autocapitalize = 'on';
    fixture.detectChanges();
    expect(el.getAttribute('autocapitalize')).toEqual('on');
  });

  it('supports the autoComplete attribute as an unbound attribute', () => {
    let fixture = TestBed.createComponent(MatInputWithUnboundAutocomplete);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('autocomplete')).toEqual('');
  });

  it('supports the autoComplete attribute as an unbound value attribute', () => {
    let fixture = TestBed.createComponent(MatInputWithUnboundAutocompleteWithValue);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('autocomplete')).toEqual('name');
  });

  it('supports the autoFocus attribute', () => {
    let fixture = TestBed.createComponent(MatInputWithAutofocus);
    fixture.detectChanges();

    let input: MatInput = fixture.debugElement.query(By.directive(MatInput)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('autofocus')).toBeNull();

    input.autofocus = true;
    fixture.detectChanges();
    expect(el.getAttribute('autofocus')).toEqual('');
  });

  it('supports the autoFocus attribute as an unbound attribute', () => {
    let fixture = TestBed.createComponent(MatInputWithUnboundAutofocus);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('autofocus')).toEqual('');
  });

  it('supports the disabled attribute', () => {
    let fixture = TestBed.createComponent(MatInputWithDisabled);
    let input: MatInput = fixture.debugElement.query(By.directive(MatInput)).componentInstance;
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
    let fixture = TestBed.createComponent(MatInputWithUnboundDisabled);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    fixture.whenStable().then(() => {
      expect(el.getAttribute('disabled')).toEqual('');
    });
  });

  it('supports the list attribute', () => {
    let fixture = TestBed.createComponent(MatInputWithList);
    let input: MatInput = fixture.debugElement.query(By.directive(MatInput)).componentInstance;
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
    let fixture = TestBed.createComponent(MatInputWithMax);
    let input: MatInput = fixture.debugElement.query(By.directive(MatInput)).componentInstance;
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
    let fixture = TestBed.createComponent(MatInputWithMin);
    let input: MatInput = fixture.debugElement.query(By.directive(MatInput)).componentInstance;
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
    let fixture = TestBed.createComponent(MatInputWithReadonly);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    let input: MatInput = fixture.debugElement.query(By.directive(MatInput)).componentInstance;

    expect(el).not.toBeNull();
    expect(el.getAttribute('readonly')).toBeNull();

    input.readonly = true;
    fixture.detectChanges();
    expect(el.getAttribute('readonly')).toEqual('');
  });

  it('supports the readOnly attribute as an unbound attribute', () => {
    let fixture = TestBed.createComponent(MatInputWithUnboundReadonly);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('readonly')).toEqual('');
  });

  it('supports the required attribute', () => {
    let fixture = TestBed.createComponent(MatInputWithRequired);
    fixture.detectChanges();

    let input: MatInput = fixture.debugElement.query(By.directive(MatInput)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('required')).toBeNull();

    input.required = true;
    fixture.detectChanges();
    expect(el.getAttribute('required')).toEqual('');
  });

  it('supports the required attribute as an unbound attribute', () => {
    let fixture = TestBed.createComponent(MatInputWithUnboundRequired);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('required')).toEqual('');
  });

  it('supports the spellCheck attribute', () => {
    let fixture = TestBed.createComponent(MatInputWithSpellcheck);
    fixture.detectChanges();

    let input: MatInput = fixture.debugElement.query(By.directive(MatInput)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('spellcheck')).toEqual('false');

    input.spellcheck = true;
    fixture.detectChanges();
    expect(el.getAttribute('spellcheck')).toEqual('true');
  });

  it('supports the spellCheck attribute as an unbound attribute', () => {
    let fixture = TestBed.createComponent(MatInputWithUnboundSpellcheck);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('spellcheck')).toEqual('true');
  });

  it('supports the step attribute', () => {
    let fixture = TestBed.createComponent(MatInputWithStep);
    fixture.detectChanges();

    let input: MatInput = fixture.debugElement.query(By.directive(MatInput)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('step')).toEqual(null);

    input.step = 0.5;
    fixture.detectChanges();
    expect(el.getAttribute('step')).toEqual('0.5');
  });

  it('supports the tabIndex attribute', () => {
    let fixture = TestBed.createComponent(MatInputWithTabindex);
    fixture.detectChanges();

    let input: MatInput = fixture.debugElement.query(By.directive(MatInput)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('tabindex')).toEqual(null);

    input.tabindex = 1;
    fixture.detectChanges();
    expect(el.getAttribute('tabindex')).toEqual('1');
  });

  it('supports a name attribute', () => {
    let fixture = TestBed.createComponent(MatInputWithNameTestController);
    const inputElement: HTMLInputElement = fixture.debugElement.query(By.css('input'))
        .nativeElement;
    fixture.detectChanges();

    expect(inputElement.name).toBe('some-name');
  });
});

@Component({template: `<mat-input id="test-id"></mat-input>`})
class MatInputWithId {
  value: number = 0;
}

@Component({template: `<mat-input type="number" [(ngModel)]="value"></mat-input>`})
class MatInputNumberTypeConservedTestComponent {
  value: number = 0;
}

@Component({template: `<mat-input required placeholder="hello"></mat-input>`})
class MatInputPlaceholderRequiredTestComponent {
}

@Component({template: `
  <mat-input> <mat-placeholder>{{placeholder}}</mat-placeholder> </mat-input>
`})
class MatInputPlaceholderElementTestComponent {
  placeholder: string = 'Default Placeholder';
}

@Component({template: `<mat-input [placeholder]="placeholder"></mat-input>`})
class MatInputPlaceholderAttrTestComponent {
  placeholder: string = '';
}

@Component({template: `<mat-input> <mat-hint>{{label}}</mat-hint> </mat-input>`})
class MatInputHintLabel2TestController {
  label: string = '';
}

@Component({template: `<mat-input [hintLabel]="label"></mat-input>`})
class MatInputHintLabelTestController {
  label: string = '';
}

@Component({template: `<mat-input type="file"></mat-input>`})
class MatInputInvalidTypeTestController { }

@Component({
  template: `
    <mat-input placeholder="Hello">
      <mat-placeholder>World</mat-placeholder>
    </mat-input>`
})
class MatInputInvalidPlaceholderTestController { }

@Component({
  template: `
    <mat-input hintLabel="Hello">
      <mat-hint>World</mat-hint>
    </mat-input>`
})
class MatInputInvalidHint2TestController { }

@Component({
  template: `
    <mat-input>
      <mat-hint>Hello</mat-hint>
      <mat-hint>World</mat-hint>
    </mat-input>`
})
class MatInputInvalidHintTestController { }

@Component({template: `<mat-input [(ngModel)]="model"></mat-input>`})
class MatInputBaseTestController {
  model: any = '';
}

@Component({template:
    `<mat-input [aria-label]="ariaLabel" [aria-disabled]="ariaDisabled"></mat-input>`})
class MatInputAriaTestController {
  ariaLabel: string = 'label';
  ariaDisabled: boolean = true;
}

@Component({template: `<mat-input (focus)="onFocus($event)" (blur)="onBlur($event)"></mat-input>`})
class MatInputWithBlurAndFocusEvents {
  onBlur(event: FocusEvent) {}
  onFocus(event: FocusEvent) {}
}

@Component({template: `<mat-input name="some-name"></mat-input>`})
class MatInputWithNameTestController { }

@Component({template: `<mat-input [autocomplete]="autoComplete"></mat-input>`})
class MatInputWithAutocomplete { }

@Component({template: `<mat-input autocomplete></mat-input>`})
class MatInputWithUnboundAutocomplete { }

@Component({template: `<mat-input autocomplete="name"></mat-input>`})
class MatInputWithUnboundAutocompleteWithValue { }

@Component({template: `<mat-input [autocorrect]="autoCorrect"></mat-input>`})
class MatInputWithAutocorrect { }

@Component({template: `<mat-input autocorrect></mat-input>`})
class MatInputWithUnboundAutocorrect { }

@Component({template: `<mat-input [autocapitalize]="autoCapitalize"></mat-input>`})
class MatInputWithAutocapitalize { }

@Component({template: `<mat-input autocapitalize></mat-input>`})
class MatInputWithUnboundAutocapitalize { }

@Component({template: `<mat-input [autofocus]="autoFocus"></mat-input>`})
class MatInputWithAutofocus { }

@Component({template: `<mat-input autofocus></mat-input>`})
class MatInputWithUnboundAutofocus { }

@Component({template: `<mat-input [readonly]="readOnly"></mat-input>`})
class MatInputWithReadonly { }

@Component({template: `<mat-input readonly></mat-input>`})
class MatInputWithUnboundReadonly { }

@Component({template: `<mat-input [spellcheck]="spellcheck"></mat-input>`})
class MatInputWithSpellcheck { }

@Component({template: `<mat-input spellcheck></mat-input>`})
class MatInputWithUnboundSpellcheck { }

@Component({template: `<mat-input [disabled]="disabled"></mat-input>`})
class MatInputWithDisabled {
  disabled: boolean;
}

@Component({template: `<mat-input disabled></mat-input>`})
class MatInputWithUnboundDisabled { }

@Component({template: `<mat-input [required]="required"></mat-input>`})
class MatInputWithRequired { }

@Component({template: `<mat-input required></mat-input>`})
class MatInputWithUnboundRequired { }

@Component({template: `<mat-input [list]="list"></mat-input>`})
class MatInputWithList { }

@Component({template: `<mat-input [max]="max"></mat-input>`})
class MatInputWithMax { }

@Component({template: `<mat-input [min]="min"></mat-input>`})
class MatInputWithMin { }

@Component({template: `<mat-input [step]="step"></mat-input>`})
class MatInputWithStep { }

@Component({template: `<mat-input [tabindex]="tabIndex"></mat-input>`})
class MatInputWithTabindex { }

@Component({template: `<mat-input type="date" [placeholder]="placeholder"></mat-input>`})
class MatInputDateTestController {
  placeholder: string = '';
}

@Component({template: `<mat-input type="text" [placeholder]="placeholder"></mat-input>`})
class MatInputTextTestController {
  placeholder: string = '';
}

@Component({template: `<mat-input type="password" [placeholder]="placeholder"></mat-input>`})
class MatInputPasswordTestController {
  placeholder: string = '';
}

@Component({template: `<mat-input type="number" [placeholder]="placeholder"></mat-input>`})
class MatInputNumberTestController {
  placeholder: string = '';
}
