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
export class MdIconProvider {
  // Cache all the things.

  // IconConfig objects and cached SVG elements for individual icons.
  // First level of cache is icon set (which is the empty string for the default set).
  // Second level is the icon name within the set.
  private _iconConfigs = new Map<string, Map<string, IconConfig>>();

  // IconConfig objects and cached SVG elements for icon sets.
  // These are stored only by set name, but multiple URLs can be registered under the same name.
  private _iconSetConfigs = new Map<string, [IconConfig]>();

  // Cache for icons loaded by direct URLs.
  private _cachedIconsByUrl = new Map<string, SVGElement>();

  private _fontClassNamesByAlias = new Map<string, string>();

  private _inProgressUrlFetches = new Map<string, Observable<string>>();
  
  private _defaultViewBoxSize = 24;
  private _defaultFontSetClass = 'material-icons';
  
  constructor(private _http: Http) {
  }
  
  public addIcon(iconName: string, url: string, viewBoxSize:number=0): MdIconProvider {
    return this.addIconInSet('', iconName, url, viewBoxSize);
  }
  
  public addIconInSet(
      setName: string, iconName: string, url: string, viewBoxSize:number=0): MdIconProvider {
    let iconSetMap = this._iconConfigs.get(setName);
    if (!iconSetMap) {
      iconSetMap = new Map<string, IconConfig>();
      this._iconConfigs.set(setName, iconSetMap);
    }
    iconSetMap.set(iconName, new IconConfig(url, viewBoxSize || this._defaultViewBoxSize));
    return this;
  }
  
  public addIconSet(setName: string, url: string, viewBoxSize=0): MdIconProvider {
    const config = new IconConfig(url, viewBoxSize || this._defaultViewBoxSize);
    if (this._iconSetConfigs.has(setName)) {
      // TODO: Allow multiple icon sets.
      throw Error('Attempted to add multiple icon sets for: ' + setName);
      // this._iconSetConfigsByName.get(iconSet).push(config);
    } else {
      this._iconSetConfigs.set(setName, [config]);
    }
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

  loadIconFromSetByName(setName: string, iconName: string): Observable<SVGElement> {
    // Return (copy of) cached icon if possible.
    if (this._iconConfigs.has(setName) && this._iconConfigs.get(setName).has(iconName)) {
      const config = this._iconConfigs.get(setName).get(iconName);
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
    const iconSetConfigs = this._iconSetConfigs.get(setName);
    if (iconSetConfigs) {
      const unfetchedIconSetConfigs = <[IconConfig]>[];
      // For all the icon set SVG elements we've fetched, see if any contain an icon with the
      // requested name.
      for (const setConfig of iconSetConfigs) {
        if (setConfig.svgElement) {
          const namedIcon = this._extractSvgIconFromSet(setConfig.svgElement, iconName, setConfig);
          if (namedIcon) {
            // We could cache namedSvg in _iconConfigs, but since we have to make a copy every
            // time anyway, there's probably not much advantage compared to just always extracting
            // it from the icon set.
            return Observable.of(namedIcon.cloneNode(true));
          }
        } else {
          unfetchedIconSetConfigs.push(setConfig);
        }
      }
      // Not found in any cached icon sets. If there are icon sets with URLs that we haven't
      // fetched, fetch them now and look for iconName in the results.
      if (unfetchedIconSetConfigs.length) {
        // The fun part. We need to asynchronously fetch the URLs, and see if any of them
        // have an icon with the requested name.
        let foundIcon: SVGElement = null;
        
        let parallelHttpRequests = unfetchedIconSetConfigs.map((setConfig) => {
          return this._loadIconSetFromConfig(setConfig)
              .catch((err: any, source: any, caught: any): Observable<SVGElement> => {
                // Swallow errors fetching individual URLs so the combined Observable won't
                // necessarily fail.
                console.log(`Loading icon set URL: ${setConfig.url} failed with error: ${err}`);
                return Observable.of(null);
              })
              .do((svg: SVGElement) => {
                // Cache SVG element and look for named icon if we haven't already found it.
                if (svg) {
                  setConfig.svgElement = svg;
                }
                if (!foundIcon) {
                  foundIcon = this._extractSvgIconFromSet(svg, iconName, setConfig);
                }
              });
        });
        // This will wait for all the URLs to come back. Ideally we'd like to return as soon as we
        // find an icon with the correct name.
        return Observable.forkJoin(parallelHttpRequests)
            .map((ignoredResults: any) => {
              if (foundIcon) {
                return foundIcon;
              }
              throw Error(`Failed to find icon name: ${iconName} in set: ${setName}`);
            });
        /* // Trying to use AsyncSubject, which isn't working. The URL never gets fetched.
        const subject = new AsyncSubject<SVGElement>();
        let responsesReceived = 0;

        console.log('AAA');
        for (const setConfig of unfetchedIconSetConfigs) {
          console.log('BBB: ' + setConfig.url);
          this._loadIconSetFromConfig(setConfig)
            .do((svg: SVGElement) => {
              // Cache the element.
              console.log(`Got icon set svg: ${svg}`);
              setConfig.svgElement = svg;
              if (!foundIcon) {
                const namedIcon = this._extractSvgIconFromSet(svg, iconName, setConfig);
                if (namedIcon) {
                  // Avoid broadcasting multiple items if more than one set has a matching icon.
                  foundIcon = true;
                  subject.next(namedIcon);
                }
              }
              responsesReceived += 1;
              if (!foundIcon && responsesReceived == unfetchedIconSetConfigs.length) {
                subject.error(`Failed to find icon name: ${iconName} in set: ${setName}`);
              }
            })
            .catch((err: any, source: Observable<SVGElement>, caught: any): Observable<SVGElement> => {
              console.log(`Loading icon set URL: ${setConfig.url} failed with error: ${err}`);
              responsesReceived += 1;
              if (!foundIcon && responsesReceived == unfetchedIconSetConfigs.length) {
                subject.error(`Failed to find icon name: ${iconName} in set: ${setName}`);
              }
              return source;
            });
        }
        return subject;
        */
        
        /* // Simple implementation that only supports one icon set.
        // Fetch the set and extract the icon.
        const firstConfig = unfetchedIconSetConfigs[0];
        return this._loadIconSetFromConfig(firstConfig)
          .do((iconSet: SVGElement) => firstConfig.svgElement = iconSet)
          .map((iconSet: SVGElement) => {
            const namedIcon = this._extractSvgIconFromSet(iconSet, iconName, firstConfig);
            if (!namedIcon) {
              throw Error(`Failed to find icon name: ${iconName} in set: ${setName}`);
            }
            return namedIcon;
          });
        */
      }
    }
    return Observable.throw(Error(`Unknown icon name: ${iconName} in set: ${setName}`));
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
    console.log(`*** Sending request for ${url}`);
    const req = this._http.get(url)
        .do((response) => {
          console.log(`*** Got response for ${url}`);
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
