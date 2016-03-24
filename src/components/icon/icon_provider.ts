import {Injectable} from 'angular2/core';
import {Http, HTTP_PROVIDERS} from 'angular2/http';
import {Observable} from 'rxjs/Rx';

/**
  *  Configuration item stored in the Icon registry; used for lookups
  *  to load if not already cached in the `loaded` cache
  */
class IconConfig {
  constructor(public url: string, public viewBoxSize: number) {
  }
}

class FontSet {
  constructor(public alias: string, fontSet: string) {
  }
}

@Injectable()
export class MdIconProvider {
  private _iconConfigsByName = new Map<string, IconConfig>();
  private _cachedIconsByName = new Map<string, SVGElement>();
  private _cachedSvgByUrl = new Map<string, string>();
  private _cachedIconsByUrl = new Map<string, SVGElement>();
  
  private _defaultViewBoxSize = 24;
  private _defaultFontSet = 'material-icons';
  private _fontSets = <[FontSet]>[];
  
  constructor(private _http: Http) {
    var defaultIcons = [
      {
        id: 'md-tabs-arrow',
        // Should these be something that won't collide with real URLs?
        // Symbol might work but that's ES6 only with no backport to ES5.
        url: '[[md-tabs-arrow.svg]]',
        svg: '<svg version="1.1" x="0px" y="0px" viewBox="0 0 24 24"><g><polygon points="15.4,7.4 14,6 8,12 14,18 15.4,16.6 10.8,12 "/></g></svg>'
      },
      {
        id: 'md-close',
        url: '[[md-close.svg]]',
        svg: '<svg version="1.1" x="0px" y="0px" viewBox="0 0 24 24"><g><path d="M19 6.41l-1.41-1.41-5.59 5.59-5.59-5.59-1.41 1.41 5.59 5.59-5.59 5.59 1.41 1.41 5.59-5.59 5.59 5.59 1.41-1.41-5.59-5.59z"/></g></svg>'
      },
      {
        id: 'md-cancel',
        url: '[[md-cancel.svg]]',
        svg: '<svg version="1.1" x="0px" y="0px" viewBox="0 0 24 24"><g><path d="M12 2c-5.53 0-10 4.47-10 10s4.47 10 10 10 10-4.47 10-10-4.47-10-10-10zm5 13.59l-1.41 1.41-3.59-3.59-3.59 3.59-1.41-1.41 3.59-3.59-3.59-3.59 1.41-1.41 3.59 3.59 3.59-3.59 1.41 1.41-3.59 3.59 3.59 3.59z"/></g></svg>'
      },
      {
        id: 'md-menu',
        url: '[[md-menu.svg]]',
        svg: '<svg version="1.1" x="0px" y="0px" viewBox="0 0 24 24"><path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" /></svg>'
      },
      {
        id: 'md-toggle-arrow',
        url: '[[md-toggle-arrow-svg]]',
        svg: '<svg version="1.1" x="0px" y="0px" viewBox="0 0 48 48"><path d="M24 16l-12 12 2.83 2.83 9.17-9.17 9.17 9.17 2.83-2.83z"/><path d="M0 0h48v48h-48z" fill="none"/></svg>'
      },
      {
        id: 'md-calendar',
        url: '[[md-calendar.svg]]',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>'
      },
    ];
    for (const item of defaultIcons) {
      this.icon(item.id, item.url);
      this._cachedSvgByUrl.set(item.url, item.svg);
    }
  }
  
  icon(name: string, url: string, viewBoxSize=0) {
    this._iconConfigsByName.set(name, new IconConfig(url, viewBoxSize || this._defaultViewBoxSize));
  }

  loadIconByName(iconName: string): Observable<SVGElement> {
    if (this._cachedIconsByName.has(iconName)) {
      // Copy the element so changes won't affect the original.
      return Observable.of(this._cachedIconsByName.get(iconName).cloneNode(true));
    }
    const iconConfig = this._iconConfigsByName.get(iconName);
    if (!iconConfig) {
      throw Error('Unknown icon: ' + iconName);
    }
    return this._loadIconFromConfig(iconConfig)
        .do((svg: SVGElement) => this._cachedIconsByName.set(iconName, svg));
  }
  
  loadIconByUrl(url: string): Observable<SVGElement> {
    if (this._cachedIconsByUrl.has(url)) {
      return Observable.of(this._cachedIconsByUrl.get(url).cloneNode(true));
    }
    return this._loadIconFromConfig(new IconConfig(url, this._defaultViewBoxSize))
        .do((svg: SVGElement) => this._cachedIconsByUrl.set(url, svg));
  }
  
  private _loadIconFromConfig(config: IconConfig): Observable<SVGElement> {
    // Fetch and cache SVG, if we haven't already.
    var svgResponse: Observable<string> = this._cachedSvgByUrl.has(config.url) ?
        Observable.of(this._cachedSvgByUrl.get(config.url)) :
        this._http.get(config.url)
            .map((response) => response.text())
            .do(svgText => this._cachedSvgByUrl.set(config.url, svgText));
    return svgResponse.map(svgText => this._createSvgElement(svgText, config));
  }
  
  private _createSvgElement(responseText: string, config: IconConfig): SVGElement {
    const div = document.createElement('DIV');
    div.innerHTML = responseText;
    const svg = <SVGElement>div.querySelector('svg');
    if (!svg) {
      throw Error('<svg> tag not found');
    }
    
    const viewBoxSize = config.viewBoxSize || this._defaultViewBoxSize;
    svg.setAttribute('fit', '');
    svg.setAttribute('height', '100%');
    svg.setAttribute('width', '100%');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('viewBox', svg.getAttribute('viewBox') || ('0 0 ' + viewBoxSize + ' ' + viewBoxSize));
    svg.setAttribute('focusable', 'false'); // Disable IE11s default behavior to make SVGs focusable.
    return svg;
  }
}
