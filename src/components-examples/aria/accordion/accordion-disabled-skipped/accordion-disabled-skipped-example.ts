import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {
  AccordionGroup,
  AccordionTrigger,
  AccordionPanel,
  AccordionContent,
} from '@angular/aria/accordion';

/** @title Accordion with skipped disabled items. */
@Component({
  selector: 'accordion-disabled-skipped-example',
  templateUrl: 'accordion-disabled-skipped-example.html',
  styleUrl: '../accordion-examples.css',
  imports: [MatIconModule, AccordionGroup, AccordionTrigger, AccordionPanel, AccordionContent],
})
export class AccordionDisabledSkippedExample {
  expansionIcon(panel: AccordionPanel): string {
    return panel ? 'expand_less' : 'expand_more';
  }
}
