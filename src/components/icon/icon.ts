import {
  Component,
  Directive,
  ElementRef,
  HostBinding,
  Input,
  OnChanges,
  OnInit,
  Renderer,
  SimpleChange,
  ViewEncapsulation,
} from 'angular2/core';

import {NgClass} from 'angular2/common';

import {
  MdIconProvider,
} from './icon-provider';

@Component({
  template: '<ng-content></ng-content>',
  selector: 'md-icon',
  styleUrls: ['./components/icon/icon.css'],
  host: {
    'role': 'img',
    '[attr.aria-label]': 'ariaLabel()',
  },
  directives: [NgClass],
  encapsulation: ViewEncapsulation.None,
})
export class MdIcon implements OnChanges, OnInit {
  @Input('md-svg-src') svgSrc: string;
  @Input('md-svg-icon') svgIcon: string;
  @Input('md-font-set') fontSet: string;
  @Input('md-font-icon') fontIcon: string;
  @Input() alt: string;
  
  @Input('aria-label') ariaLabelFromParent: string = '';
  
  private _previousFontSetClass: string;
  private _previousFontIconClass: string;
    
  constructor(
      private _element: ElementRef,
      private _renderer: Renderer,
      private _mdIconProvider: MdIconProvider) {
  }
    
  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (this.svgIcon) {
      const sepIndex = this.svgIcon.indexOf(':');
      if (sepIndex == -1) {
        // Icon not in set.
        this._mdIconProvider.loadIconByName(this.svgIcon)
            .subscribe((svg: SVGElement) => this._setSvgElement(svg));
      } else {
        // Set name is before separator.
        const setName = this.svgIcon.substring(0, sepIndex);
        const iconName = this.svgIcon.substring(sepIndex + 1);
        this._mdIconProvider.loadIconFromSetByName(setName, iconName)
            .subscribe((svg: SVGElement) => this._setSvgElement(svg));
      }
    } else if (this.svgSrc) {
      this._mdIconProvider.loadIconFromUrl(this.svgSrc)
        .subscribe((svg: SVGElement) => this._setSvgElement(svg));    
    }
    if (this._usingFontIcon()) {
      this._updateFontIconClasses();
    }
  }
  
  ngOnInit() {
    if (this._usingFontIcon()) {
      this._updateFontIconClasses();
    }
  }
  
  ariaLabel() {
    // If the parent provided an aria-label attribute value, use it as-is. Otherwise look for a
    // reasonable value from the alt attribute, font icon name, SVG icon name, or (for ligatures)
    // the text content of the directive.
    const label =
        this.ariaLabelFromParent ||
        this.alt ||
        this.fontIcon ||
        this.svgIcon;
    if (label) {
      return label;
    }
    // The "content" of an SVG icon is not a useful label.
    if (this._usingFontIcon()) {
      const text = this._element.nativeElement.textContent;
      if (text) {
        return text;
      }
    }
    // Warn here?
    return null;
  }

  private _usingFontIcon(): boolean {
    return !(this.svgIcon || this.svgSrc);
  }
  
  private _setSvgElement(svg: SVGElement) {
    // Can we use Renderer here somehow?
    const layoutElement = this._element.nativeElement;
    layoutElement.innerHTML = '';
    layoutElement.appendChild(svg);
  }

  private _updateFontIconClasses() {
    const elem = this._element.nativeElement;
    const fontSetClass = this.fontSet ?
        this._mdIconProvider.classNameForFontAlias(this.fontSet) :
        this._mdIconProvider.getDefaultFontSetClass();
    if (fontSetClass != this._previousFontSetClass) {
      if (this._previousFontSetClass) {
        this._renderer.setElementClass(elem, this._previousFontSetClass, false);
      }
      if (fontSetClass) {
        this._renderer.setElementClass(elem, fontSetClass, true);
      }
      this._previousFontSetClass = fontSetClass;
    }

    if (this.fontIcon != this._previousFontIconClass) {
      if (this._previousFontIconClass) {
        this._renderer.setElementClass(elem, this._previousFontIconClass, false);
      }
      if (this.fontIcon) {
        this._renderer.setElementClass(elem, this.fontIcon, true);
      }
      this._previousFontIconClass = this.fontIcon;
    }
  }
}
