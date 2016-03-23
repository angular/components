import {
  Component,
  Directive,
  Input,
  OnChanges,
  SimpleChange,
} from 'angular2/core';

import {
  MdIconProvider,
} from './icon_provider';

@Component({
  template: `<md-icon-inline [innerHTML]="iconSvg"></md-icon-inline>`,
  selector: 'md-icon',
  viewProviders: [MdIconProvider],
})
export class MdIcon implements OnChanges {
  @Input() svgSrc: string;
  @Input() svgIcon: string;
    
  iconSvg: string;
    
  constructor(private _mdIconProvider: MdIconProvider) {
    this.iconSvg = '<b>123456</b>';
  }
    
  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (this.svgIcon) {
      this._mdIconProvider.loadIcon(this.svgIcon)
        .subscribe((svg: string) => {this.iconSvg = svg;});
    } else if (this.svgSrc) {
      this._mdIconProvider.loadUrl(this.svgSrc)
        .subscribe((svg: string) => {this.iconSvg = svg;});    
    }
  }
}
