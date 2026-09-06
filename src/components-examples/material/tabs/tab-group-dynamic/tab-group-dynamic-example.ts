import {Component, signal} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatTabsModule} from '@angular/material/tabs';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

/**
 * @title Tab group with dynamically changing tabs
 */
@Component({
  selector: 'tab-group-dynamic-example',
  templateUrl: 'tab-group-dynamic-example.html',
  styleUrl: 'tab-group-dynamic-example.css',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTabsModule,
  ],
})
export class TabGroupDynamicExample {
  tabs = signal(['First', 'Second', 'Third']);
  selected = new FormControl(0);

  addTab(selectAfterAdding: boolean) {
    this.tabs.update(tabs => [...tabs, 'New']);

    if (selectAfterAdding) {
      this.selected.setValue(this.tabs().length - 1);
    }
  }

  removeTab(index: number) {
    this.tabs.update(tabs => tabs.filter((_, i) => i !== index));
    this.selected.setValue(index);
  }
}
