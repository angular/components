/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  AfterContentInit,
  AfterViewInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  forwardRef,
  Input,
  numberAttribute,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewEncapsulation,
  inject,
  HostAttributeToken,
  signal,
  computed,
} from '@angular/core';
import {
  MAT_RIPPLE_GLOBAL_OPTIONS,
  MatRipple,
  RippleConfig,
  RippleGlobalOptions,
  RippleTarget,
  ThemePalette,
  _StructuralStylesLoader,
  _animationsDisabled,
} from '../../core';
import {_IdGenerator, FocusableOption, FocusMonitor} from '@angular/cdk/a11y';
import {MatInkBar, InkBarItem} from '../ink-bar';
import {BehaviorSubject, Subject} from 'rxjs';
import {startWith, takeUntil} from 'rxjs/operators';
import {ENTER, SPACE} from '@angular/cdk/keycodes';
import {MAT_TABS_CONFIG, MatTabsConfig} from '../tab-config';
import {MatPaginatedTabHeader, MatPaginatedTabHeaderItem} from '../paginated-tab-header';
import {CdkObserveContent} from '@angular/cdk/observers';
import {_CdkPrivateStyleLoader} from '@angular/cdk/private';

/**
 * Navigation component matching the styles of the tab group header.
 * Provides anchored navigation with animated ink bar.
 */
@Component({
  selector: '[mat-tab-nav-bar]',
  exportAs: 'matTabNavBar, matTabNav',
  templateUrl: 'tab-nav-bar.html',
  styleUrl: 'tab-nav-bar.css',
  host: {
    '[attr.role]': '_getRole()',
    'class': 'mat-mdc-tab-nav-bar mat-mdc-tab-header',
    '[class.mat-mdc-tab-header-pagination-controls-enabled]': '_showPaginationControls',
    '[class.mat-mdc-tab-header-rtl]': "_getLayoutDirection() == 'rtl'",
    '[class.mat-mdc-tab-nav-bar-stretch-tabs]': 'stretchTabs',
    '[class.mat-primary]': 'color !== "warn" && color !== "accent"',
    '[class.mat-accent]': 'color === "accent"',
    '[class.mat-warn]': 'color === "warn"',
    '[class._mat-animation-noopable]': '_animationsDisabled',
    '[style.--mat-tab-animation-duration]': 'animationDuration',
  },
  encapsulation: ViewEncapsulation.None,
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [MatRipple, CdkObserveContent],
})
export class MatTabNav extends MatPaginatedTabHeader implements AfterContentInit, AfterViewInit {
  _focusedItem = signal<MatPaginatedTabHeaderItem | null>(null);

  /** Whether the ink bar should fit its width to the size of the tab label content. */
  @Input({transform: booleanAttribute})
  get fitInkBarToContent(): boolean {
    return this._fitInkBarToContent.value;
  }
  set fitInkBarToContent(value: boolean) {
    this._fitInkBarToContent.next(value);
    this._changeDetectorRef.markForCheck();
  }
  _fitInkBarToContent = new BehaviorSubject(false);

  /** Whether tabs should be stretched to fill the header. */
  @Input({alias: 'mat-stretch-tabs', transform: booleanAttribute})
  stretchTabs: boolean = true;

  @Input()
  get animationDuration(): string {
    return this._animationDuration;
  }

  set animationDuration(value: string | number) {
    const stringValue = value + '';
    this._animationDuration = /^\d+$/.test(stringValue) ? value + 'ms' : stringValue;
  }

  private _animationDuration: string;

  /** Query list of all tab links of the tab navigation. */
  @ContentChildren(forwardRef(() => MatTabLink), {descendants: true}) _items: QueryList<MatTabLink>;

  /**
   * Theme color of the background of the tab nav. This API is supported in M2 themes only, it
   * has no effect in M3 themes. For color customization in M3, see https://material.angular.dev/components/tabs/styling.
   *
   * For information on applying color variants in M3, see
   * https://material.angular.dev/guide/material-2-theming#optional-add-backwards-compatibility-styles-for-color-variants
   */
  @Input()
  get backgroundColor(): ThemePalette {
    return this._backgroundColor;
  }

  set backgroundColor(value: ThemePalette) {
    const classList = this._elementRef.nativeElement.classList;
    classList.remove('mat-tabs-with-background', `mat-background-${this.backgroundColor}`);

    if (value) {
      classList.add('mat-tabs-with-background', `mat-background-${value}`);
    }

    this._backgroundColor = value;
  }

  private _backgroundColor: ThemePalette;

  /** Whether the ripple effect is disabled or not. */
  @Input({transform: booleanAttribute})
  get disableRipple() {
    return this._disableRipple();
  }
  set disableRipple(value: boolean) {
    this._disableRipple.set(value);
  }
  private _disableRipple = signal(false);

  /**
   * Theme color of the nav bar. This API is supported in M2 themes only, it has
   * no effect in M3 themes. For color customization in M3, see https://material.angular.dev/components/tabs/styling.
   *
   * For information on applying color variants in M3, see
   * https://material.angular.dev/guide/material-2-theming#optional-add-backwards-compatibility-styles-for-color-variants
   */
  @Input() color: ThemePalette = 'primary';

  /**
   * Associated tab panel controlled by the nav bar. If not provided, then the nav bar
   * follows the ARIA link / navigation landmark pattern. If provided, it follows the
   * ARIA tabs design pattern.
   */
  @Input() tabPanel?: MatTabNavPanel;

  @ViewChild('tabListContainer', {static: true}) _tabListContainer: ElementRef;
  @ViewChild('tabList', {static: true}) _tabList: ElementRef;
  @ViewChild('tabListInner', {static: true}) _tabListInner: ElementRef;
  @ViewChild('nextPaginator') _nextPaginator: ElementRef<HTMLElement>;
  @ViewChild('previousPaginator') _previousPaginator: ElementRef<HTMLElement>;
  _inkBar: MatInkBar;

  constructor(...args: unknown[]);

  constructor() {
    const defaultConfig = inject<MatTabsConfig>(MAT_TABS_CONFIG, {optional: true});

    super();
    this.disablePagination =
      defaultConfig && defaultConfig.disablePagination != null
        ? defaultConfig.disablePagination
        : false;
    this.fitInkBarToContent =
      defaultConfig && defaultConfig.fitInkBarToContent != null
        ? defaultConfig.fitInkBarToContent
        : false;
    this.stretchTabs =
      defaultConfig && defaultConfig.stretchTabs != null ? defaultConfig.stretchTabs : true;
  }

  protected _itemSelected() {
    // noop
  }

  override ngAfterContentInit() {
    this._inkBar = new MatInkBar(this._items);
    // We need this to run before the `changes` subscription in parent to ensure that the
    // selectedIndex is up-to-date by the time the super class starts looking for it.
    this._items.changes
      .pipe(startWith(null), takeUntil(this._destroyed))
      .subscribe(() => this.updateActiveLink());

    super.ngAfterContentInit();

    // Turn the `change` stream into a signal to try and avoid "changed after checked" errors.
    this._keyManager!.change.pipe(startWith(null), takeUntil(this._destroyed)).subscribe(() =>
      this._focusedItem.set(this._keyManager?.activeItem || null),
    );
  }

  override ngAfterViewInit() {
    if (!this.tabPanel && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw new Error('A mat-tab-nav-panel must be specified via [tabPanel].');
    }
    super.ngAfterViewInit();
  }

  /** Notifies the component that the active link has been changed. */
  updateActiveLink() {
    if (!this._items) {
      return;
    }

    const items = this._items.toArray();

    for (let i = 0; i < items.length; i++) {
      if (items[i].active) {
        this.selectedIndex = i;
        if (this.tabPanel) {
          this.tabPanel._activeTabId = items[i].id;
        }
        // Updating the `selectedIndex` won't trigger the `change` event on
        // the key manager so we need to set the signal from here.
        this._focusedItem.set(items[i]);
        this._changeDetectorRef.markForCheck();
        return;
      }
    }

    this.selectedIndex = -1;
  }

  _getRole(): string | null {
    return this.tabPanel ? 'tablist' : this._elementRef.nativeElement.getAttribute('role');
  }

  _hasFocus(link: MatTabLink): boolean {
    return this._keyManager?.activeItem === link;
  }
}

/**
 * Link inside a `mat-tab-nav-bar`.
 */
@Component({
  selector: '[mat-tab-link], [matTabLink]',
  exportAs: 'matTabLink',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'tab-link.html',
  styleUrl: 'tab-link.css',
  host: {
    'class': 'mdc-tab mat-mdc-tab-link mat-focus-indicator',
    '[attr.aria-controls]': '_getAriaControls()',
    '[attr.aria-current]': '_getAriaCurrent()',
    '[attr.aria-disabled]': 'disabled',
    '[attr.aria-selected]': '_getAriaSelected()',
    '[attr.id]': 'id',
    '[attr.tabIndex]': '_tabIndex()',
    '[attr.role]': '_getRole()',
    '[class.mat-mdc-tab-disabled]': 'disabled',
    '[class.mdc-tab--active]': 'active',
    '(focus)': '_handleFocus()',
    '(keydown)': '_handleKeydown($event)',
  },
  imports: [MatRipple],
})
export class MatTabLink
  extends InkBarItem
  implements AfterViewInit, OnDestroy, RippleTarget, FocusableOption
{
  private _tabNavBar = inject(MatTabNav);
  elementRef = inject(ElementRef);
  private _focusMonitor = inject(FocusMonitor);

  private readonly _destroyed = new Subject<void>();

  /** Whether the tab link is active or not. */
  protected _isActive: boolean = false;

  protected _tabIndex = computed(() =>
    this._tabNavBar._focusedItem() === this ? this.tabIndex : -1,
  );

  /** Whether the link is active. */
  @Input({transform: booleanAttribute})
  get active(): boolean {
    return this._isActive;
  }

  set active(value: boolean) {
    if (value !== this._isActive) {
      this._isActive = value;
      this._tabNavBar.updateActiveLink();
    }
  }

  /** Whether the tab link is disabled. */
  @Input({transform: booleanAttribute})
  disabled: boolean = false;

  /** Whether ripples are disabled on the tab link. */
  @Input({transform: booleanAttribute})
  get disableRipple() {
    return this._disableRipple();
  }
  set disableRipple(value: boolean) {
    this._disableRipple.set(value);
  }
  private _disableRipple = signal(false);

  @Input({
    transform: (value: unknown) => (value == null ? 0 : numberAttribute(value)),
  })
  tabIndex: number = 0;

  /**
   * Ripple configuration for ripples that are launched on pointer down. The ripple config
   * is set to the global ripple options since we don't have any configurable options for
   * the tab link ripples.
   * @docs-private
   */
  rippleConfig: RippleConfig & RippleGlobalOptions;

  /**
   * Whether ripples are disabled on interaction.
   * @docs-private
   */
  get rippleDisabled(): boolean {
    return (
      this.disabled ||
      this.disableRipple ||
      this._tabNavBar.disableRipple ||
      !!this.rippleConfig.disabled
    );
  }

  /** Unique id for the tab. */
  @Input() id: string = inject(_IdGenerator).getId('mat-tab-link-');

  constructor(...args: unknown[]);

  constructor() {
    super();

    inject(_CdkPrivateStyleLoader).load(_StructuralStylesLoader);
    const globalRippleOptions = inject<RippleGlobalOptions | null>(MAT_RIPPLE_GLOBAL_OPTIONS, {
      optional: true,
    });
    const tabIndex = inject(new HostAttributeToken('tabindex'), {optional: true});
    this.rippleConfig = globalRippleOptions || {};
    this.tabIndex = tabIndex == null ? 0 : parseInt(tabIndex) || 0;

    if (_animationsDisabled()) {
      this.rippleConfig.animation = {enterDuration: 0, exitDuration: 0};
    }

    this._tabNavBar._fitInkBarToContent
      .pipe(takeUntil(this._destroyed))
      .subscribe(fitInkBarToContent => {
        this.fitInkBarToContent = fitInkBarToContent;
      });
  }

  /** Focuses the tab link. */
  focus() {
    this.elementRef.nativeElement.focus();
  }

  ngAfterViewInit() {
    this._focusMonitor.monitor(this.elementRef);
  }

  override ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
    super.ngOnDestroy();
    this._focusMonitor.stopMonitoring(this.elementRef);
  }

  _handleFocus() {
    // Since we allow navigation through tabbing in the nav bar, we
    // have to update the focused index whenever the link receives focus.
    this._tabNavBar.focusIndex = this._tabNavBar._items.toArray().indexOf(this);
  }

  _handleKeydown(event: KeyboardEvent) {
    if (event.keyCode === SPACE || event.keyCode === ENTER) {
      if (this.disabled) {
        event.preventDefault();
      } else if (this._tabNavBar.tabPanel) {
        // Only prevent the default action on space since it can scroll the page.
        // Don't prevent enter since it can break link navigation.
        if (event.keyCode === SPACE) {
          event.preventDefault();
        }

        this.elementRef.nativeElement.click();
      }
    }
  }

  _getAriaControls(): string | null {
    return this._tabNavBar.tabPanel
      ? this._tabNavBar.tabPanel?.id
      : this.elementRef.nativeElement.getAttribute('aria-controls');
  }

  _getAriaSelected(): string | null {
    if (this._tabNavBar.tabPanel) {
      return this.active ? 'true' : 'false';
    } else {
      return this.elementRef.nativeElement.getAttribute('aria-selected');
    }
  }

  _getAriaCurrent(): string | null {
    return this.active && !this._tabNavBar.tabPanel ? 'page' : null;
  }

  _getRole(): string | null {
    return this._tabNavBar.tabPanel ? 'tab' : this.elementRef.nativeElement.getAttribute('role');
  }
}

/**
 * Tab panel component associated with MatTabNav.
 */
@Component({
  selector: 'mat-tab-nav-panel',
  exportAs: 'matTabNavPanel',
  template: '<ng-content></ng-content>',
  host: {
    '[attr.aria-labelledby]': '_activeTabId',
    '[attr.id]': 'id',
    'class': 'mat-mdc-tab-nav-panel',
    'role': 'tabpanel',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatTabNavPanel {
  /** Unique id for the tab panel. */
  @Input() id: string = inject(_IdGenerator).getId('mat-tab-nav-panel-');

  /** Id of the active tab in the nav bar. */
  _activeTabId?: string;
}
