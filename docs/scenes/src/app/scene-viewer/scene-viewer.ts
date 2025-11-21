/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  Input,
  OnInit,
  ViewContainerRef,
  ViewEncapsulation,
  viewChild,
  inject,
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-scene-viewer',
  templateUrl: './scene-viewer.html',
  styleUrls: ['./scene-viewer.scss'],
  host: {
    '[style.filter]': 'filter',
  },
})
export class SceneViewer implements OnInit {
  private _route = inject(ActivatedRoute);
  private _sanitizer = inject(DomSanitizer);
  protected filter: SafeStyle | undefined;

  /**
   * Degree to change hue of scene by. All scenes default to a reddish hue.
   * e.g. 90 = greenish, 180 = blueish
   */
  @Input()
  get hueRotation(): number {
    return this._hueRotation;
  }

  set hueRotation(deg: number) {
    this._hueRotation = deg;
    // Modern browsers have security built in so this is just bypassing Angular's redundant checks.
    // Furthermore these checks will soon be removed.
    this.filter = this._sanitizer.bypassSecurityTrustStyle(`hue-rotate(${this.hueRotation}deg)`);
  }
  private _hueRotation = 0;

  /** Scale of scene (1 is unscaled) */
  @Input() scale = 1;

  /** Component of scene to display */
  @Input() component: any;

  readonly scene = viewChild.required('scene', {read: ViewContainerRef});

  constructor() {
    this.hueRotation = this._route.snapshot.data['hueRotate'];
    this.component = this._route.snapshot.data['scene'];
    this.scale = this._route.snapshot.data['scale'];
  }

  ngOnInit() {
    this.scene().createComponent(this.component);
    const container = document.querySelector('#scene-content-container') as HTMLElement;
    container.style.transform = `scale(${this.scale})`;
    container.style.transformOrigin = 'center';
  }
}
