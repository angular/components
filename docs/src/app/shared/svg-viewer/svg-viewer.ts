/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HttpClient} from '@angular/common/http';
import {Component, ElementRef, Input, OnInit, inject} from '@angular/core';

@Component({
  selector: 'docs-svg-viewer',
  template: '<div class="docs-svg-viewer" aria-hidden="true"></div>',
})
export class SvgViewer implements OnInit {
  private _elementRef = inject(ElementRef);
  private _http = inject(HttpClient);

  @Input() src: string | undefined;
  @Input() scaleToContainer: boolean | undefined;

  ngOnInit() {
    if (this.src) {
      this._fetchAndInlineSvgContent(this.src);
    }
  }

  private _inlineSvgContent(template: string) {
    this._elementRef.nativeElement.innerHTML = template;

    if (this.scaleToContainer) {
      const svg = this._elementRef.nativeElement.querySelector('svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }
  }

  private _fetchAndInlineSvgContent(path: string): void {
    const svgAbsPath = getAbsolutePathFromSrc(path);
    this._http.get(svgAbsPath, {responseType: 'text'}).subscribe(svgResponse => {
      this._inlineSvgContent(svgResponse);
    });
  }
}

function getAbsolutePathFromSrc(src: string) {
  return src.slice(src.indexOf('assets/') - 1);
}
