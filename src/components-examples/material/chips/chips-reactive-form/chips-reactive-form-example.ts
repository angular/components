import {LiveAnnouncer} from '@angular/cdk/a11y';
import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';

/**
 * @title Chips in reactive forms
 */
@Component({
  selector: 'chips-reactive-form-example',
  templateUrl: 'chips-reactive-form-example.html',
  styleUrl: 'chips-reactive-form-example.css',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatChipsModule,
    ReactiveFormsModule,
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipsReactiveFormExample {
  readonly formControl = new FormControl(['angular', 'how-to', 'tutorial', 'accessibility']);
  private _announcer = inject(LiveAnnouncer);

  removeReactiveKeyword(keyword: string) {
    const keywords = this.formControl.value!;
    const index = keywords.indexOf(keyword);
    if (index > -1) {
      keywords.splice(index, 1);
      this._announcer.announce(`removed ${keyword}`);
      this.formControl.setValue([...keywords]);
    }
  }

  addReactiveKeyword(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our keyword
    if (value) {
      this.formControl.setValue([...this.formControl.value!, value]);
    }

    // Clear the input value
    event.chipInput!.clear();
  }
}
