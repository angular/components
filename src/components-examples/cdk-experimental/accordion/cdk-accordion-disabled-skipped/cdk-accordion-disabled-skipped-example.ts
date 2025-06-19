import {Component, computed, model, Signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {
  CdkAccordionGroup,
  CdkAccordionTrigger,
  CdkAccordionPanel,
  CdkAccordionContent,
} from '@angular/cdk-experimental/accordion';

/** @title Accordion with skipped disabled items. */
@Component({
  selector: 'cdk-accordion-disabled-skipped-example',
  templateUrl: 'cdk-accordion-disabled-skipped-example.html',
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
export class CdkAccordionDisabledSkippedExample {
  expandedIds = model<string[]>([]);

  expansionIcon(item: string): Signal<string> {
    return computed(() => (this.expandedIds().includes(item) ? 'expand_less' : 'expand_more'));
  }
}
