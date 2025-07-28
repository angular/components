import {LiveAnnouncer} from '@angular/cdk/a11y';
import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';

/**
 * @title Chips with form control
 */
@Component({
  selector: 'chips-form-control-example',
  templateUrl: 'chips-form-control-example.html',
  styleUrl: 'chips-form-control-example.css',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatChipsModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipsFormControlExample {
  readonly formControl = new FormControl(['angular', 'how-to', 'tutorial', 'accessibility']);
  private _announcer = inject(LiveAnnouncer);

  removeKeyword(keyword: string) {
    const keywords = this.formControl.value!;
    const index = keywords.indexOf(keyword);
    if (index > -1) {
      keywords.splice(index, 1);
      this._announcer.announce(`removed ${keyword}`);
      this.formControl.setValue([...keywords]);
    }
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our keyword
    if (value) {
      this.formControl.setValue([...this.formControl.value!, value]);
    }

    // Clear the input value
    event.chipInput!.clear();
  }
}
