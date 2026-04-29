import {Combobox, ComboboxPopup, ComboboxWidget} from '@angular/aria/simple-combobox';
import {Listbox, Option} from '@angular/aria/listbox';
import {ToolbarWidget} from '@angular/aria/toolbar';
import {Dir, Directionality} from '@angular/cdk/bidi';
import {afterRenderEffect, Component, Directive, inject, signal, viewChild} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';

@Directive({
  selector: 'button[toolbar-button]',
  standalone: true,
  hostDirectives: [{directive: ToolbarWidget, inputs: ['value', 'disabled']}],
  host: {
    type: 'button',
    class: 'example-button material-symbols-outlined',
    '[aria-label]': 'widget.value()',
  },
})
export class SimpleToolbarButton {
  widget = inject(ToolbarWidget);
}

@Directive({
  selector: 'button[toolbar-toggle-button]',
  standalone: true,
  hostDirectives: [{directive: ToolbarWidget, inputs: ['value']}],
  host: {
    type: 'button',
    class: 'example-button material-symbols-outlined',
    '[aria-pressed]': 'widget.selected()',
    '[aria-label]': 'widget.value()',
  },
})
export class SimpleToolbarToggleButton {
  widget = inject(ToolbarWidget);
}

@Directive({
  selector: 'button[toolbar-radio-button]',
  standalone: true,
  hostDirectives: [{directive: ToolbarWidget, inputs: ['value', 'disabled']}],
  host: {
    role: 'radio',
    type: 'button',
    class: 'example-button material-symbols-outlined',
    '[aria-checked]': 'widget.selected()',
    '[aria-label]': 'widget.value()',
  },
})
export class SimpleToolbarRadioButton {
  widget = inject(ToolbarWidget);
}

@Component({
  selector: 'combobox',
  standalone: true,
  imports: [
    Dir,
    Combobox,
    ComboboxPopup,
    ComboboxWidget,
    Listbox,
    Option,
    ToolbarWidget,
    OverlayModule,
  ],
  styleUrl: 'toolbar-common.css',
  host: {class: 'example-combobox-container'},
  template: `
    <div class="example-combobox" [dir]="dir()">
      <div #origin class="example-combobox-input-container"
           ngCombobox
           #combobox="ngCombobox"
           ngToolbarWidget
           [(value)]="value"
           [(expanded)]="popupExpanded"
           (click)="origin.focus()">
        <div class="example-combobox-input" style="display: flex; align-items: center;" aria-label="Select a text style">
          {{ value() }}
        </div>
        <span class="material-symbols-outlined example-icon example-arrow-icon"
          >arrow_drop_down</span
        >
      </div>

      <ng-template [cdkConnectedOverlay]="{origin, usePopover: 'inline', matchWidth: true}" [cdkConnectedOverlayOpen]="true"
        [cdkConnectedOverlayDisableClose]="true">
        <ng-template ngComboboxPopup [combobox]="combobox">
          <div ngListbox ngComboboxWidget [(value)]="selectedOption" class="example-listbox example-popup" focusMode="activedescendant"
            [tabIndex]="-1" selectionMode="explicit" (click)="onCommit()"
            (keydown.enter)="onCommit()"
            (pointerdown)="$event.preventDefault()">
            @for (option of options; track option) {
              <div ngOption [value]="option" [label]="option" class="example-option example-selectable example-stateful">
                <span>{{option}}</span>
                <span aria-hidden="true" class="material-symbols-outlined example-option-icon"
                  >check</span
                >
              </div>
            }
          </div>
        </ng-template>
      </ng-template>
    </div>
  `,
})
export class SimpleCombobox {
  dir = inject(Directionality).valueSignal;
  listbox = viewChild(Listbox);
  combobox = viewChild(Combobox);

  popupExpanded = signal(false);
  selectedOption = signal<string[]>([]);
  value = signal('Normal text');
  options = ['Normal text', 'Title', 'Subtitle', 'Heading 1', 'Heading 2', 'Heading 3'];

  constructor() {
    afterRenderEffect(() => {
      this.listbox()?.scrollActiveItemIntoView();
    });
  }

  onCommit() {
    const selectedOption = this.selectedOption();
    if (selectedOption.length > 0) {
      this.value.set(selectedOption[0]);
    }
    this.popupExpanded.set(false);
  }
}
