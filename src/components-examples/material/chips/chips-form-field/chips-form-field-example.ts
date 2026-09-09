import {LiveAnnouncer} from '@angular/cdk/a11y';
import {Component, inject, signal} from '@angular/core';
import {disabled, form, FormField} from '@angular/forms/signals';
import {MatButtonModule} from '@angular/material/button';
import {MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';

/**
 * @title Chips with form field
 */
@Component({
  selector: 'chips-form-field-example',
  templateUrl: 'chips-form-field-example.html',
  styleUrl: 'chips-form-field-example.css',
  imports: [FormField, MatButtonModule, MatFormFieldModule, MatChipsModule, MatIconModule],
})
export class ChipsFormFieldExample {
  readonly keywordsFormModel = signal({
    words: ['angular', 'how-to', 'tutorial', 'accessibility'],
    enabled: true,
  });

  readonly keywordsForm = form(this.keywordsFormModel, p => {
    disabled(p, {
      when: ({valueOf}) => !valueOf(p.enabled),
    });
  });

  announcer = inject(LiveAnnouncer);

  protected removeKeyword(keyword: string) {
    this.keywordsFormModel.update(keywords => {
      const index = keywords.words.indexOf(keyword);
      if (index < 0) {
        return keywords;
      }

      keywords.words.splice(index, 1);
      this.announcer.announce(`removed ${keyword}`);
      return {...keywords};
    });
  }

  protected add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our keyword
    if (value) {
      this.keywordsFormModel.update(keywords => ({...keywords, words: [...keywords.words, value]}));
    }

    // Clear the input value
    event.chipInput!.clear();
  }
}
