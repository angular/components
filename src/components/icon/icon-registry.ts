import {Injectable, Renderer} from 'angular2/core';
import {Http, Response, HTTP_PROVIDERS} from 'angular2/http';
import {AsyncSubject, Observer, Observable} from 'rxjs/Rx';

/**
  *  Configuration for an icon, possibly including the cached SVG element.
  */
class IconConfig {
  svgElement: SVGElement = null;
  constructor(public url: string, public viewBoxSize: number) {
  }
}

@Injectable()
export class MdIconRegistry {
  // IconConfig objects and cached SVG elements for individual icons.
  // First level of cache is namespace (which is the empty string if not specified).
  // Second level is the icon name within the namespace.
  private _iconConfigs = new Map<string, Map<string, IconConfig>>();

  // IconConfig objects and cached SVG elements for icon sets.
  // Multiple icon sets can be registered under the same namespace.
  private _iconSetConfigs = new Map<string, IconConfig[]>();

  // Cache for icons loaded by direct URLs.
  private _cachedIconsByUrl = new Map<string, SVGElement>();

  private _fontClassNamesByAlias = new Map<string, string>();

  private _inProgressUrlFetches = new Map<string, Observable<string>>();

  private _defaultViewBoxSize = 24;
  private _defaultFontSetClass = 'material-icons';

  constructor(private _http: Http) {
  }

  public addIcon(iconName: string, url: string, viewBoxSize:number=0): this {
    return this.addIconInNamespace('', iconName, url, viewBoxSize);
  }

  public addIconInNamespace(
      namespace: string, iconName: string, url: string, viewBoxSize:number=0): this {
    let iconSetMap = this._iconConfigs.get(namespace);
    if (!iconSetMap) {
      iconSetMap = new Map<string, IconConfig>();
      this._iconConfigs.set(namespace, iconSetMap);
    }
    iconSetMap.set(iconName, new IconConfig(url, viewBoxSize || this._defaultViewBoxSize));
    return this;
  }

  public addIconSet(setName: string, url: string, viewBoxSize=0): this {
    const config = new IconConfig(url, viewBoxSize || this._defaultViewBoxSize);
    if (this._iconSetConfigs.has(setName)) {
      this._iconSetConfigs.get(setName).push(config);
    } else {
      this._iconSetConfigs.set(setName, [config]);
    }
    return this;
  }

  public registerFontSet(alias: string, className?: string): this {
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

  loadIconFromNamespaceByName(namespace: string, iconName: string): Observable<SVGElement> {
    // Return (copy of) cached icon if possible.
    if (this._iconConfigs.has(namespace) && this._iconConfigs.get(namespace).has(iconName)) {
      const config = this._iconConfigs.get(namespace).get(iconName);
      if (config.svgElement) {
        // We already have the SVG element for this icon, return a copy.
        return Observable.of(config.svgElement.cloneNode(true));
      } else {
        // Fetch the icon from the config's URL, cache it, and return a copy.
        return this._loadIconFromConfig(config)
          .do((svg: SVGElement) => config.svgElement = svg)
          .map((svg: SVGElement) => svg.cloneNode(true));
      }
    }
    // See if we have any icon sets registered for the set name.
    const iconSetConfigs = this._iconSetConfigs.get(namespace);
    if (iconSetConfigs) {
      // For all the icon set SVG elements we've fetched, see if any contain an icon with the
      // requested name.
      const namedIcon = this._extractIconWithNameFromAnySet(iconName, iconSetConfigs);
      if (namedIcon) {
        // We could cache namedSvg in _iconConfigs, but since we have to make a copy every
        // time anyway, there's probably not much advantage compared to just always extracting
        // it from the icon set.
        return Observable.of(namedIcon.cloneNode(true));
      }
      // Not found in any cached icon sets. If there are icon sets with URLs that we haven't
      // fetched, fetch them now and look for iconName in the results.
      const iconSetFetchRequests = <[Observable<SVGElement>]>[];
      iconSetConfigs.forEach((setConfig) => {
        if (!setConfig.svgElement) {
          iconSetFetchRequests.push(
              this._loadIconSetFromConfig(setConfig)
                  .catch((err: any, source: any, caught: any): Observable<SVGElement> => {
                    // Swallow errors fetching individual URLs so the combined Observable won't
                    // necessarily fail.
                    console.log(`Loading icon set URL: ${setConfig.url} failed with error: ${err}`);
                    return Observable.of(null);
                  })
                  .do((svg: SVGElement) => {
                    // Cache SVG element.
                    if (svg) {
                      setConfig.svgElement = svg;
                    }
                  })
          );
        }
      });
      // Fetch all the icon set URLs. When the requests complete, every IconSet should have a
      // cached SVG element (unless the request failed), and we can check again for the icon.
      return Observable.forkJoin(iconSetFetchRequests)
        .map((ignoredResults: any) => {
          const foundIcon = this._extractIconWithNameFromAnySet(iconName, iconSetConfigs);
          if (!foundIcon) {
            throw Error(`Failed to find icon name: ${iconName} in namespace: ${namespace}`);
          }
          return foundIcon;
        });
    }
    return Observable.throw(Error(`Unknown icon name: ${iconName} in namespace: ${namespace}`));
  }

  private _extractIconWithNameFromAnySet(iconName: string, setConfigs: IconConfig[]): SVGElement {
    // Iterate backwards, so icon sets added later have precedence.
    for (let i = setConfigs.length - 1; i >= 0; i--) {
      const config = setConfigs[i];
      if (config.svgElement) {
        const foundIcon = this._extractSvgIconFromSet(config.svgElement, iconName, config);
        if (foundIcon) {
          return foundIcon;
        }
      }
    }
    return null;
  }

  loadIconFromUrl(url: string): Observable<SVGElement> {
    if (this._cachedIconsByUrl.has(url)) {
      return Observable.of(this._cachedIconsByUrl.get(url).cloneNode(true));
    }
    return this._loadIconFromConfig(new IconConfig(url, this._defaultViewBoxSize))
        .do((svg: SVGElement) => this._cachedIconsByUrl.set(url, svg));
  }

  classNameForFontAlias(alias: string): string {
    return this._fontClassNamesByAlias.get(alias) || alias;
  }

  private _fetchUrl(url: string): Observable<string> {
    // FIXME: This is trying to avoid sending a duplicate request for a URL when there is already
    // a request in progress for that URL. But it's not working; even though we return the cached
    // Observable, a second request is still sent.
    // Observable.share seems like it should work, but doesn't seem to have any effect.
    // (http://xgrommx.github.io/rx-book/content/observable/observable_instance_methods/share.html)
    console.log('*** fetchUrl: ' + url);
    if (this._inProgressUrlFetches.has(url)) {
      console.log("*** Using existing request");
      return this._inProgressUrlFetches.get(url);
    }
    console.log(`*** Sending request for ${url}`);
    const req = this._http.get(url)
        .do((response) => {
          console.log(`*** Got response for ${url}`);
          console.log('*** Removing request: ' + url);
          this._inProgressUrlFetches.delete(url);
        })
        .map((response) => response.text());
    this._inProgressUrlFetches.set(url, req);
    return req.share();
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
      return null;
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
