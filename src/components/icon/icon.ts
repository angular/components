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
} from './icon_provider';

@Component({
  template: '<div class="md-icon-layout"></div>',
  selector: 'md-icon',
  styleUrls: ['./components/icon/icon.css'],
  viewProviders: [MdIconProvider],
})
export class MdIcon implements OnChanges {
  @Input() svgSrc: string;
  @Input() svgIcon: string;
    
  constructor(private _element: ElementRef, private _mdIconProvider: MdIconProvider) {
  }
    
  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (this.svgIcon) {
      this._mdIconProvider.loadIconByName(this.svgIcon)
        .subscribe((svg: SVGElement) => this._setSvgElement(svg));
    } else if (this.svgSrc) {
      this._mdIconProvider.loadIconByUrl(this.svgSrc)
        .subscribe((svg: SVGElement) => this._setSvgElement(svg));    
    }
  }
  
  private _setSvgElement(svg: SVGElement) {
    const layoutElement = this._element.nativeElement.querySelector('.md-icon-layout');
    layoutElement.innerHTML = '';
    layoutElement.appendChild(svg);
  }
}
