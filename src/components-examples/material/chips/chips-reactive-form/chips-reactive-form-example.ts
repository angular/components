import {LiveAnnouncer} from '@angular/cdk/a11y';
import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
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
  private _announcer = inject(LiveAnnouncer);

  readonly formControl = new FormControl(['angular', 'how-to', 'tutorial', 'accessibility'], {
    nonNullable: true,
  });

  addKeyword(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.formControl.setValue([...this.formControl.value, value]);
      this._announcer.announce(`added ${value} to reactive form`);
    }

    event.chipInput.clear();
  }

  removeKeyword(keyword: string) {
    const keywords = this.formControl.value;
    const index = keywords.lastIndexOf(keyword);

    if (index > -1) {
      keywords.splice(index, 1);
      this.formControl.setValue([...keywords]);
      this._announcer.announce(`removed ${keyword} from reactive form`);
    }
  }
}
