import {Component, NgModule} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';

/**
 * Basic component using `MatTabGroup` and `MatTab`. Other parts of the tabs
 * module such as lazy `MatTabContent` or `MatTabLabel` are not used and should
 * be tree-shaken away.
 */
@Component({
  standalone: false,
  template: `
    <mat-tab-group>
      <mat-tab label="Hello">Content</mat-tab>
    </mat-tab-group>
  `,
})
export class TestComponent {}

@NgModule({
  imports: [MatTabsModule],
  declarations: [TestComponent],
  bootstrap: [TestComponent],
})
export class AppModule {}
