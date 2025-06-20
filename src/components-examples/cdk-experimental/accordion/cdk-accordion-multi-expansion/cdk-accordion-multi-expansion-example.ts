import {Component, computed, model, Signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {
  CdkAccordionGroup,
  CdkAccordionTrigger,
  CdkAccordionPanel,
  CdkAccordionContent,
} from '@angular/cdk-experimental/accordion';

/** @title Accordion with multi-expansion. */
@Component({
  selector: 'cdk-accordion-multi-expansion-example',
  templateUrl: 'cdk-accordion-multi-expansion-example.html',
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
export class CdkAccordionMultiExpansionExample {
  expandedIds = model<string[]>([]);

  expansionIcon(item: string): Signal<string> {
    return computed(() => (this.expandedIds().includes(item) ? 'expand_less' : 'expand_more'));
  }
}
