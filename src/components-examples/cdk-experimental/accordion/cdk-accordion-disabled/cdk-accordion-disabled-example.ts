import {Component, computed, model, Signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {
  CdkAccordionGroup,
  CdkAccordionTrigger,
  CdkAccordionPanel,
  CdkAccordionContent,
} from '@angular/cdk-experimental/accordion';

/** @title Disabled Accordion. */
@Component({
  selector: 'cdk-accordion-disabled-example',
  templateUrl: 'cdk-accordion-disabled-example.html',
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
export class CdkAccordionDisabledExample {
  expandedIds = model<string[]>(['item1']);

  expansionIcon(item: string): Signal<string> {
    return computed(() => (this.expandedIds().includes(item) ? 'expand_less' : 'expand_more'));
  }
}
