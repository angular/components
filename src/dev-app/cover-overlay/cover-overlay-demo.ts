/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ElementRef, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {
  CoverPositionStrategyFactory,
  Overlay,
  OverlayRef,
} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';

export interface OriginConfig {
  x: number;
  y: number;
  connected?: boolean;
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

  readonly top: OriginConfig = {x: 300, y: 20, connected: true};
  readonly right: OriginConfig = {x: 500, y: 200, connected: true};
  readonly bottom: OriginConfig = {x: 300, y: 400};
  readonly left: OriginConfig = {x: 30, y: 200, connected: true};

  viewportMargin = 10;
  isFlexible = true;
  canPush = true;
  highlightBoundingBox = true;
  growAfterOpen = true;
  lockedPosition = false;
  itemCount = 25;
  itemArray: string[] = [];
  itemText = 'Item with a very very very very very very super duper extremely long name';
  overlayRef: OverlayRef | null;

  constructor(
      readonly factory: CoverPositionStrategyFactory,
      readonly overlay: Overlay,
      readonly viewContainerRef: ViewContainerRef) { }

  open() {
    const positionStrategy = this.factory
                                 .createWithConnections({
                                   top: this.top.connected ? this.topOrigin : undefined,
                                   right: this.right.connected ? this.rightOrigin : undefined,
                                   bottom: this.bottom.connected ? this.bottomOrigin : undefined,
                                   left: this.left.connected ? this.leftOrigin : undefined,
                                 })
                                 .withFlexibleDimensions(this.isFlexible)
                                 .withPush(this.canPush)
                                 .withViewportMargin(this.viewportMargin)
                                 .withGrowAfterOpen(this.growAfterOpen)
                                 .withLockedPosition(this.lockedPosition);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      minWidth: 200,
      minHeight: 200,
    });

    this.itemArray = Array(this.itemCount);
    this.overlayRef.attach(new TemplatePortal(this.overlayTemplate, this.viewContainerRef));

    setTimeout(() => {
      this.showBoundingBox();
    }, 0);
  }

  close() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  showBoundingBox() {
    if (this.highlightBoundingBox) {
      const box =
          document.querySelector<HTMLElement>('.cdk-overlay-connected-position-bounding-box');

      if (box) {
        box.style.background = this.highlightBoundingBox ? 'rgb(255, 69, 0, 0.2)' : '';
      }
    }
  }

  toggleShowBoundingBox() {
    this.highlightBoundingBox = !this.highlightBoundingBox;
    this.showBoundingBox();
  }
}
