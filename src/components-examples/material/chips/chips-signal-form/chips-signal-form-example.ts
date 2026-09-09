import {LiveAnnouncer} from '@angular/cdk/a11y';
import {Component, inject, signal} from '@angular/core';
import {form, FormField} from '@angular/forms/signals';
import {MatButtonModule} from '@angular/material/button';
import {MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';

/**
 * @title Chips in signal forms
 */
@Component({
  selector: 'chips-signal-form-example',
  templateUrl: 'chips-signal-form-example.html',
  styleUrl: 'chips-signal-form-example.css',
  imports: [FormField, MatButtonModule, MatFormFieldModule, MatChipsModule, MatIconModule],
})
export class ChipsSignalFormExample {
  private _announcer = inject(LiveAnnouncer);

  readonly keywordsFormModel = signal(['angular', 'how-to', 'tutorial', 'accessibility']);

  readonly keywordsForm = form(this.keywordsFormModel);

  protected addKeyword(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.keywordsFormModel.update(model => [...model, value]);
      this._announcer.announce(`added ${value} to signal form`);
    }

    event.chipInput.clear();
  }

  protected removeKeyword(keyword: string) {
    const keywords = this.keywordsForm().value();
    const index = keywords.lastIndexOf(keyword);

    if (index > -1) {
      keywords.splice(index, 1);
      this.keywordsFormModel.set(keywords);
      this._announcer.announce(`removed ${keyword} from signal form`);
    }
  }
}
