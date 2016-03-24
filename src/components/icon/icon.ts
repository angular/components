import {
  Component,
  Directive,
  ElementRef,
  Input,
  OnChanges,
  SimpleChange,
} from 'angular2/core';

import {
  MdIconProvider,
} from './icon-provider';

@Component({
  template: '<div class="md-icon-layout"></div>',
  selector: 'md-icon',
  styleUrls: ['./components/icon/icon.css'],
})
export class MdIcon implements OnChanges {
  @Input() svgSrc: string;
  @Input() svgIcon: string;
    
  constructor(private _element: ElementRef, private _mdIconProvider: MdIconProvider) {
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
  }
  
  private _setSvgElement(svg: SVGElement) {
    const layoutElement = this._element.nativeElement.querySelector('.md-icon-layout');
    layoutElement.innerHTML = '';
    layoutElement.appendChild(svg);
  }
}
