import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {
  AccordionGroup,
  AccordionTrigger,
  AccordionPanel,
  AccordionContent,
} from '@angular/aria/accordion';

/** @title Disabled Accordion. */
@Component({
  selector: 'accordion-disabled-example',
  templateUrl: 'accordion-disabled-example.html',
  styleUrl: '../accordion-examples.css',
  imports: [MatIconModule, AccordionGroup, AccordionTrigger, AccordionPanel, AccordionContent],
})
export class AccordionDisabledExample {
  expansionIcon(panel: AccordionPanel): string {
    return panel ? 'expand_less' : 'expand_more';
  }
}
