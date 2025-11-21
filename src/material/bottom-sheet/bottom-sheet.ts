/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Dialog} from '@angular/cdk/dialog';
import {createBlockScrollStrategy, createGlobalPositionStrategy} from '@angular/cdk/overlay';
import {ComponentType} from '@angular/cdk/portal';
import {Injectable, TemplateRef, InjectionToken, OnDestroy, inject, Injector} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetConfig} from './bottom-sheet-config';
import {MatBottomSheetContainer} from './bottom-sheet-container';
import {MatBottomSheetRef} from './bottom-sheet-ref';
import {_animationsDisabled} from '../core';

/** Injection token that can be used to specify default bottom sheet options. */
export const MAT_BOTTOM_SHEET_DEFAULT_OPTIONS = new InjectionToken<MatBottomSheetConfig>(
  'mat-bottom-sheet-default-options',
);

/**
 * Service to trigger Material Design bottom sheets.
 */
@Injectable({providedIn: 'root'})
export class MatBottomSheet implements OnDestroy {
  private _injector = inject(Injector);
  private _parentBottomSheet = inject(MatBottomSheet, {optional: true, skipSelf: true});
  private _animationsDisabled = _animationsDisabled();
  private _defaultOptions = inject<MatBottomSheetConfig>(MAT_BOTTOM_SHEET_DEFAULT_OPTIONS, {
    optional: true,
  });

  private _bottomSheetRefAtThisLevel: MatBottomSheetRef<any> | null = null;
  private _dialog = inject(Dialog);

  /** Reference to the currently opened bottom sheet. */
  get _openedBottomSheetRef(): MatBottomSheetRef<any> | null {
    const parent = this._parentBottomSheet;
    return parent ? parent._openedBottomSheetRef : this._bottomSheetRefAtThisLevel;
  }

  set _openedBottomSheetRef(value: MatBottomSheetRef<any> | null) {
    if (this._parentBottomSheet) {
      this._parentBottomSheet._openedBottomSheetRef = value;
    } else {
      this._bottomSheetRefAtThisLevel = value;
    }
  }

  constructor(...args: unknown[]);
  constructor() {}

  /**
   * Opens a bottom sheet containing the given component.
   * @param component Type of the component to load into the bottom sheet.
   * @param config Extra configuration options.
   * @returns Reference to the newly-opened bottom sheet.
   */
  open<T, D = any, R = any>(
    component: ComponentType<T>,
    config?: MatBottomSheetConfig<D>,
  ): MatBottomSheetRef<T, R>;

  /**
   * Opens a bottom sheet containing the given template.
   * @param template TemplateRef to instantiate as the bottom sheet content.
   * @param config Extra configuration options.
   * @returns Reference to the newly-opened bottom sheet.
   */
  open<T, D = any, R = any>(
    template: TemplateRef<T>,
    config?: MatBottomSheetConfig<D>,
  ): MatBottomSheetRef<T, R>;

  open<T, D = any, R = any>(
    componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    config?: MatBottomSheetConfig<D>,
  ): MatBottomSheetRef<T, R> {
    const _config = {...(this._defaultOptions || new MatBottomSheetConfig()), ...config};
    let ref: MatBottomSheetRef<T, R>;

    this._dialog.open<R, D, T>(componentOrTemplateRef, {
      ..._config,
      // Disable closing since we need to sync it up to the animation ourselves.
      disableClose: true,
      // Disable closing on detachments so that we can sync up the animation.
      closeOnOverlayDetachments: false,
      maxWidth: '100%',
      container: MatBottomSheetContainer,
      scrollStrategy: _config.scrollStrategy || createBlockScrollStrategy(this._injector),
      positionStrategy: createGlobalPositionStrategy(this._injector)
        .centerHorizontally()
        .bottom('0'),
      disableAnimations: this._animationsDisabled,
      templateContext: () => ({bottomSheetRef: ref}),
      providers: (cdkRef, _cdkConfig, container) => {
        ref = new MatBottomSheetRef(cdkRef, _config, container as MatBottomSheetContainer);
        return [
          {provide: MatBottomSheetRef, useValue: ref},
          {provide: MAT_BOTTOM_SHEET_DATA, useValue: _config.data},
        ];
      },
    });

    // When the bottom sheet is dismissed, clear the reference to it.
    ref!.afterDismissed().subscribe(() => {
      // Clear the bottom sheet ref if it hasn't already been replaced by a newer one.
      if (this._openedBottomSheetRef === ref) {
        this._openedBottomSheetRef = null;
      }
    });

    if (this._openedBottomSheetRef) {
      // If a bottom sheet is already in view, dismiss it and enter the
      // new bottom sheet after exit animation is complete.
      this._openedBottomSheetRef.afterDismissed().subscribe(() => ref.containerInstance?.enter());
      this._openedBottomSheetRef.dismiss();
    } else {
      // If no bottom sheet is in view, enter the new bottom sheet.
      ref!.containerInstance.enter();
    }

    this._openedBottomSheetRef = ref!;
    return ref!;
  }

  /**
   * Dismisses the currently-visible bottom sheet.
   * @param result Data to pass to the bottom sheet instance.
   */
  dismiss<R = any>(result?: R): void {
    if (this._openedBottomSheetRef) {
      this._openedBottomSheetRef.dismiss(result);
    }
  }

  ngOnDestroy() {
    if (this._bottomSheetRefAtThisLevel) {
      this._bottomSheetRefAtThisLevel.dismiss();
    }
  }
}
