import {Component, computed, Signal, viewChildren} from '@angular/core';
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
  triggers = viewChildren(AccordionTrigger);
  expandedIds = computed(() =>
    this.triggers()
      .filter(t => t.expanded())
      .map(t => t.panelId()),
  );

  expansionIcon(item: string): Signal<string> {
    return computed(() => (this.expandedIds().includes(item) ? 'expand_less' : 'expand_more'));
  }
}
