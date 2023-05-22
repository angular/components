import {Component} from '@angular/core';
import {NgFor} from '@angular/common';
import {CdkAccordionModule} from '@angular/cdk/accordion';

/**
 * @title Accordion overview
 */
@Component({
  selector: 'cdk-accordion-overview-example',
  templateUrl: 'cdk-accordion-overview-example.html',
  styleUrls: ['cdk-accordion-overview-example.css'],
  standalone: true,
  imports: [CdkAccordionModule, NgFor],
})
export class CdkAccordionOverviewExample {
  items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
  expandedIndex = 0;
}
