import {Component, NgModule} from '@angular/core';
import {MatRadioModule} from '@angular/material/radio';

/**
 * Basic component using `MatRadioButton`. Doesn't use a `MatRadioGroup`, so the class
 * should be tree-shaken away properly.
 */
@Component({
  standalone: false,
  template: `
    <mat-radio-button value="hello"></mat-radio-button>
  `,
})
export class TestComponent {}

@NgModule({
  imports: [MatRadioModule],
  declarations: [TestComponent],
  bootstrap: [TestComponent],
})
export class AppModule {}
