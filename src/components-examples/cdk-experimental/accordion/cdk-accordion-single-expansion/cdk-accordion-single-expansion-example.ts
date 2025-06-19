import {Component, computed, model, Signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {
  CdkAccordionGroup,
  CdkAccordionTrigger,
  CdkAccordionPanel,
  CdkAccordionContent,
} from '@angular/cdk-experimental/accordion';

/** @title Accordion with single expansion. */
@Component({
  selector: 'cdk-accordion-single-expansion-example',
  templateUrl: 'cdk-accordion-single-expansion-example.html',
  styleUrl: '../cdk-accordion-examples.css',
  standalone: true,
  imports: [
    MatIconModule,
    CdkAccordionGroup,
    CdkAccordionTrigger,
    CdkAccordionPanel,
    CdkAccordionContent,
  ],
})
export class CdkAccordionSingleExpansionExample {
  expandedIds = model<string[]>([]);

  expansionIcon(item: string): Signal<string> {
    return computed(() => (this.expandedIds().includes(item) ? 'expand_less' : 'expand_more'));
  }
}
