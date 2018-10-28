/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  ChangeDetectionStrategy,
  Component,
  Host,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  ViewRef,
} from '@angular/core';
import {MatProgress} from './progress-directive';
import {Subscription} from 'rxjs';

@Component({
  moduleId: module.id,
  selector: 'mat-progress-container',
  templateUrl: 'progress-container.html',
  styleUrls: ['progress-container.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatProgressContainer implements OnInit, OnDestroy {
  @ViewChild(TemplateRef)
  private _templateRef: TemplateRef<any>;
  private _openSubscription: Subscription;
  private _containerViewRef: ViewRef | null = null;

  constructor(@Host() private _progressDirective: MatProgress,
              private _viewContainerRef: ViewContainerRef) {
    if (!_progressDirective) {
      throw new Error(`Cannot instantiate MatProgressContainer without an ancestor
       MatProgress directive`);
    }
    this._toggleProgress = this._toggleProgress.bind(this);
  }

  ngOnInit() {
    this._openSubscription = this._progressDirective.show.subscribe(this._toggleProgress);
  }

  ngOnDestroy() {
    this._openSubscription.unsubscribe();
  }

  private _toggleProgress(evt: boolean) {
    if (evt && !this._containerViewRef) {
      this._containerViewRef = this._viewContainerRef.createEmbeddedView(this._templateRef);
    } else if (!evt && this._containerViewRef) {
      this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._containerViewRef));
      this._containerViewRef = null;
    }
  }
}
