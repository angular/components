/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  InjectionToken,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  QueryList,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  inject,
} from '@angular/core';
import {MatTabContent} from './tab-content';
import {MAT_TAB, MatTabLabel} from './tab-label';
import {TemplatePortal} from '@angular/cdk/portal';
import {Subject} from 'rxjs';
import {distinctUntilChanged, map, startWith} from 'rxjs/operators';
import {_CdkPrivateStyleLoader} from '@angular/cdk/private';
import {_StructuralStylesLoader} from '../core';

/**
 * Used to provide a tab group to a tab without causing a circular dependency.
 * @docs-private
 */
export const MAT_TAB_GROUP = new InjectionToken<any>('MAT_TAB_GROUP');

@Component({
  selector: 'mat-tab',
  // Note that usually we'd go through a bit more trouble and set up another class so that
  // the inlined template of `MatTab` isn't duplicated, however the template is small enough
  // that creating the extra class will generate more code than just duplicating the template.
  templateUrl: 'tab.html',
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'matTab',
  providers: [{provide: MAT_TAB, useExisting: MatTab}],
  host: {
    // This element will be rendered on the server in order to support hydration.
    // Hide it so it doesn't cause a layout shift when it's removed on the client.
    'hidden': '',

    // Clear any custom IDs from the tab since they'll be forwarded to the actual tab.
    '[attr.id]': 'null',
  },
})
export class MatTab implements OnInit, OnChanges, OnDestroy, AfterContentInit {
  private _viewContainerRef = inject(ViewContainerRef);
  _closestTabGroup = inject(MAT_TAB_GROUP, {optional: true});

  /** whether the tab is disabled. */
  @Input({transform: booleanAttribute})
  disabled: boolean = false;

  /** Content for the tab label given by `<ng-template mat-tab-label>`. */
  get templateLabel(): MatTabLabel {
    return this._templateLabel;
  }
  set templateLabel(value: MatTabLabel) {
    if (value && value._closestTab === this) {
      this._templateLabel = value;
    }
  }
  private _templateLabel!: MatTabLabel;

  @ContentChildren(MatTabLabel, {descendants: true})
  private _templateLabels!: QueryList<MatTabLabel>;

  /**
   * Template provided in the tab content that will be used if present, used to enable lazy-loading
   */
  @ContentChild(MatTabContent, {read: TemplateRef, static: true})
  // We need an initializer here to avoid a TS error. The value will be set in `ngAfterViewInit`.
  private _explicitContent: TemplateRef<any> = undefined!;

  /** Template inside the MatTab view that contains an `<ng-content>`. */
  @ViewChild(TemplateRef, {static: true}) _implicitContent!: TemplateRef<any>;

  /** Plain text label for the tab, used when there is no template label. */
  @Input('label') textLabel: string = '';

  /** Aria label for the tab. */
  @Input('aria-label') ariaLabel!: string;

  /**
   * Reference to the element that the tab is labelled by.
   * Will be cleared if `aria-label` is set at the same time.
   */
  @Input('aria-labelledby') ariaLabelledby!: string;

  /** Classes to be passed to the tab label inside the mat-tab-header container. */
  @Input() labelClass!: string | string[];

  /** Classes to be passed to the tab mat-tab-body container. */
  @Input() bodyClass!: string | string[];

  /**
   * Custom ID for the tab, overriding the auto-generated one by Material.
   * Note that when using this input, it's your responsibility to ensure that the ID is unique.
   */
  @Input() id: string | null = null;

  /** Portal that will be the hosted content of the tab */
  private _contentPortal: TemplatePortal | null = null;

  /** @docs-private */
  get content(): TemplatePortal | null {
    return this._contentPortal;
  }

  /** Emits whenever the internal state of the tab changes. */
  readonly _stateChanges = new Subject<void>();

  /**
   * The relatively indexed position where 0 represents the center, negative is left, and positive
   * represents the right.
   */
  position: number | null = null;

  // TODO(crisbeto): we no longer use this, but some internal apps appear to rely on it.
  /**
   * The initial relatively index origin of the tab if it was created and selected after there
   * was already a selected tab. Provides context of what position the tab should originate from.
   */
  origin: number | null = null;

  /**
   * Whether the tab is currently active.
   */
  isActive = false;

  constructor() {
    inject(_CdkPrivateStyleLoader).load(_StructuralStylesLoader);
  }

  ngOnChanges(changes: SimpleChanges<this>): void {
    if (Object.hasOwn(changes, 'textLabel') || Object.hasOwn(changes, 'disabled')) {
      this._stateChanges.next();
    }
  }

  ngOnDestroy(): void {
    this._stateChanges.complete();
  }

  ngOnInit(): void {
    this._contentPortal = new TemplatePortal(
      this._explicitContent || this._implicitContent,
      this._viewContainerRef,
    );
  }

  ngAfterContentInit(): void {
    const labels = this._templateLabels;

    // A nested tab's label can appear before this tab's own label in the content query.
    labels.changes
      .pipe(
        startWith(labels),
        map(() => labels.find(label => label._closestTab === this)),
        distinctUntilChanged(),
      )
      .subscribe(label => {
        // Keep a manually assigned template label when the query doesn't find one.
        if (label) {
          this.templateLabel = label;
        }
      });
  }
}
