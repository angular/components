import {Component} from '@angular/core';

describe('ComboboxPanel', () => {
});

@Component({
    template: `
  <button cdkCombobox #toggleCombobox class="example-combobox" 
          [triggerFor]="panel"
          [openAction]="'focus'">
    No Value
  </button>

  <ng-template cdkComboboxPanel #panel="cdkComboboxPanel">
    Panel Content
  </ng-template>`,
})
class ComboboxToggle {
}
