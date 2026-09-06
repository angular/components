import {Component, TemplateRef, inject, viewChild} from '@angular/core';
import {
  MatBottomSheet,
  MatBottomSheetConfig,
  MatBottomSheetModule,
} from '@angular/material/bottom-sheet';

/**
 * @title Testing with MatBottomSheetHarness
 */
@Component({
  selector: 'bottom-sheet-harness-example',
  templateUrl: 'bottom-sheet-harness-example.html',
  imports: [MatBottomSheetModule],
})
export class BottomSheetHarnessExample {
  readonly bottomSheet = inject(MatBottomSheet);

  template = viewChild.required<TemplateRef<any>>(TemplateRef);

  open(config?: MatBottomSheetConfig) {
    return this.bottomSheet.open(this.template(), config);
  }
}
