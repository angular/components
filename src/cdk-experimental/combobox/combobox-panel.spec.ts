import {Component, DebugElement, Type} from '@angular/core';
import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {CdkComboboxModule} from "./combobox-module";
import {CdkCombobox} from "./combobox";
import {CdkComboboxPanel} from "./combobox-panel";

describe('ComboboxPanel', () => {
});

@Component({
    template: `
  <button cdkCombobox #toggleCombobox class="example-combobox" [triggerFor]="panel" [openAction]="'focus'">
    No Value
  </button>

  <ng-template cdkComboboxPanel #panel="cdkComboboxPanel">
    Panel Content
  </ng-template>`,
})
class ComboboxToggle {
}
