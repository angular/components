import {Component, NgModule} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';

/**
 * Advanced component using `MatTabGroup` and `MatTab` in combination with
 * lazy `MatTabContent` and `MatTabLabel`.
 */
@Component({
  standalone: false,
  template: `
    <mat-tab-group>
      <mat-tab>
        <ng-template matTabLabel>Label</ng-template>
        <ng-template matTabContent>Content</ng-template>
      </mat-tab>
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
