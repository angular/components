import {Component, Input, ContentChildren, QueryList, ViewChild, ElementRef,
    forwardRef} from '@angular/core';
import {MdInkBar} from '../ink-bar';

@Component({
  moduleId: module.id,
  selector: 'md-tab-nav-bar',
  templateUrl: 'tab-nav-bar.html',
  styleUrls: ['tab-nav-bar.css'],
})
export class MdTabBar {
  @ContentChildren(forwardRef(() => MdTabLink)) private _links: QueryList<MdTabLink>;
  @ViewChild(MdInkBar) private _inkBar: MdInkBar;

  updateActiveLink(element: HTMLElement) {
    this._inkBar.alignToElement(element);
  }
}

@Component({
  moduleId: module.id,
  selector: '[md-tab-link]',
  template: '<ng-content></ng-content>',
  styleUrls: ['tab-link.css'],
  host: {
    '[class.md-tab-label]': 'true'
  }
})
export class MdTabLink {
  private _isSelected: boolean = false;
  @Input('selected')
  get active(): boolean {
    return this._isSelected;
  }
  set active(value: boolean) {
    this._isSelected = value;
    if (value) {
      this._tabBar.updateActiveLink(this._element.nativeElement);
    }
  }

  constructor(private _tabBar: MdTabBar, private _element: ElementRef) {}
}
