import {Component, Input, ViewChild, ElementRef} from '@angular/core';
import {MdInkBar} from '../ink-bar';

/**
 * Navigation component matching the styles of the tab group header.
 * Provides anchored navigation with animated ink bar.
 */
@Component({
  moduleId: module.id,
  selector: 'md-tab-nav-bar',
  templateUrl: 'tab-nav-bar.html',
  styleUrls: ['tab-nav-bar.css'],
})
export class MdTabNavBar {
  @ViewChild(MdInkBar) _inkBar: MdInkBar;

  /** Animates the ink bar to the position of the active link element. */
  updateActiveLink(element: HTMLElement) {
    this._inkBar.alignToElement(element);
  }
}

@Component({
  moduleId: module.id,
  selector: '[md-tab-link]',
  template: '<ng-content></ng-content>',
  styleUrls: ['tab-link.css']
})
export class MdTabLink {
  private _isActive: boolean = false;

  @Input()
  get active(): boolean {
    return this._isActive;
  }

  set active(value: boolean) {
    this._isActive = value;
    if (value) {
      this._mdTabNavBar.updateActiveLink(this._element.nativeElement);
    }
  }

  constructor(private _mdTabNavBar: MdTabNavBar, private _element: ElementRef) {}
}
