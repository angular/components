/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkPortal, ComponentPortal, DomPortal, Portal, PortalModule} from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';

@Component({
  selector: 'science-joke',
  template: `<p> 100 kilopascals go into a bar. </p>`,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScienceJoke {}

@Component({
  selector: 'portal-demo',
  templateUrl: 'portal-demo.html',
  styleUrl: 'portal-demo.css',
  standalone: true,
  imports: [PortalModule, ScienceJoke],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalDemo {
  @ViewChildren(CdkPortal) templatePortals: QueryList<Portal<any>>;
  @ViewChild('domPortalSource') domPortalSource: ElementRef<HTMLElement>;

  selectedPortal: Portal<any>;

  get programmingJoke() {
    return this.templatePortals.first;
  }

  get mathJoke() {
    return this.templatePortals.last;
  }

  get scienceJoke() {
    return new ComponentPortal(ScienceJoke);
  }

  get dadJoke() {
    return new DomPortal(this.domPortalSource);
  }
}
