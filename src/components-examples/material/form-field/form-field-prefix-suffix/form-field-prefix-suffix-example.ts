import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';

/** @title Form field with prefix & suffix */
@Component({
  selector: 'form-field-prefix-suffix-example',
  templateUrl: 'form-field-prefix-suffix-example.html',
  styleUrl: 'form-field-prefix-suffix-example.css',
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldPrefixSuffixExample {
  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
}
