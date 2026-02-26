import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {
  AccordionGroup,
  AccordionTrigger,
  AccordionPanel,
  AccordionContent,
} from '@angular/aria/accordion';

/** @title Accordion with single expansion. */
@Component({
  selector: 'accordion-single-expansion-example',
  templateUrl: 'accordion-single-expansion-example.html',
  styleUrl: '../accordion-examples.css',
  imports: [MatIconModule, AccordionGroup, AccordionTrigger, AccordionPanel, AccordionContent],
})
export class AccordionSingleExpansionExample {
  expansionIcon(panel: AccordionPanel): string {
    return panel ? 'expand_less' : 'expand_more';
  }
}
