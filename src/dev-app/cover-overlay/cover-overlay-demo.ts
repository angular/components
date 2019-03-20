/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewContainerRef} from '@angular/core';
import {
  CoverPositionStrategyFactory,
  Overlay,
  OverlayRef,
} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {Component, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';

export interface OriginConfig {
  x: number,
  y: number,
  connected?: boolean,
}

@Component({
  moduleId: module.id,
  selector: 'cover-overlay-demo',
  templateUrl: 'cover-overlay-demo.html',
  styleUrls: ['cover-overlay-demo.css'],
})
export class CoverOverlayDemo {
  @ViewChild('topOrigin') topOrigin: ElementRef;
  @ViewChild('rightOrigin') rightOrigin: ElementRef;
  @ViewChild('bottomOrigin') bottomOrigin: ElementRef;
  @ViewChild('leftOrigin') leftOrigin: ElementRef;
  @ViewChild('overlay') overlayTemplate: TemplateRef<any>;

  readonly left:  = {x: }
  isFlexible = true;
  canPush = true;
  showBoundingBox = false;
  itemCount = 25;
  itemArray: string[] = [];
  itemText = 'Item with a long name';
  overlayRef: OverlayRef | null;
  
  constructor(
      readonly factory: CoverPositionStrategyFactory,
      readonly overlay: Overlay,
      readonly viewContainerRef: ViewContainerRef) { }

  openWithConfig() {
    const positionStrategy = this.factory.createWithConnections({
      top: this.top.connected ? this.topOrigin : undefined,
      right: this.right.connected ? this.rightOrigin : undefined,
      bottom: this.bottom.connected ? this.bottomOrigin : undefined,
      left: this.left.connected ? this.leftOrigin : undefined,
    })
        .withFlexibleDimensions(this.isFlexible)
        .withPush(this.canPush)
        .withViewportMargin(10)
        .withGrowAfterOpen(true);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      minWidth: 200,
      minHeight: 50
    });

    this.itemArray = Array(this.itemCount);
    this.overlayRef.attach(new TemplatePortal(this.overlayTemplate, this.viewContainerRef));
  }

  close() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
      this.showBoundingBox = false;
    }
  }
  
  toggleShowBoundingBox() {
    const box = document.querySelector<HTMLElement>('.cdk-overlay-connected-position-bounding-box');

    if (box) {
      this.showBoundingBox = !this.showBoundingBox;
      box.style.background = this.showBoundingBox ? 'rgb(255, 69, 0, 0.2)' : '';
    }
  }
}
