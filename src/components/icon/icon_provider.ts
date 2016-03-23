import {Injectable} from 'angular2/core';
import {Http, HTTP_PROVIDERS} from 'angular2/http';
import {Observable} from 'rxjs/Rx';

const defaultConfig = {
   defaultViewBoxSize: 24,
   defaultFontSet: 'material-icons',
   fontSets : <[string]>[],
 };

@Injectable()
export class MdIconProvider {
  private _namedIcons: Map<string, Observable<SVGElement>>;
  private _defaultIcons: Map<string, SVGElement>;
  private _config: any = {};
  
  constructor(private _http: Http) {
    this._namedIcons = new Map<string, any>();
    this._defaultIcons = this._createDefaultIconMap();
  }
  
  _createDefaultIconMap(): Map<string, SVGElement> {
    const icons = new Map<string, SVGElement>();
    icons.set('md-tabs-arrow', this._createSvgElement(`
      <svg version="1.1" x="0px" y="0px" viewBox="0 0 24 24"><g><polygon points="15.4,7.4 14,6 8,12 14,18 15.4,16.6 10.8,12 "/></g></svg>
    `));
    icons.set('md-close', this._createSvgElement(`
      <svg version="1.1" x="0px" y="0px" viewBox="0 0 24 24"><g><path d="M19 6.41l-1.41-1.41-5.59 5.59-5.59-5.59-1.41 1.41 5.59 5.59-5.59 5.59 1.41 1.41 5.59-5.59 5.59 5.59 1.41-1.41-5.59-5.59z"/></g></svg>
    `));
    icons.set('md-cancel', this._createSvgElement(`
      <svg version="1.1" x="0px" y="0px" viewBox="0 0 24 24"><g><path d="M12 2c-5.53 0-10 4.47-10 10s4.47 10 10 10 10-4.47 10-10-4.47-10-10-10zm5 13.59l-1.41 1.41-3.59-3.59-3.59 3.59-1.41-1.41 3.59-3.59-3.59-3.59 1.41-1.41 3.59 3.59 3.59-3.59 1.41 1.41-3.59 3.59 3.59 3.59z"/></g></svg>
    `));
    icons.set('md-menu', this._createSvgElement(`
      <svg version="1.1" x="0px" y="0px" viewBox="0 0 24 24"><path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" /></svg>
    `));
    icons.set('md-toggle-arrow', this._createSvgElement(`
      <svg version="1.1" x="0px" y="0px" viewBox="0 0 48 48"><path d="M24 16l-12 12 2.83 2.83 9.17-9.17 9.17 9.17 2.83-2.83z"/><path d="M0 0h48v48h-48z" fill="none"/></svg>
    `));
    icons.set('md-calendar', this._createSvgElement(`
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
    `));
    return icons;
  }

  loadIcon(iconName: string): Observable<SVGElement> {
    if (this._defaultIcons.has(iconName)) {
      // Copy the element so changes won't affect the original.
      return Observable.of(this._defaultIcons.get(iconName).cloneNode(true));
    }
    throw Error('Unknown icon: ' + iconName);
  }
  
  loadUrl(url: string): Observable<SVGElement> {
    return this._http.get(url)
        .map(response => this._createSvgElement(response.text()));
  }
  
  private _createSvgElement(responseText: string): SVGElement {
    const div = document.createElement('DIV');
    div.innerHTML = responseText;
    const svg = <SVGElement>div.querySelector('svg');
    if (!svg) {
      throw Error('<svg> tag not found');
    }
    
    const viewBoxSize = this._config ? this._config.viewBoxSize : defaultConfig.defaultViewBoxSize;
    svg.setAttribute('fit', '');
    svg.setAttribute('height', '100%');
    svg.setAttribute('width', '100%');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('viewBox', svg.getAttribute('viewBox') || ('0 0 ' + viewBoxSize + ' ' + viewBoxSize));
    svg.setAttribute('focusable', 'false'); // Disable IE11s default behavior to make SVGs focusable.
    return svg;
  }
}
