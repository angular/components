import {
  AfterContentChecked,
  ChangeDetectorRef,
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
  },
  directives: [NgClass],
  encapsulation: ViewEncapsulation.None,
})
export class MdIcon implements OnChanges, OnInit, AfterContentChecked {
  @Input() svgSrc: string;
  @Input() svgIcon: string;
  @Input() fontSet: string;
  @Input() fontIcon: string;
  @Input() alt: string;
  
  @Input('aria-label') ariaLabelFromParent: string = '';
  
  private _previousFontSetClass: string;
  private _previousFontIconClass: string;
    
  constructor(
      private _element: ElementRef,
      private _renderer: Renderer,
      private _changeDetectorRef: ChangeDetectorRef,
      private _mdIconProvider: MdIconProvider) {
  }

  /**
   * Splits an svgIcon binding value into its icon set and icon name components.
   * Returns a 2-element array of [(icon set), (icon name)].
   * The separator for the two fields is ':'. If there is no separator, an empty
   * string is returned for the icon set and the entire value is returned for
   * the icon name. If the argument is falsy, returns an array of two empty strings.
   * Examples:
   *   'social:cake' -> ['social', 'cake']
   *   'penguin' -> ['', 'penguin']
   *   null -> ['', '']
   */
  private _splitIconName(iconName: string): [string, string] {
    if (!iconName) {
      return ['', ''];
    }
    const sepIndex = this.svgIcon.indexOf(':');
    if (sepIndex == -1) {
      return ['', iconName];
    }
    return [iconName.substring(0, sepIndex), iconName.substring(sepIndex + 1)];
  }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (this.svgIcon) {
      const [iconSet, iconName] = this._splitIconName(this.svgIcon);
      if (iconSet) {
        this._mdIconProvider.loadIconFromSetByName(iconSet, iconName)
            .subscribe((svg: SVGElement) => this._setSvgElement(svg));
      } else {
        this._mdIconProvider.loadIconByName(this.svgIcon)
            .subscribe((svg: SVGElement) => this._setSvgElement(svg));
      }
    } else if (this.svgSrc) {
      this._mdIconProvider.loadIconFromUrl(this.svgSrc)
        .subscribe((svg: SVGElement) => this._setSvgElement(svg));    
    }
    if (this._usingFontIcon()) {
      this._updateFontIconClasses();
    }
    this._updateAriaLabel();
  }

  ngOnInit() {
    // Update font classes because ngOnChanges won't be called if none of the inputs are present,
    // e.g. <md-icon>arrow</md-icon>. In this case we need to add a CSS class for the default font.
    if (this._usingFontIcon()) {
      this._updateFontIconClasses();
    }
  }

  ngAfterContentChecked() {
    // Update aria label here because it may depend on the projected text content.
    // (e.g. <md-icon>home</md-icon> should use 'home').
    this._updateAriaLabel();
  }

  private _updateAriaLabel() {
      const ariaLabel = this._getAriaLabel();
      if (ariaLabel) {
        this._renderer.setElementAttribute(this._element.nativeElement, 'aria-label', ariaLabel);
        this._changeDetectorRef.detectChanges();
      }
  }
  
  private _getAriaLabel() {
    // If the parent provided an aria-label attribute value, use it as-is. Otherwise look for a
    // reasonable value from the alt attribute, font icon name, SVG icon name, or (for ligatures)
    // the text content of the directive.
    const label =
        this.ariaLabelFromParent ||
        this.alt ||
        this.fontIcon ||
        this._splitIconName(this.svgIcon)[1];
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
    if (!this._usingFontIcon()) {
      return;
    }
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
