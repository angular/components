import {Component, computed, signal} from '@angular/core';
import {FormControl, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {form, FormField, required} from '@angular/forms/signals';

interface Animal {
  name: string;
  sound: string;
}

/** @title Select with form field features (signal forms) */
@Component({
  selector: 'select-hint-error-signal-form-example',
  templateUrl: 'select-hint-error-signal-form-example.html',
  imports: [MatFormFieldModule, MatSelectModule, FormField, MatInputModule],
})
export class SelectHintErrorSignalFormExample {
  protected animalControl = form(signal<string>(''), p => {
    required(p);
  });
  protected selectFormControl = form(signal(''), p => {
    required(p);
  });

  protected animalSound = computed<string | undefined>(
    () => this.animals.find(a => a.name === this.animalControl().value())?.sound,
  );

  protected animals: Animal[] = [
    {name: 'Dog', sound: 'Woof!'},
    {name: 'Cat', sound: 'Meow!'},
    {name: 'Cow', sound: 'Moo!'},
    {name: 'Fox', sound: 'Wa-pa-pa-pa-pa-pa-pow!'},
  ];
}
