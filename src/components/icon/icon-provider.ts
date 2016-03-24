import {Injectable} from 'angular2/core';
import {Http, Response, HTTP_PROVIDERS} from 'angular2/http';
import {Observable} from 'rxjs/Rx';

/**
  *  Configuration for a named icon, used when initially loading it.
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
  private _predefinedIcons = new Map<string, string>();
  private _iconConfigsByName = new Map<string, IconConfig>();
  private _cachedIconsByName = new Map<string, SVGElement>();

  private _iconSetConfigsByName = new Map<string, IconConfig>();
  private _cachedIconSets = new Map<string, SVGElement>();
  // Keys here are "[setName]:[iconName]"
  private _cachedIconsBySetAndName = new Map<string, SVGElement>();
  private _cachedIconsByUrl = new Map<string, SVGElement>();

  private _inProgressUrlFetches = new Map<string, Observable<string>>();
  
  private _defaultViewBoxSize = 24;
  private _defaultFontSet = 'material-icons';
  private _fontSets = <[FontSet]>[];
  
  constructor(private _http: Http) {
    const defaultIcons = [
      {
        id: 'md-tabs-arrow',
        svg: '<svg version="1.1" x="0px" y="0px" viewBox="0 0 24 24"><g><polygon points="15.4,7.4 14,6 8,12 14,18 15.4,16.6 10.8,12 "/></g></svg>'
      },
      {
        id: 'md-close',
        svg: '<svg version="1.1" x="0px" y="0px" viewBox="0 0 24 24"><g><path d="M19 6.41l-1.41-1.41-5.59 5.59-5.59-5.59-1.41 1.41 5.59 5.59-5.59 5.59 1.41 1.41 5.59-5.59 5.59 5.59 1.41-1.41-5.59-5.59z"/></g></svg>'
      },
      {
        id: 'md-cancel',
        svg: '<svg version="1.1" x="0px" y="0px" viewBox="0 0 24 24"><g><path d="M12 2c-5.53 0-10 4.47-10 10s4.47 10 10 10 10-4.47 10-10-4.47-10-10-10zm5 13.59l-1.41 1.41-3.59-3.59-3.59 3.59-1.41-1.41 3.59-3.59-3.59-3.59 1.41-1.41 3.59 3.59 3.59-3.59 1.41 1.41-3.59 3.59 3.59 3.59z"/></g></svg>'
      },
      {
        id: 'md-menu',
        svg: '<svg version="1.1" x="0px" y="0px" viewBox="0 0 24 24"><path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" /></svg>'
      },
      {
        id: 'md-toggle-arrow',
        svg: '<svg version="1.1" x="0px" y="0px" viewBox="0 0 48 48"><path d="M24 16l-12 12 2.83 2.83 9.17-9.17 9.17 9.17 2.83-2.83z"/><path d="M0 0h48v48h-48z" fill="none"/></svg>'
      },
      {
        id: 'md-calendar',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>'
      },
    ];
    for (const item of defaultIcons) {
      this._predefinedIcons.set(item.id, item.svg);
    }
  }
  
  icon(name: string, url: string, viewBoxSize=0) {
    this._iconConfigsByName.set(name, new IconConfig(url, viewBoxSize || this._defaultViewBoxSize));
  }
  
  iconSet(name: string, url: string, viewBoxSize=0) {
    this._iconSetConfigsByName.set(
        name, new IconConfig(url, viewBoxSize || this._defaultViewBoxSize));
  }

  loadIconByName(iconName: string): Observable<SVGElement> {
    if (this._cachedIconsByName.has(iconName)) {
      // Copy the element so changes won't affect the original.
      return Observable.of(this._cachedIconsByName.get(iconName).cloneNode(true));
    }
    const iconConfig = this._iconConfigsByName.get(iconName);
    if (!iconConfig) {
      // Check for predefined icon, create element and cache if so.
      if (this._predefinedIcons.has(iconName)) {
        const icon = this._svgElementFromString(this._predefinedIcons.get(iconName));
        this._cachedIconsByName.set(iconName, icon);
        return Observable.of(icon.cloneNode(true));
      } else {
        throw Error('Unknown icon: ' + iconName);
      }
    }
    return this._loadIconFromConfig(iconConfig)
        .do((svg: SVGElement) => this._cachedIconsByName.set(iconName, svg));
  }
  
  loadIconFromSetByName(setName: string, iconName: string): Observable<SVGElement> {
    const combinedKey = setName + ':' + iconName;
    // Check for this specific icon being cached.
    if (this._cachedIconsBySetAndName.has(combinedKey)) {
      return Observable.of(this._cachedIconsBySetAndName.get(combinedKey).cloneNode(true));
    }
    const iconConfig = this._iconSetConfigsByName.get(setName);
    if (!iconConfig) {
        throw Error('Unknown icon set: ' + setName);
    }
    // Check for the icon set being cached.
    if (this._cachedIconSets.has(setName)) {
      var iconFromSet = this._extractSvgIconFromSet(
          this._cachedIconSets.get(setName), iconName, iconConfig);
      this._cachedIconsBySetAndName.set(combinedKey, iconFromSet);
      return Observable.of(iconFromSet.cloneNode(true));
    }
    // Fetch the set and extract the icon.
    return this._loadIconSetFromConfig(iconConfig)
        .do((iconSet: SVGElement) => this._cachedIconSets.set(setName, iconSet))
        .map((iconSet: SVGElement) =>
            this._extractSvgIconFromSet(iconSet, iconName, iconConfig));
  }
  
  loadIconFromUrl(url: string): Observable<SVGElement> {
    if (this._cachedIconsByUrl.has(url)) {
      return Observable.of(this._cachedIconsByUrl.get(url).cloneNode(true));
    }
    return this._loadIconFromConfig(new IconConfig(url, this._defaultViewBoxSize))
        .do((svg: SVGElement) => this._cachedIconsByUrl.set(url, svg));
  }
  
  private _fetchUrl(url: string): Observable<string> {
    // FIXME: This is trying to avoid sending a duplicate request for a URL when there is already
    // a request in progress for that URL. But it's not working; even though we return the cached
    // Observable, a second request is still sent.
    console.log('*** fetchUrl: ' + url);
    if (this._inProgressUrlFetches.has(url)) {
      console.log("*** Using existing request");
      return this._inProgressUrlFetches.get(url);
    }
    console.log("*** Sending request");
    const req = this._http.get(url)
        .do((response) => {
          console.log('*** Removing request: ' + url);
          this._inProgressUrlFetches.delete(url);
        })
        .map((response) => response.text());
    this._inProgressUrlFetches.set(url, req);
    return req;
  }
  
  private _loadIconFromConfig(config: IconConfig): Observable<SVGElement> {
    return this._fetchUrl(config.url)
        .map(svgText => this._createSvgElementForSingleIcon(svgText, config));
  }
  
  private _loadIconSetFromConfig(config: IconConfig): Observable<SVGElement> {
    return this._fetchUrl(config.url)
        .map((svgText) => this._svgElementFromString(svgText));
  }
  
  private _createSvgElementForSingleIcon(responseText: string, config: IconConfig): SVGElement {
    const svg = this._svgElementFromString(responseText);
    this._setSvgAttributes(svg, config);
    return svg;
  }
  
  private _svgElementFromString(str: string): SVGElement {
    const div = document.createElement('DIV');
    div.innerHTML = str;
    const svg = <SVGElement>div.querySelector('svg');
    if (!svg) {
      throw Error('<svg> tag not found');
    }
    return svg;
  }

  private _setSvgAttributes(svg: SVGElement, config: IconConfig) {
    const viewBoxSize = config.viewBoxSize || this._defaultViewBoxSize;
    if (!svg.getAttribute('xmlns')) {
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }
    svg.setAttribute('fit', '');
    svg.setAttribute('height', '100%');
    svg.setAttribute('width', '100%');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('viewBox',
        svg.getAttribute('viewBox') || ('0 0 ' + viewBoxSize + ' ' + viewBoxSize));
    svg.setAttribute('focusable', 'false'); // Disable IE11 default behavior to make SVGs focusable.
  }
  
  private _extractSvgIconFromSet(
      iconSet: SVGElement, iconName: string, config: IconConfig): SVGElement {
    const iconNode = iconSet.querySelector('#' + iconName);
    if (!iconNode) {
      throw Error('No icon found in set with id: ' + iconName);
    }
    // createElement('SVG') doesn't work as expected; the DOM ends up with
    // the correct nodes, but the SVG content doesn't render. Instead we
    // have to set the entire SVG content via innerHTML, and then grab
    // the <svg> node.
    // http://stackoverflow.com/questions/23003278/svg-innerhtml-in-firefox-can-not-display
    const div = document.createElement('DIV');
    div.appendChild(iconNode);
    div.innerHTML = '<svg>' + div.innerHTML + '</svg>';
    const svg = <SVGElement>div.querySelector('svg');
    this._setSvgAttributes(svg, config);
    return svg;
  }
}
