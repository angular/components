import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Directive,
  ElementRef,
  Renderer
} from '@angular/core';
import {MdThemeable} from '../core/style/themeable';


@Directive({
  selector: 'md-toolbar-row, mat-toolbar-row',
  host: {
    '[class.mat-toolbar-row]': 'true',
  },
})
export class MdToolbarRow {}

@Component({
  moduleId: module.id,
  selector: 'md-toolbar, mat-toolbar',
  templateUrl: 'toolbar.html',
  styleUrls: ['toolbar.css'],
  host: {
    '[class.mat-toolbar]': 'true',
    'role': 'toolbar'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class MdToolbar extends MdThemeable {

  constructor(elementRef: ElementRef, renderer: Renderer) {
    super(renderer, elementRef);
  }

}
