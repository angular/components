/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, inject} from '@angular/core';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {CommonModule} from '@angular/common';
import {ThemePalette} from '@angular/material/core';
import {MatChipInputEvent, MatChipEditedEvent, MatChipsModule} from '@angular/material/chips';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {LiveAnnouncer} from '@angular/cdk/a11y';

export interface Person {
  name: string;
}

export interface DemoColor {
  name: string;
  color: ThemePalette;
}

@Component({
  selector: 'chips-demo',
  templateUrl: 'chips-demo.html',
  styleUrls: ['chips-demo.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatToolbarModule,
    ReactiveFormsModule,
  ],
})
export class ChipsDemo {
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  disabledListboxes = false;
  listboxesWithAvatar = false;
  disableInputs = false;
  editable = false;
  message = '';

  shirtSizes = [
    {label: 'Extra Small', avatar: 'XS', disabled: false},
    {label: 'Small', avatar: 'S', disabled: false},
    {label: 'Medium', avatar: 'M', disabled: true},
    {label: 'Large', avatar: 'L', disabled: false},
  ];

  restaurantHints = [
    {label: 'Open Now', avatar: 'O', selected: true},
    {label: 'Takes Reservations', avatar: 'R', selected: false},
    {label: 'Pet Friendly', avatar: 'P', selected: true},
    {label: 'Good for Brunch', avatar: 'B', selected: false},
  ];

  // Enter, comma, semi-colon
  separatorKeysCodes = [ENTER, COMMA, 186];

  selectedPeople = null;

  people: Person[] = [
    {name: 'Kara'},
    {name: 'Jeremy'},
    {name: 'Topher'},
    {name: 'Elad'},
    {name: 'Kristiyan'},
    {name: 'Paul'},
  ];

  availableColors: DemoColor[] = [
    {name: 'none', color: undefined},
    {name: 'Primary', color: 'primary'},
    {name: 'Accent', color: 'accent'},
    {name: 'Warn', color: 'warn'},
  ];

  announcer = inject(LiveAnnouncer);

  displayMessage(message: string): void {
    this.message = message;
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our person
    if (value) {
      this.people.push({name: value});
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  remove(person: Person): void {
    const index = this.people.indexOf(person);

    if (index >= 0) {
      this.people.splice(index, 1);
      this.announcer.announce(`Removed ${person.name}`);
    }
  }

  edit(person: Person, event: MatChipEditedEvent): void {
    if (!event.value.trim().length) {
      this.remove(person);
      return;
    }

    const index = this.people.indexOf(person);
    const newPeople = this.people.slice();
    newPeople[index] = {...newPeople[index], name: event.value};
    this.people = newPeople;
  }

  toggleVisible(): void {
    this.visible = false;
  }

  selectedColors: string[] = ['Primary', 'Warn'];
  selectedColor = 'Accent';
}
