import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {
  AccordionGroup,
  AccordionTrigger,
  AccordionPanel,
  AccordionContent,
} from '@angular/aria/accordion';

/** @title Accordion with multi-expansion. */
@Component({
  selector: 'accordion-multi-expansion-example',
  templateUrl: 'accordion-multi-expansion-example.html',
  styleUrl: '../accordion-examples.css',
  imports: [MatIconModule, AccordionGroup, AccordionTrigger, AccordionPanel, AccordionContent],
})
export class AccordionMultiExpansionExample {
  expansionIcon(panel: AccordionPanel): string {
    return panel ? 'expand_less' : 'expand_more';
  }
}
