import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Component, inject} from '@angular/core';
import {MatChipEditedEvent, MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {JsonPipe, NgFor} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators} from '@angular/forms';

export interface Fruit {
  name: string;
}

/**
 * @title Chips with reactive forms
 */
@Component({
  selector: 'chips-reactive-form-example',
  templateUrl: 'chips-reactive-form-example.html',
  styleUrls: ['chips-reactive-form-example.css'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatChipsModule,
    NgFor,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe,
  ],
})
export class ChipsReactiveFormExample {
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  form: FormGroup = new FormGroup({
    fruits: new FormControl<Fruit[]>(
      [{name: 'Lemon'}, {name: 'Lime'}, {name: 'Apple'}],
      Validators.required,
    ),
  });

  get fruits() {
    return this.form.get('fruits');
  }

  announcer = inject(LiveAnnouncer);

  constructor() {}

  add(event: MatChipInputEvent): void {
    // Check if input is null
    if (this.fruits == null) return;

    const value = (event.value || '').trim();
    // Add our fruit
    if ((value || '').trim()) {
      this.fruits.setValue([...this.fruits.value, {name: value.trim()} as Fruit]);
      this.announcer.announce(`added ${event.value}`);
    }
    // Clear the input value
    event.chipInput!.clear();
  }

  remove(fruit: Fruit): void {
    if (this.fruits == null) return;

    const index = this.fruits.value.indexOf(fruit);

    if (index >= 0) {
      this.fruits.value.splice(index, 1);
      this.fruits.updateValueAndValidity();
      this.announcer.announce(`Removed ${fruit}`);
    }
  }

  edit(fruit: Fruit, event: MatChipEditedEvent) {
    if (this.fruits == null) return;

    const value = event.value.trim();
    // Remove fruit if it no longer has a name
    if (!value) {
      this.remove(fruit);
      return;
    }
    // Edit existing fruit
    const index = this.fruits?.value.indexOf(fruit);
    if (index >= 0) {
      let updatedFruits = [...this.fruits?.value];
      updatedFruits[index].name = value;
      this.fruits.patchValue(updatedFruits);
    }
  }
}
