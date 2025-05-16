import {Component, computed, model, Signal} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {
  CdkAccordionGroup,
  CdkAccordionTrigger,
  CdkAccordionPanel,
  CdkAccordionContent,
} from '@angular/cdk-experimental/accordion';

/** @title Accordion using UI Patterns. */
@Component({
  selector: 'cdk-accordion-example',
  exportAs: 'cdkAccordionExample',
  templateUrl: 'cdk-accordion-example.html',
  styleUrl: 'cdk-accordion-example.css',
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CdkAccordionGroup,
    CdkAccordionTrigger,
    CdkAccordionPanel,
    CdkAccordionContent,
  ],
})
export class CdkAccordionExample {
  // Accordion Group Properties
  wrap = new FormControl(true, {nonNullable: true});
  multi = new FormControl(true, {nonNullable: true});
  disabled = new FormControl(false, {nonNullable: true});
  skipDisabled = new FormControl(true, {nonNullable: true});
  expandedIds = model<string[]>(['item1']);

  // Example items
  items = ['item1', 'item2', 'item3'];

  expansionIcon(item: string): Signal<string> {
    return computed(() => (this.expandedIds().includes(item) ? 'expand_less' : 'expand_more'));
  }
}
