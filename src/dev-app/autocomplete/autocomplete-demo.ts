/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {JsonPipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, inject, ViewChild} from '@angular/core';
import {FormControl, FormsModule, NgModel, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {ThemePalette} from '@angular/material/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';

export interface State {
  code: string;
  name: string;
  index: number;
}

export interface StateGroup {
  letter: string;
  states: State[];
}

type DisableStateOption = 'none' | 'first-middle-last' | 'all';

@Component({
  selector: 'autocomplete-demo',
  templateUrl: 'autocomplete-demo.html',
  styleUrl: 'autocomplete-demo.css',
  imports: [
    JsonPipe,
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteDemo {
  stateCtrl = new FormControl();
  currentState = '';
  currentGroupedState = '';
  topHeightCtrl = new FormControl(0);

  reactiveStates: State[];
  tdStates: State[];

  tdDisabled = false;
  reactiveStatesTheme: ThemePalette = 'primary';
  templateStatesTheme: ThemePalette = 'primary';

  availableThemes = [
    {value: 'primary', name: 'Primary'},
    {value: 'accent', name: 'Accent'},
    {value: 'warn', name: 'Warn'},
  ];

  reactiveRequireSelection = false;
  templateRequireSelection = false;

  reactiveHideSingleSelectionIndicator = false;
  templateHideSingleSelectionIndicator = false;

  reactiveAutoActiveFirstOption = false;
  templateAutoActiveFirstOption = false;

  reactiveDisableStateOption: DisableStateOption = 'none';
  templateDisableStateOption: DisableStateOption = 'none';

  @ViewChild(NgModel) modelDir: NgModel;

  groupedStates: StateGroup[];
  filteredGroupedStates: StateGroup[];
  states: State[] = [
    {code: 'AL', name: 'Alabama'},
    {code: 'AK', name: 'Alaska'},
    {code: 'AZ', name: 'Arizona'},
    {code: 'AR', name: 'Arkansas'},
    {code: 'CA', name: 'California'},
    {code: 'CO', name: 'Colorado'},
    {code: 'CT', name: 'Connecticut'},
    {code: 'DE', name: 'Delaware'},
    {code: 'FL', name: 'Florida'},
    {code: 'GA', name: 'Georgia'},
    {code: 'HI', name: 'Hawaii'},
    {code: 'ID', name: 'Idaho'},
    {code: 'IL', name: 'Illinois'},
    {code: 'IN', name: 'Indiana'},
    {code: 'IA', name: 'Iowa'},
    {code: 'KS', name: 'Kansas'},
    {code: 'KY', name: 'Kentucky'},
    {code: 'LA', name: 'Louisiana'},
    {code: 'ME', name: 'Maine'},
    {code: 'MD', name: 'Maryland'},
    {code: 'MA', name: 'Massachusetts'},
    {code: 'MI', name: 'Michigan'},
    {code: 'MN', name: 'Minnesota'},
    {code: 'MS', name: 'Mississippi'},
    {code: 'MO', name: 'Missouri'},
    {code: 'MT', name: 'Montana'},
    {code: 'NE', name: 'Nebraska'},
    {code: 'NV', name: 'Nevada'},
    {code: 'NH', name: 'New Hampshire'},
    {code: 'NJ', name: 'New Jersey'},
    {code: 'NM', name: 'New Mexico'},
    {code: 'NY', name: 'New York'},
    {code: 'NC', name: 'North Carolina'},
    {code: 'ND', name: 'North Dakota'},
    {code: 'OH', name: 'Ohio'},
    {code: 'OK', name: 'Oklahoma'},
    {code: 'OR', name: 'Oregon'},
    {code: 'PA', name: 'Pennsylvania'},
    {code: 'RI', name: 'Rhode Island'},
    {code: 'SC', name: 'South Carolina'},
    {code: 'SD', name: 'South Dakota'},
    {code: 'TN', name: 'Tennessee'},
    {code: 'TX', name: 'Texas'},
    {code: 'UT', name: 'Utah'},
    {code: 'VT', name: 'Vermont'},
    {code: 'VA', name: 'Virginia'},
    {code: 'WA', name: 'Washington'},
    {code: 'WV', name: 'West Virginia'},
    {code: 'WI', name: 'Wisconsin'},
    {code: 'WY', name: 'Wyoming'},
  ].map((state, index) => ({...state, index}));

  constructor() {
    this.tdStates = this.states.slice();
    this.reactiveStates = this.states.slice();

    this.filteredGroupedStates = this.groupedStates = this.states.reduce<StateGroup[]>(
      (groups, state) => {
        let group = groups.find(g => g.letter === state.name[0]);

        if (!group) {
          group = {letter: state.name[0], states: []};
          groups.push(group);
        }

        group.states.push({...state});

        return groups;
      },
      [],
    );
  }

  displayFn(value: any): string {
    return value && typeof value === 'object' ? value.name : value;
  }

  filterStates(val: string) {
    return val ? this._filter(this.states, val) : this.states;
  }

  filterStateGroups(val: string) {
    if (val) {
      return this.groupedStates
        .map(group => ({letter: group.letter, states: this._filter(group.states, val)}))
        .filter(group => group.states.length > 0);
    }

    return this.groupedStates;
  }

  private _filter(states: State[], val: string) {
    const filterValue = val.toLowerCase();
    return states.filter(state => state.name.toLowerCase().startsWith(filterValue));
  }

  reactiveIsStateDisabled(index: number) {
    return this._isStateDisabled(index, this.reactiveDisableStateOption);
  }

  templateIsStateDisabled(index: number) {
    return this._isStateDisabled(index, this.templateDisableStateOption);
  }

  clearTemplateState() {
    this.modelDir.reset();
    this.currentState = '';
    this.tdStates = this.states.slice();
  }

  private _isStateDisabled(stateIndex: number, disableStateOption: DisableStateOption) {
    if (disableStateOption === 'all') {
      return true;
    }
    if (disableStateOption === 'first-middle-last') {
      return (
        stateIndex === 0 ||
        stateIndex === this.states.length - 1 ||
        stateIndex === Math.floor(this.states.length / 2)
      );
    }
    return false;
  }

  dialog = inject(MatDialog);
  dialogRef: MatDialogRef<AutocompleteDemoExampleDialog> | null;

  openDialog() {
    this.dialogRef = this.dialog.open(AutocompleteDemoExampleDialog, {width: '400px'});
  }
}

@Component({
  selector: 'autocomplete-demo-example-dialog',
  template: `
    <form (submit)="close()">
      <p>Choose a T-shirt size.</p>
      <mat-form-field>
        <mat-label>T-Shirt Size</mat-label>
        <input matInput [matAutocomplete]="tdAuto" [(ngModel)]="currentSize" name="size">
        <mat-autocomplete #tdAuto="matAutocomplete">
          @for (size of sizes; track size) {
            <mat-option [value]="size">{{size}}</mat-option>
          }
        </mat-autocomplete>
      </mat-form-field>

      <button type="submit" mat-button>Close</button>
    </form>
  `,
  styles: `
    :host {
      display: block;
      padding: 20px;
    }

    form {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
  `,
  imports: [FormsModule, MatAutocompleteModule, MatButtonModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteDemoExampleDialog {
  dialogRef = inject<MatDialogRef<AutocompleteDemoExampleDialog>>(MatDialogRef);

  currentSize = '';
  sizes = ['S', 'M', 'L'];

  close() {
    this.dialogRef.close();
  }
}
