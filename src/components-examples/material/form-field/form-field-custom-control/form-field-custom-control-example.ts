import {JsonPipe} from '@angular/common';
import {
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  Field,
  FORM_FIELD,
  form,
  FormField,
  maxLength,
  minLength,
  required,
  FormValueControl,
} from '@angular/forms/signals';
import {
  MAT_FORM_FIELD,
  MatFormFieldControl,
  MatFormField,
  MatHint,
  MatLabel,
  MatSuffix,
} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';

/** @title Form field with custom telephone number input control. */
@Component({
  selector: 'form-field-custom-control-example',
  templateUrl: 'form-field-custom-control-example.html',
  imports: [
    FormField,
    MatFormField,
    MatHint,
    MatLabel,
    forwardRef(() => MyTelInput),
    MatIcon,
    JsonPipe,
    MatSuffix,
  ],
})
export class FormFieldCustomControlExample {
  readonly formModel = signal<{tel: MyTel | null}>({tel: null});

  readonly form = form(this.formModel, schemaPath => {
    required(schemaPath.tel);
  });
}

/** Data structure for holding telephone number. */
export class MyTel {
  constructor(
    readonly area: string,
    readonly exchange: string,
    readonly subscriber: string,
  ) {}
}

/** Custom `MatFormFieldControl` for telephone number input. */
@Component({
  selector: 'example-tel-input',
  templateUrl: 'example-tel-input-example.html',
  styleUrl: 'example-tel-input-example.css',
  providers: [{provide: MatFormFieldControl, useExisting: MyTelInput}],
  host: {
    '[class.example-floating]': 'shouldLabelFloat()',
    '[id]': 'id',
  },
  imports: [FormField],
})
export class MyTelInput implements FormValueControl<MyTel | null>, MatFormFieldControl<MyTel> {
  static nextId = 0;
  readonly ngControl = null;
  protected readonly _formField = inject(MAT_FORM_FIELD, {optional: true});
  private readonly _formFieldControl = inject(FORM_FIELD, {optional: true, self: true});
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly _areaInput = viewChild.required<ElementRef<HTMLInputElement>>('area');
  protected readonly _exchangeInput = viewChild.required<ElementRef<HTMLInputElement>>('exchange');
  protected readonly _subscriberInput =
    viewChild.required<ElementRef<HTMLInputElement>>('subscriber');
  private readonly _touched = signal(false);

  get ngField(): Field<MyTel> | null {
    return (this._formFieldControl?.field() as Field<MyTel>) ?? null;
  }

  readonly partsModel = signal({
    area: '',
    exchange: '',
    subscriber: '',
  });

  readonly parts = form(this.partsModel, schemaPath => {
    required(schemaPath.area);
    minLength(schemaPath.area, 3);
    maxLength(schemaPath.area, 3);
    required(schemaPath.exchange);
    minLength(schemaPath.exchange, 3);
    maxLength(schemaPath.exchange, 3);
    required(schemaPath.subscriber);
    minLength(schemaPath.subscriber, 4);
    maxLength(schemaPath.subscriber, 4);
  });

  readonly value = model<MyTel | null>(null);
  readonly controlType = 'example-tel-input';
  readonly id = `example-tel-input-${MyTelInput.nextId++}`;
  readonly userAriaDescribedBy = input<string>('', {alias: 'aria-describedby'});
  readonly placeholder = input<string>('');
  readonly required = input<boolean, unknown>(false, {transform: booleanAttribute});
  readonly disabled = input<boolean, unknown>(false, {transform: booleanAttribute});
  readonly focused = signal(false);
  readonly empty = computed(() => {
    const {area, exchange, subscriber} = this.partsModel();
    return !area && !exchange && !subscriber;
  });

  readonly shouldLabelFloat = computed(() => {
    const focused = this.focused();
    const empty = this.empty();
    return focused || !empty;
  });

  readonly errorState = computed(() => {
    const partsValid = this.parts().valid();
    const touched = this._touched();
    return !partsValid && touched;
  });

  constructor() {
    effect(() => {
      const {area, exchange, subscriber} = this.partsModel();
      this.value.set(this.parts().valid() ? new MyTel(area, exchange, subscriber) : null);
    });

    effect(() => {
      const value = this.value() || new MyTel('', '', '');
      untracked(() => {
        const current = this.partsModel();
        if (
          current.area !== value.area ||
          current.exchange !== value.exchange ||
          current.subscriber !== value.subscriber
        ) {
          this.partsModel.set({
            area: value.area,
            exchange: value.exchange,
            subscriber: value.subscriber,
          });
        }
      });
    });
  }

  onFocusIn() {
    this.focused.set(true);
  }

  onFocusOut(event: FocusEvent) {
    if (!this._elementRef.nativeElement.contains(event.relatedTarget as Element)) {
      this._touched.set(true);
      this.focused.set(false);
    }
  }

  autoFocusNext(control: Field<string>, nextElement?: HTMLInputElement): void {
    if (control().valid() && nextElement) {
      nextElement.focus();
    }
  }

  autoFocusPrev(control: Field<string>, prevElement: HTMLInputElement): void {
    if (control().value().length < 1) {
      prevElement.focus();
    }
  }

  setDescribedByIds(ids: string[]) {
    const controlElement = this._elementRef.nativeElement.querySelector(
      '.example-tel-input-container',
    )!;
    controlElement.setAttribute('aria-describedby', ids.join(' '));
  }

  onContainerClick() {
    if (this.parts.subscriber().valid() || this.parts.exchange().valid()) {
      this._subscriberInput().nativeElement.focus();
    } else if (this.parts.area().valid()) {
      this._exchangeInput().nativeElement.focus();
    } else {
      this._areaInput().nativeElement.focus();
    }
  }

  protected _handleTyping(control: Field<string>, nextElement?: HTMLInputElement): void {
    this.autoFocusNext(control, nextElement);
  }
}
