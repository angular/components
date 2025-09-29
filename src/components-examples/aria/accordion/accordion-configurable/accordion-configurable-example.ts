import {Component, computed, model, Signal} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {
  AccordionGroup,
  AccordionTrigger,
  AccordionPanel,
  AccordionContent,
} from '@angular/aria/accordion';

/** @title Configurable Accordion using UI Patterns. */
@Component({
  selector: 'accordion-configurable-example',
  exportAs: 'AccordionConfigurableExample',
  templateUrl: 'accordion-configurable-example.html',
  styleUrl: '../accordion-examples.css', // Point to shared CSS
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    AccordionGroup,
    AccordionTrigger,
    AccordionPanel,
    AccordionContent,
  ],
})
export class AccordionConfigurableExample {
  // Accordion Group Properties
  wrap = new FormControl(true, {nonNullable: true});
  multi = new FormControl(true, {nonNullable: true});
  disabled = new FormControl(false, {nonNullable: true});
  skipDisabled = new FormControl(true, {nonNullable: true});
  expandedIds = model<string[]>(['item1']);

  // Example items
  items = ['item1', 'item2', 'item3', 'item4', 'item5'];

  expansionIcon(item: string): Signal<string> {
    return computed(() => (this.expandedIds().includes(item) ? 'expand_less' : 'expand_more'));
  }
}
