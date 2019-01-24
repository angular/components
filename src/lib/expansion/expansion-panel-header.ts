/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusMonitor, FocusableOption, FocusOrigin} from '@angular/cdk/a11y';
import {ENTER, SPACE, hasModifierKey} from '@angular/cdk/keycodes';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Directive,
  ElementRef,
  Host,
  Input,
  OnDestroy,
  ViewEncapsulation,
  Optional,
  Inject,
} from '@angular/core';
import {merge, Subscription, EMPTY} from 'rxjs';
import {filter} from 'rxjs/operators';
import {matExpansionAnimations} from './expansion-animations';
import {
  MatExpansionPanel,
  MatExpansionPanelDefaultOptions,
  MatExpansionPanelHeaderRole,
  MAT_EXPANSION_PANEL_DEFAULT_OPTIONS,
} from './expansion-panel';


/**
 * `<mat-expansion-panel-header>`
 *
 * This component corresponds to the header element of an `<mat-expansion-panel>`.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-expansion-panel-header',
  styleUrls: ['./expansion-panel-header.css'],
  templateUrl: './expansion-panel-header.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    matExpansionAnimations.indicatorRotate,
    matExpansionAnimations.expansionHeaderHeight
  ],
  host: {
    'class': 'mat-expansion-panel-header',
    '[attr.role]': 'headerRole',
    '[attr.id]': 'panel._headerId',
    '[attr.tabindex]': '_getHeaderTabIndex()',
    '[attr.aria-controls]': '_getHeaderAriaControls()',
    '[attr.aria-expanded]': '_getHeaderAriaExpanded()',
    '[attr.aria-disabled]': 'panel.disabled',
    '[class.mat-expanded]': '_isExpanded()',
    '(click)': '_toggle()',
    '(keydown)': '_keydownHeader($event)',
    '[@expansionHeight]': `{
        value: _getExpandedState(),
        params: {
          collapsedHeight: collapsedHeight,
          expandedHeight: expandedHeight
        }
    }`,
  },
})
export class MatExpansionPanelHeader implements OnDestroy, FocusableOption {
  private _parentChangeSubscription = Subscription.EMPTY;

  constructor(
      @Host() public panel: MatExpansionPanel,
      private _element: ElementRef,
      private _focusMonitor: FocusMonitor,
      private _changeDetectorRef: ChangeDetectorRef,
      @Inject(MAT_EXPANSION_PANEL_DEFAULT_OPTIONS) @Optional()
          defaultOptions?: MatExpansionPanelDefaultOptions) {

    const accordionHideToggleChange = panel.accordion ?
      panel.accordion._stateChanges.pipe(filter(changes => !!changes.hideToggle)) : EMPTY;

    // Since the toggle state depends on an @Input on the panel, we
    // need to subscribe and trigger change detection manually.
    this._parentChangeSubscription = merge(
      panel.opened,
      panel.closed,
      accordionHideToggleChange,
      panel._inputChanges.pipe(filter(changes => !!(changes.hideToggle || changes.disabled)))
    )
    .subscribe(() => this._changeDetectorRef.markForCheck());

    // Avoids focus being lost if the panel contained the focused element and was closed.
    panel.closed
      .pipe(filter(() => panel._containsFocus()))
      .subscribe(() => _focusMonitor.focusVia(_element, 'program'));

    _focusMonitor.monitor(_element).subscribe(origin => {
      if (origin && panel.accordion) {
        panel.accordion._handleHeaderFocus(this);
      }
    });

    if (defaultOptions) {
      this.expandedHeight = defaultOptions.expandedHeight;
      this.collapsedHeight = defaultOptions.collapsedHeight;

      if (defaultOptions.headerRole) {
        this.headerRole = defaultOptions.headerRole;
      }

      if (defaultOptions.toggleAriaLabel) {
        this.toggleAriaLabel = defaultOptions.toggleAriaLabel;
      }

      if (defaultOptions.toggleAriaLabelledBy) {
        this.toggleAriaLabelledBy = defaultOptions.toggleAriaLabelledBy;
      }
    }
  }

  /** Height of the header while the panel is expanded. */
  @Input() expandedHeight: string;

  /** Height of the header while the panel is collapsed. */
  @Input() collapsedHeight: string;

  /**
   * Role for the header. By default, the role is "button". If the header is not considered
   * to be a button, e.g. when the header contains nested buttons, the role should not be
   * set to "button". Notice that in this case the toggle button will have a role of "button".
   */
  @Input() headerRole: MatExpansionPanelHeaderRole = 'button';

  /**
   * Aria label for the toggle button. By default, there is no aria-label associated with
   * the toggle button. If the header has a role other than button, and the toggle button
   * is displayed, aria-label or aria-labelled-by should be set for the toggle button.
   */
  @Input() toggleAriaLabel: string | null = null;

  /**
   * Aria labelledBy attribute for the toggle button. By default, there is no aria-labelledby
   * associated with the toggle button. If the header has a role other than button, and the
   * toggle button is displayed, aria-label or aria-labelled-by should be set for the toggle
   * button.
   */
  @Input() toggleAriaLabelledBy: string | null = null;

  /**
   * Whether the associated panel is disabled. Implemented as a part of `FocusableOption`.
   * @docs-private
   */
  get disabled() {
    return this.panel.disabled;
  }

  /** Toggles the expanded state of the panel. */
  _toggle(): void {
    this.panel.toggle();
  }

  /** Gets whether the panel is expanded. */
  _isExpanded(): boolean {
    return this.panel.expanded;
  }

  /** Gets whether the role of the header is a button. */
  _isHeaderButtonRole(): boolean {
    return this.headerRole === 'button';
  }

  /**
   * Gets whether the role of the toggle indicator is a button. The toggle indicator is a button
   * if and only if the header is not a button.
   */
  _isToggleButtonRole(): boolean {
    return !this._isHeaderButtonRole();
  }

  /** Gets the role for the toggle button. */
  _getToggleRole(): 'button' | null {
    return this._isToggleButtonRole() ? 'button' : null;
  }

  /** Gets aria-expanded value for the header. */
  _getHeaderAriaExpanded(): boolean | null {
    return this._isHeaderButtonRole() ? this._isExpanded() : null;
  }

  /** Gets aria-expanded value for the toggle button. */
  _getToggleAriaExpanded(): boolean | null {
    return this._isToggleButtonRole() ? this._isExpanded() : null;
  }

  /** Gets aria-controls value for the header. */
  _getHeaderAriaControls(): string | null {
    return this._isHeaderButtonRole() ? this.panel.id : null;
  }

  /** Gets aria-controls value for the toggle button. */
  _getToggleAriaControls(): string | null {
    return this._isToggleButtonRole() ? this.panel.id : null;
  }

  /** Gets tab index for the header. */
  _getHeaderTabIndex(): number {
    return this._isHeaderButtonRole() && !this.disabled ? 0 : -1;
  }

  /** Gets tab index for the toggle button. */
  _getToggleTabIndex(): number {
    return this._isToggleButtonRole() && !this.disabled ? 0 : -1;
  }

  /** Gets the expanded state string of the panel. */
  _getExpandedState(): string {
    return this.panel._getExpandedState();
  }

  /** Gets whether the expand indicator should be shown. */
  _showToggle(): boolean {
    return !this.panel.hideToggle && !this.panel.disabled;
  }

  /** Handle keydown event on the header. Ignore the event if the header is not a button. */
  _keydownHeader(event: KeyboardEvent) {
    if (this._isHeaderButtonRole()) {
      this._keydown(event);
    }
  }

  /** Handle keydown event calling to toggle() if appropriate. */
  _keydown(event: KeyboardEvent) {
    switch (event.keyCode) {
      // Toggle for space and enter keys.
      case SPACE:
      case ENTER:
        if (!hasModifierKey(event)) {
          event.preventDefault();
          this._toggle();
        }

        break;
      default:
        if (this.panel.accordion) {
          this.panel.accordion._handleHeaderKeydown(event);
        }

        return;
    }
  }

  /**
   * Focuses the panel header. Implemented as a part of `FocusableOption`.
   * @param origin Origin of the action that triggered the focus.
   * @docs-private
   */
  focus(origin: FocusOrigin = 'program') {
    this._focusMonitor.focusVia(this._element, origin);
  }

  ngOnDestroy() {
    this._parentChangeSubscription.unsubscribe();
    this._focusMonitor.stopMonitoring(this._element);
  }
}

/**
 * `<mat-panel-description>`
 *
 * This directive is to be used inside of the MatExpansionPanelHeader component.
 */
@Directive({
  selector: 'mat-panel-description',
  host: {
    class: 'mat-expansion-panel-header-description'
  }
})
export class MatExpansionPanelDescription {}

/**
 * `<mat-panel-title>`
 *
 * This directive is to be used inside of the MatExpansionPanelHeader component.
 */
@Directive({
  selector: 'mat-panel-title',
  host: {
    class: 'mat-expansion-panel-header-title'
  }
})
export class MatExpansionPanelTitle {}
