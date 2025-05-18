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
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {Subscription} from 'rxjs';
import {MATERIAL_ANIMATIONS, MatOption} from '../core';
import {MatFormField} from '../form-field';
import {MatInputModule} from '../input';
import {MatAutocomplete} from './autocomplete';
import {MatAutocompleteTrigger} from './autocomplete-trigger';
import {MatAutocompleteModule} from './module';

describe('MatAutocomplete Zone.js integration', () => {
  // Creates a test component fixture.
  function createComponent<T>(component: Type<T>, providers: Provider[] = []) {
    TestBed.configureTestingModule({
      providers: [
        provideZoneChangeDetection(),
        ...providers,
        {provide: MATERIAL_ANIMATIONS, useValue: {animationsDisabled: true}},
      ],
    });

    return TestBed.createComponent<T>(component);
  }

  describe('panel toggling', () => {
    let fixture: ComponentFixture<SimpleAutocomplete>;

    beforeEach(() => {
      fixture = createComponent(SimpleAutocomplete);
      fixture.detectChanges();
    });

    it('should show the panel when the first open is after the initial zone stabilization', waitForAsync(() => {
      // Note that we're running outside the Angular zone, in order to be able
      // to test properly without the subscription from `_subscribeToClosingActions`
      // giving us a false positive.
      fixture.ngZone!.runOutsideAngular(() => {
        fixture.componentInstance.trigger.openPanel();

        Promise.resolve().then(() => {
          expect(fixture.componentInstance.panel.showPanel)
            .withContext(`Expected panel to be visible.`)
            .toBe(true);
        });
      });
    }));
  });

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

@Component({
  template: `
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
  `,
  imports: [MatAutocompleteModule, MatInputModule, ReactiveFormsModule],
})
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
