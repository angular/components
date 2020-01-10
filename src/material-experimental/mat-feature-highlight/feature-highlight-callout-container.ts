/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BasePortalOutlet, CdkPortalOutlet, ComponentPortal, TemplatePortal} from '@angular/cdk/portal';
import {Component, ComponentRef, EmbeddedViewRef, OnDestroy, ViewChild} from '@angular/core';

/** Container for the callout component of feature highlight. */
@Component({
  selector: 'feature-highlight-callout-container',
  templateUrl: './feature-highlight-callout-container.ng.html',
})
export class FeatureHighlightCalloutContainer extends BasePortalOutlet
    implements OnDestroy {
  @ViewChild(CdkPortalOutlet, {static: true}) portalOutlet!: CdkPortalOutlet;

  attachTemplatePortal<T>(portal: TemplatePortal<T>): EmbeddedViewRef<T> {
    this._assertNotAttached();
    return this.portalOutlet.attachTemplatePortal(portal);
  }

  attachComponentPortal<C>(portal: ComponentPortal<C>): ComponentRef<C> {
    this._assertNotAttached();
    return this.portalOutlet.attachComponentPortal(portal);
  }

  private _assertNotAttached() {
    if (this.portalOutlet.hasAttached()) {
      throw new Error(
          'Cannot attach feature highlight callout. There is already a ' +
          'callout attached.');
    }
  }

  /** @override */
  ngOnDestroy() {
    super.dispose();
  }
}
