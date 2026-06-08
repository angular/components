import {Component, signal} from '@angular/core';
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
  templateUrl: 'accordion-configurable-example.html',
  styleUrl: '../accordion-examples.css',
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
  softDisabled = new FormControl(true, {nonNullable: true});

  items = signal([
    {
      panelId: 'item-1',
      header: 'Item 1 Trigger',
      content: 'This is the content for Item 1.',
      disabled: signal(false),
      expanded: signal(false),
    },
    {
      panelId: 'item-2',
      header: 'Item 2 Trigger (disabled)',
      content: 'This is the content for Item 2.',
      disabled: signal(true),
      expanded: signal(false),
    },
    {
      panelId: 'item-3',
      header: 'Item 3 Trigger',
      content: 'This is the content for Item 3.',
      disabled: signal(false),
      expanded: signal(false),
    },
    {
      panelId: 'item-4',
      header: 'Item 4 Trigger',
      content: 'This is the content for Item 4.',
      disabled: signal(false),
      expanded: signal(false),
    },
    {
      panelId: 'item-5',
      header: 'Item 5 Trigger',
      content: 'This is the content for Item 5.',
      disabled: signal(false),
      expanded: signal(false),
    },
  ]);
}
