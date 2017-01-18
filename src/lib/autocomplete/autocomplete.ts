import {
  Component,
  ContentChildren,
  ElementRef,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {MdOption} from '../core';
import {MenuPositionY} from '../menu/menu-positions';

@Component({
  moduleId: module.id,
  selector: 'md-autocomplete, mat-autocomplete',
  templateUrl: 'autocomplete.html',
  styleUrls: ['autocomplete.css'],
  encapsulation: ViewEncapsulation.None,
  exportAs: 'mdAutocomplete'
})
export class MdAutocomplete {

  /** Whether the autocomplete panel displays above or below its trigger. */
  positionY: MenuPositionY = 'below';

  @ViewChild(TemplateRef) template: TemplateRef<any>;
  @ViewChild('panel') panel: ElementRef;
  @ContentChildren(MdOption) options: QueryList<MdOption>;

  /**
   * Sets the panel scrollTop. This allows us to manually scroll to display
   * options below the fold, as they are not actually being focused when active.
   */
  _setScrollTop(scrollTop: number): void {
    this.panel.nativeElement.scrollTop = scrollTop;
  }

  /** Sets a class on the panel based on its position (used to set y-offset). */
  _getPositionClass() {
    return {
      'md-autocomplete-panel-below': this.positionY === 'below',
      'md-autocomplete-panel-above': this.positionY === 'above'
    };
  }
}

