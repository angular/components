/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Injectable,
  Inject,
  NgZone,
  ElementRef,
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ApplicationRef,
  inject,
  createComponent,
  EnvironmentInjector,
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {DragRef, DragRefConfig} from './drag-ref';
import {DropListRef} from './drop-list-ref';
import {DragDropRegistry} from './drag-drop-registry';

/** Default configuration to be used when creating a `DragRef`. */
const DEFAULT_CONFIG = {
  dragStartThreshold: 5,
  pointerDirectionChangeThreshold: 5,
};

/** Keeps track of the apps currently containing badges. */
const activeApps = new Set<ApplicationRef>();

/**
 * Component used to load the drag&drop reset styles.
 * @docs-private
 */
@Component({
  standalone: true,
  styleUrl: 'resets.css',
  encapsulation: ViewEncapsulation.None,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'cdk-drag-resets-container': ''},
})
export class _ResetsLoader {}

/**
 * Service that allows for drag-and-drop functionality to be attached to DOM elements.
 */
@Injectable({providedIn: 'root'})
export class DragDrop {
  private _appRef = inject(ApplicationRef);
  private _environmentInjector = inject(EnvironmentInjector);

  constructor(
    @Inject(DOCUMENT) private _document: any,
    private _ngZone: NgZone,
    private _viewportRuler: ViewportRuler,
    private _dragDropRegistry: DragDropRegistry<DragRef, DropListRef>,
  ) {}

  /**
   * Turns an element into a draggable item.
   * @param element Element to which to attach the dragging functionality.
   * @param config Object used to configure the dragging behavior.
   */
  createDrag<T = any>(
    element: ElementRef<HTMLElement> | HTMLElement,
    config: DragRefConfig = DEFAULT_CONFIG,
  ): DragRef<T> {
    this._loadResets();
    return new DragRef<T>(
      element,
      config,
      this._document,
      this._ngZone,
      this._viewportRuler,
      this._dragDropRegistry,
    );
  }

  /**
   * Turns an element into a drop list.
   * @param element Element to which to attach the drop list functionality.
   */
  createDropList<T = any>(element: ElementRef<HTMLElement> | HTMLElement): DropListRef<T> {
    return new DropListRef<T>(
      element,
      this._dragDropRegistry,
      this._document,
      this._ngZone,
      this._viewportRuler,
    );
  }

  // TODO(crisbeto): abstract this away into something reusable.
  /** Loads the CSS resets needed for the module to work correctly. */
  private _loadResets() {
    if (!activeApps.has(this._appRef)) {
      activeApps.add(this._appRef);

      const componentRef = createComponent(_ResetsLoader, {
        environmentInjector: this._environmentInjector,
      });

      this._appRef.onDestroy(() => {
        activeApps.delete(this._appRef);
        if (activeApps.size === 0) {
          componentRef.destroy();
        }
      });
    }
  }
}
