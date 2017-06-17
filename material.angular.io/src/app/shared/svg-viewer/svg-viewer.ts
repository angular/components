import {ElementRef, Component, Input} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';

import {ThemeColors, SvgBuilder} from './svg-builder';
import {ThemeStorage, DocsSiteTheme} from '../theme-picker/theme-storage/theme-storage';


@Component({
  selector: 'docs-svg-viewer',
  template: '<div class="docs-svg-viewer"></div>',
})

export class SvgViewer {
  @Input() svgHref: string;
  @Input() scaleToContainer: boolean;

  private _subscription: Subscription;
  private currTheme: DocsSiteTheme;
  private _previousThemeColors: ThemeColors = SvgBuilder.DEFAULT_THEME;

  constructor(
    public themeStorage: ThemeStorage,
    public svgBuilder: SvgBuilder,
    public el: ElementRef,
    public http: Http
  ) {
    this.currTheme = this.themeStorage.getStoredTheme();
    this._subscription = this.themeStorage.onThemeUpdate
      .subscribe(theme => this.swapTheme(theme));
  }

  public ngAfterViewInit() {
    if (this.currTheme) {
      setTimeout(() => this.swapTheme(this.currTheme));
    } else {
      setTimeout(() => this.svgBuilder.getSvgAsString(this.svgHref)
        .then(svgString => this.injectSvg(svgString)));
    }
  }

  public swapTheme(theme) {
    if (this._getSvgFromDom()) {
      this._convertToTheme(theme, this._getSvgFromDom());
    } else {
      this.svgBuilder.getSvgAsString(this.svgHref)
        .then(svgString => this._convertToTheme(theme, svgString));
    }
  }

  private _convertToTheme(theme, template) {
    const {newTemplate, colors} = this.svgBuilder.buildSvg(
      theme, template, this._previousThemeColors);
    this.injectSvg(newTemplate);
    this._previousThemeColors = colors;
  }

  public ngOnDestroy() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }

  public injectSvg(template) {
    this.el.nativeElement.innerHTML = template;

    if (this.scaleToContainer) {
      let svg = this.el.nativeElement.querySelector('svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }
  }

  private _getSvgFromDom() {
    const svg = this.el.nativeElement.querySelector('svg');
    return svg ? this.el.nativeElement.innerHTML : null;
  }
}
