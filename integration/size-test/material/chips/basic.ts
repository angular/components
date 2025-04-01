import {Component, NgModule} from '@angular/core';
import {MatChipsModule} from '@angular/material/chips';

/**
 * Basic component using `MatChipList` and `MatChip`. Other supported parts of the
 * chip module such as `MatChipRemove` are not used and should be tree-shaken away.
 */
@Component({
  standalone: false,
  template: `
    <mat-chip-listbox>
      <mat-chip-option>First</mat-chip-option>
    </mat-chip-listbox>
  `,
})
export class TestComponent {}

@NgModule({
  imports: [MatChipsModule],
  declarations: [TestComponent],
  bootstrap: [TestComponent],
})
export class AppModule {}
