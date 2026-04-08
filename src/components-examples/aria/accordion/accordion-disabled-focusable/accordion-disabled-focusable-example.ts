import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {
  AccordionGroup,
  AccordionTrigger,
  AccordionPanel,
  AccordionContent,
} from '@angular/aria/accordion';

/** @title Accordion with focusable disabled items. */
@Component({
  selector: 'accordion-disabled-focusable-example',
  templateUrl: 'accordion-disabled-focusable-example.html',
  styleUrl: '../accordion-examples.css',
  imports: [MatIconModule, AccordionGroup, AccordionTrigger, AccordionPanel, AccordionContent],
})
export class AccordionDisabledFocusableExample {
  expansionIcon(panel: AccordionPanel): string {
    return panel ? 'expand_less' : 'expand_more';
  }
}
