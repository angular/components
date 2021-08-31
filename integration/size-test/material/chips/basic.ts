import {Component, NgModule} from '@angular/core';
import {MatChipsModule} from '@angular/material/chips';
import {platformBrowser} from '@angular/platform-browser';

/**
 * Basic component using `MatChipList` and `MatChip`. Other supported parts of the
 * chip module such as `MatChipRemove` are not used and should be tree-shaken away.
 */
@Component({
  template: `
    <mat-chip-list>
      <mat-chip>First</mat-chip>
    </mat-chip-list>
  `,
})
export class TestComponent {
}

@NgModule({
  imports: [MatChipsModule],
  declarations: [TestComponent],
  bootstrap: [TestComponent],
})
export class AppModule {
}

platformBrowser().bootstrapModule(AppModule);
