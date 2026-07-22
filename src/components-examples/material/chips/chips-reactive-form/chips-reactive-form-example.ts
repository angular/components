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
  readonly reactiveKeywords = signal(['angular', 'how-to', 'tutorial', 'accessibility']);
  readonly formControl = new FormControl(['angular']);

  announcer = inject(LiveAnnouncer);

  removeReactiveKeyword(keyword: string) {
    this.reactiveKeywords.update(keywords => {
      const index = keywords.indexOf(keyword);
      if (index < 0) {
        return keywords;
      }

      keywords.splice(index, 1);
      this.announcer.announce(`removed ${keyword} from reactive form`);
      return [...keywords];
    });
  }

  addReactiveKeyword(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our keyword
    if (value) {
      this.reactiveKeywords.update(keywords => [...keywords, value]);
      this.announcer.announce(`added ${value} to reactive form`);
    }

    // Clear the input value
    event.chipInput!.clear();
  }
}
