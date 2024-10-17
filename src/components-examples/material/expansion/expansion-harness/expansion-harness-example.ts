import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';

/**
 * @title Testing with MatExpansionPanelHarness and MatAccordionHarness
 */
@Component({
  selector: 'expansion-harness-example',
  templateUrl: 'expansion-harness-example.html',
  imports: [MatExpansionModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpansionHarnessExample {}
