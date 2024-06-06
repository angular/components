import {OverlayModule} from '@angular/cdk/overlay';
import {dispatchFakeEvent} from '@angular/cdk/testing/private';
import {
  Component,
  NgZone,
  OnDestroy,
  Provider,
  QueryList,
  Type,
  ViewChild,
  ViewChildren,
  provideZoneChangeDetection,
} from '@angular/core';
import {TestBed, waitForAsync} from '@angular/core/testing';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Subscription} from 'rxjs';
import {MatOption} from '../core';
import {MatFormField, MatFormFieldModule} from '../form-field';
import {MatInputModule} from '../input';
import {MatAutocomplete} from './autocomplete';
import {MatAutocompleteTrigger} from './autocomplete-trigger';
import {MatAutocompleteModule} from './module';

describe('MDC-based MatAutocomplete Zone.js integration', () => {
  // Creates a test component fixture.
  function createComponent<T>(component: Type<T>, providers: Provider[] = []) {
    TestBed.configureTestingModule({
      imports: [
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        OverlayModule,
      ],
      providers: [provideZoneChangeDetection(), ...providers],
      declarations: [component],
    });

    TestBed.compileComponents();

    return TestBed.createComponent<T>(component);
  }
  it('should emit from `autocomplete.closed` after click outside inside the NgZone', waitForAsync(async () => {
    const inZoneSpy = jasmine.createSpy('in zone spy');

    const fixture = createComponent(SimpleAutocomplete);
    fixture.detectChanges();

    fixture.componentInstance.trigger.openPanel();
    fixture.detectChanges();
    await new Promise(r => setTimeout(r));

    const subscription = fixture.componentInstance.trigger.autocomplete.closed.subscribe(() =>
      inZoneSpy(NgZone.isInAngularZone()),
    );
    await new Promise(r => setTimeout(r));

    dispatchFakeEvent(document, 'click');

    expect(inZoneSpy).toHaveBeenCalledWith(true);

    subscription.unsubscribe();
  }));
});

const SIMPLE_AUTOCOMPLETE_TEMPLATE = `
  <mat-form-field [floatLabel]="floatLabel" [style.width.px]="width" [color]="theme">
    @if (hasLabel) {
      <mat-label>State</mat-label>
    }
    <input
      matInput
      placeholder="State"
      [matAutocomplete]="auto"
      [matAutocompletePosition]="position"
      [matAutocompleteDisabled]="autocompleteDisabled"
      [formControl]="stateCtrl">
  </mat-form-field>
  <mat-autocomplete
    #auto="matAutocomplete"
    [class]="panelClass"
    [displayWith]="displayFn"
    [disableRipple]="disableRipple"
    [requireSelection]="requireSelection"
    [aria-label]="ariaLabel"
    [aria-labelledby]="ariaLabelledby"
    (opened)="openedSpy()"
    (closed)="closedSpy()">
    @for (state of filteredStates; track state) {
      <mat-option
        [value]="state"
        [style.height.px]="state.height"
        [disabled]="state.disabled">
        <span>{{ state.code }}: {{ state.name }}</span>
      </mat-option>
    }
  </mat-autocomplete>
`;

@Component({template: SIMPLE_AUTOCOMPLETE_TEMPLATE})
class SimpleAutocomplete implements OnDestroy {
  stateCtrl = new FormControl<{name: string; code: string} | string | null>(null);
  filteredStates: any[];
  valueSub: Subscription;
  floatLabel = 'auto';
  position = 'auto';
  width: number;
  disableRipple = false;
  autocompleteDisabled = false;
  hasLabel = true;
  requireSelection = false;
  ariaLabel: string;
  ariaLabelledby: string;
  panelClass = 'class-one class-two';
  theme: string;
  openedSpy = jasmine.createSpy('autocomplete opened spy');
  closedSpy = jasmine.createSpy('autocomplete closed spy');

  @ViewChild(MatAutocompleteTrigger, {static: true}) trigger: MatAutocompleteTrigger;
  @ViewChild(MatAutocomplete) panel: MatAutocomplete;
  @ViewChild(MatFormField) formField: MatFormField;
  @ViewChildren(MatOption) options: QueryList<MatOption>;

  states: {code: string; name: string; height?: number; disabled?: boolean}[] = [
    {code: 'AL', name: 'Alabama'},
    {code: 'CA', name: 'California'},
    {code: 'FL', name: 'Florida'},
    {code: 'KS', name: 'Kansas'},
    {code: 'MA', name: 'Massachusetts'},
    {code: 'NY', name: 'New York'},
    {code: 'OR', name: 'Oregon'},
    {code: 'PA', name: 'Pennsylvania'},
    {code: 'TN', name: 'Tennessee'},
    {code: 'VA', name: 'Virginia'},
    {code: 'WY', name: 'Wyoming'},
  ];

  constructor() {
    this.filteredStates = this.states;
    this.valueSub = this.stateCtrl.valueChanges.subscribe(val => {
      this.filteredStates = val
        ? this.states.filter(s => s.name.match(new RegExp(val as string, 'gi')))
        : this.states;
    });
  }

  displayFn(value: any): string {
    return value ? value.name : value;
  }

  ngOnDestroy() {
    this.valueSub.unsubscribe();
  }
}
