import {Injectable} from 'angular2/core';
import {Http, HTTP_PROVIDERS} from 'angular2/http';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class MdIconProvider {
  private _namedIcons: Map<string, Observable<string>>;
  private _defaultIcons: Map<string, string>;
  
  constructor(private _http: Http) {
    this._namedIcons = new Map<string, any>();
    this._defaultIcons = new Map<string, string>();
    this._defaultIcons.set('search', `
<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="#000000">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
</svg>
    `);
  }

  loadIcon(iconName: string): Observable<string> {
    if (this._defaultIcons.has(iconName)) {
      return Observable.of(this._defaultIcons.get(iconName));
    }
    throw Error('Unknown icon: ' + iconName);
  }
  
  loadUrl(url: string): Observable<string> {
    return this._http.get(url)
        .map(response => this._extractSvg(response.text()));
  }
  
  private _extractSvg(responseText: string) {
    const start = responseText.indexOf('<svg>');
    const end = responseText.lastIndexOf('</svg>');
    return responseText.substring(start, end + '</svg>'.length);
  }
}
