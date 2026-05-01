import {LiveAnnouncer} from '@angular/cdk/a11y';
import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';

/**
 * @title Chips in template-driven forms
 */
@Component({
  selector: 'chips-template-form-example',
  templateUrl: 'chips-template-form-example.html',
  styleUrl: 'chips-template-form-example.css',
  imports: [MatButtonModule, MatFormFieldModule, MatChipsModule, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipsTemplateFormExample {
  private _announcer = inject(LiveAnnouncer);
  readonly keywords = signal(['angular', 'how-to', 'tutorial', 'accessibility']);

  addKeyword(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.keywords.update(keywords => [...keywords, value]);
      this._announcer.announce(`added ${value} to template form`);
    }

    event.chipInput.clear();
  }

  removeKeyword(keyword: string) {
    this.keywords.update(keywords => {
      const index = keywords.indexOf(keyword);
      if (index < 0) {
        return keywords;
      }

      keywords.splice(index, 1);
      this._announcer.announce(`removed ${keyword} from template form`);
      return [...keywords];
    });
  }
}
