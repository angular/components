import {Combobox, ComboboxPopup, ComboboxWidget} from '@angular/aria/combobox';
import {Listbox, Option} from '@angular/aria/listbox';
import {ToolbarWidget} from '@angular/aria/toolbar';
import {Dir, Directionality} from '@angular/cdk/bidi';
import {
  afterRenderEffect,
  booleanAttribute,
  Component,
  computed,
  Directive,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';

@Directive({
  selector: 'button[toolbar-button]',
  standalone: true,
  hostDirectives: [{directive: ToolbarWidget, inputs: ['disabled']}],
  host: {
    type: 'button',
    class: 'example-button material-symbols-outlined',
  },
})
export class SimpleToolbarButton {}

@Directive({
  selector: 'button[toolbar-toggle-button]',
  standalone: true,
  hostDirectives: [{directive: ToolbarWidget, inputs: ['disabled']}],
  host: {
    type: 'button',
    class: 'example-button material-symbols-outlined',
    '[attr.aria-pressed]': 'pressed()',
    '(click)': 'toggle()',
  },
})
export class SimpleToolbarToggleButton {
  readonly pressed = signal(false);

  toggle() {
    this.pressed.set(!this.pressed());
  }
}

@Directive({
  selector: '[toolbar-radio-group], [role="radiogroup"]',
  standalone: true,
})
export class SimpleToolbarRadioGroup {
  readonly selected = signal<SimpleToolbarRadioButton | null>(null);

  select(button: SimpleToolbarRadioButton) {
    this.selected.set(button);
  }
}

@Directive({
  selector: 'button[toolbar-radio-button]',
  standalone: true,
  hostDirectives: [{directive: ToolbarWidget, inputs: ['disabled']}],
  host: {
    role: 'radio',
    type: 'button',
    class: 'example-button material-symbols-outlined',
    '[attr.aria-checked]': 'checked()',
    '(click)': 'select()',
  },
})
export class SimpleToolbarRadioButton {
  private readonly _group = inject(SimpleToolbarRadioGroup, {optional: true});
  readonly checkedInput = input<boolean, unknown>(false, {
    alias: 'checked',
    transform: booleanAttribute,
  });

  private readonly _selfChecked = signal<boolean | null>(null);

  readonly checked = computed(() => {
    if (this._group) {
      const selected = this._group.selected();
      if (selected !== null) {
        return selected === this;
      }
      return this.checkedInput();
    }
    return this._selfChecked() ?? this.checkedInput();
  });

  select() {
    this._selfChecked.set(true);
    this._group?.select(this);
  }
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

      <ng-template [cdkConnectedOverlay]="{origin, usePopover: 'inline', matchWidth: true}" [cdkConnectedOverlayOpen]="popupExpanded()"
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
export class ToolbarCombobox {
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
