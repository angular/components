import {Component, computed, Signal, viewChildren} from '@angular/core';
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
