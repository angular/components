import {Injectable, Renderer} from 'angular2/core';
import {Http, Response, HTTP_PROVIDERS} from 'angular2/http';
import {Observable} from 'rxjs/Rx';

/**
  *  Configuration for a named icon, used when initially loading it.
  */
class IconConfig {
  constructor(public url: string, public viewBoxSize: number) {
  }
}

@Injectable()
export class MdIconProvider {
  private _iconConfigsByName = new Map<string, IconConfig>();
  private _cachedIconsByName = new Map<string, SVGElement>();

  private _iconSetConfigsByName = new Map<string, IconConfig>();
  private _cachedIconSets = new Map<string, SVGElement>();
  // Keys here are "[setName]:[iconName]"
  private _cachedIconsBySetAndName = new Map<string, SVGElement>();
  private _cachedIconsByUrl = new Map<string, SVGElement>();

  private _fontClassNamesByAlias = new Map<string, string>();

  private _inProgressUrlFetches = new Map<string, Observable<string>>();
  
  private _defaultViewBoxSize = 24;
  private _defaultFontSetClass = 'material-icons';
  
  constructor(private _http: Http) {
  }
  
  public registerIcon(name: string, url: string, viewBoxSize:number=0): MdIconProvider {
    this._iconConfigsByName.set(name, new IconConfig(url, viewBoxSize || this._defaultViewBoxSize));
    return this;
  }
  
  public registerIconSet(name: string, url: string, viewBoxSize=0): MdIconProvider {
    this._iconSetConfigsByName.set(
        name, new IconConfig(url, viewBoxSize || this._defaultViewBoxSize));
    return this;
  }
  
  public registerFontSet(alias: string, className?: string): MdIconProvider {
    this._fontClassNamesByAlias.set(alias, className || alias);
    return this;
  }
  
  public setDefaultViewBoxSize(size: number) {
    this._defaultViewBoxSize = size;
    return this;
  }
  
  public getDefaultViewBoxSize(): number {
    return this._defaultViewBoxSize;
  }
  
  public setDefaultFontSetClass(className: string) {
    this._defaultFontSetClass = className;
    return this;
  }
  
  public getDefaultFontSetClass(): string {
    return this._defaultFontSetClass;
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

  classNameForFontAlias(alias: string): string {
    if (!this._fontClassNamesByAlias.has(alias)) {
      throw Error('Unknown font alias: ' + alias);
    }
    return this._fontClassNamesByAlias.get(alias);
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
    throw Error('oops');
    /*
    const req = this._http.get(url)
        .do((response) => {
          console.log('*** Removing request: ' + url);
          this._inProgressUrlFetches.delete(url);
        })
        .map((response) => response.text());
    this._inProgressUrlFetches.set(url, req);
    return req;
    */
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
    // have to create an empty SVG node using innerHTML and append its content.
    // http://stackoverflow.com/questions/23003278/svg-innerhtml-in-firefox-can-not-display
    const svg = this._svgElementFromString('<svg></svg>');
    svg.appendChild(iconNode);
    this._setSvgAttributes(svg, config);
    return svg;
  }

  private _svgElementFromString(str: string): SVGElement {
    // TODO: Is there a better way than innerHTML? Renderer doesn't appear to have a method for
    // creating an element from an HTML string.
    const div = document.createElement('DIV');
    div.innerHTML = str;
    const svg = <SVGElement>div.querySelector('svg');
    if (!svg) {
      throw Error('<svg> tag not found');
    }
    return svg;
  }
}
