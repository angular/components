import {
  Component,
  ViewEncapsulation,
  Input,
  ElementRef,
  Renderer,
} from '@angular/core';

export type MdPseudoCheckboxState = 'unchecked' | 'checked' | 'indeterminate';

/**
 * Simplified checkbox without any of the underlying form control logic
 * and fancy animations. To be used when composing other components.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  encapsulation: ViewEncapsulation.None,
  selector: 'md-pseudo-checkbox',
  styleUrls: ['pseudo-checkbox.css'],
  templateUrl: 'pseudo-checkbox.html',
  host: {
    '[class.md-pseudo-checkbox-indeterminate]': 'state === "indeterminate"',
    '[class.md-pseudo-checkbox-checked]': 'state === "checked"',
    '[class.md-pseudo-checkbox-disabled]': 'disabled',
  },
})
export class MdPseudoCheckbox {
  /** Display state of the checkbox. */
  @Input() state: MdPseudoCheckboxState = 'unchecked';

  /** Whether the checkbox is disabled. */
  @Input() disabled: boolean = false;

  /** Color of the checkbox. */
  @Input()
  get color(): string { return this._color; };
  set color(value: string) {
    if (value) {
      let nativeElement = this._elementRef.nativeElement;

      this._renderer.setElementClass(nativeElement, `md-${this.color}`, false);
      this._renderer.setElementClass(nativeElement, `md-${value}`, true);
      this._color = value;
    }
  }

  private _color: string;

  constructor(private _elementRef: ElementRef, private _renderer: Renderer) {
    this.color = 'accent';
  }
}
