import {ChangeDetectionStrategy, Component, model} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';

/**
 * @title Configurable checkbox
 */
@Component({
  selector: 'checkbox-configurable-example',
  templateUrl: 'checkbox-configurable-example.html',
  styleUrl: 'checkbox-configurable-example.css',
  standalone: true,
  imports: [MatCardModule, MatCheckboxModule, FormsModule, MatRadioModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxConfigurableExample {
  readonly checked = model(false);
  readonly indeterminate = model(false);
  readonly labelPosition = model<'before' | 'after'>('after');
  readonly disabled = model(false);
}
