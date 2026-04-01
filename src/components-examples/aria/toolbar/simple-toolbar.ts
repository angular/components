import {
  Combobox,
  ComboboxInput,
  ComboboxPopup,
  ComboboxPopupContainer,
} from '@angular/aria/combobox';
import {Listbox, Option} from '@angular/aria/listbox';
import {ToolbarWidget} from '@angular/aria/toolbar';
import {Dir, Directionality} from '@angular/cdk/bidi';
import {
  afterRenderEffect,
  Component,
  Directive,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';

@Directive({
  selector: 'button[toolbar-button]',
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
  imports: [
    Dir,
    Combobox,
    ComboboxInput,
    ComboboxPopup,
    ComboboxPopupContainer,
    Listbox,
    Option,
    ToolbarWidget,
  ],
  styleUrl: 'toolbar-common.css',
  host: {class: 'example-combobox-container'},
  template: `
    <div ngCombobox [dir]="dir()" #combobox="ngCombobox" class="example-combobox" [readonly]="true">
      <div class="example-combobox-input-container">
        <input
          ngComboboxInput
          ngToolbarWidget
          [(value)]="value"
          class="example-combobox-input"
          aria-label="Select a text style"
        />
        <span class="material-symbols-outlined example-icon example-arrow-icon"
          >arrow_drop_down</span
        >
      </div>

      <div popover="manual" #popover class="example-popover">
        <ng-template ngComboboxPopupContainer>
          <div ngListbox [value]="[value()]" class="example-listbox">
            @for (option of options; track option) {
              <div ngOption [value]="option" [label]="option" class="example-option">
                <span>{{option}}</span>
                <span aria-hidden="true" class="material-symbols-outlined example-option-icon"
                  >check</span
                >
              </div>
            }
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class SimpleCombobox {
  dir = inject(Directionality).valueSignal;
  popover = viewChild<ElementRef>('popover');
  listbox = viewChild<Listbox<any>>(Listbox);
  combobox = viewChild<Combobox<any>>(Combobox);

  value = signal('Normal text');
  options = ['Normal text', 'Title', 'Subtitle', 'Heading 1', 'Heading 2', 'Heading 3'];

  constructor() {
    afterRenderEffect(() => {
      const popover = this.popover()!;
      const combobox = this.combobox()!;
      combobox.expanded() ? this.showPopover() : popover.nativeElement.hidePopover();

      this.listbox()?.scrollActiveItemIntoView();
    });
  }

  showPopover() {
    const popover = this.popover()!;
    const combobox = this.combobox()!;

    const comboboxRect = combobox.inputElement()?.getBoundingClientRect();
    const popoverEl = popover.nativeElement;

    if (comboboxRect) {
      popoverEl.style.width = `${comboboxRect.width}px`;
      popoverEl.style.top = `${comboboxRect.bottom + 4}px`;
      popoverEl.style.left = `${comboboxRect.left - 1}px`;
    }

    popover.nativeElement.showPopover();
  }
}
