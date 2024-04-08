/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Direction, Directionality} from '@angular/cdk/bidi';
import {CommonModule, DOCUMENT} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  NgZone,
  ViewEncapsulation,
  inject,
  ɵNoopNgZone,
} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltip, MatTooltipModule} from '@angular/material/tooltip';
import {RouterModule} from '@angular/router';
import {DevAppDirectionality} from './dev-app-directionality';
import {getAppState, setAppState} from './dev-app-state';
import {DevAppRippleOptions} from './ripple-options';

/** Root component for the dev-app demos. */
@Component({
  selector: 'dev-app-layout',
  templateUrl: 'dev-app-layout.html',
  styleUrl: 'dev-app-layout.css',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTooltipModule,
    RouterModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevAppLayout {
  state = getAppState();
  navItems = [
    {name: 'Examples', route: '/examples'},
    {name: 'CDK Dialog', route: '/cdk-dialog'},
    {name: 'CDK Experimental Combobox', route: '/cdk-experimental-combobox'},
    {name: 'CDK Listbox', route: '/cdk-listbox'},
    {name: 'CDK Menu', route: '/cdk-menu'},
    {name: 'Autocomplete', route: '/autocomplete'},
    {name: 'Badge', route: '/badge'},
    {name: 'Bottom Sheet', route: '/bottom-sheet'},
    {name: 'Button Toggle', route: '/button-toggle'},
    {name: 'Button', route: '/button'},
    {name: 'Card', route: '/card'},
    {name: 'Checkbox', route: '/checkbox'},
    {name: 'Chips', route: '/chips'},
    {name: 'Clipboard', route: '/clipboard'},
    {name: 'Column Resize', route: 'column-resize'},
    {name: 'Connected Overlay', route: '/connected-overlay'},
    {name: 'Datepicker', route: '/datepicker'},
    {name: 'Dialog', route: '/dialog'},
    {name: 'Drag and Drop', route: '/drag-drop'},
    {name: 'Drawer', route: '/drawer'},
    {name: 'Expansion Panel', route: '/expansion'},
    {name: 'Focus Origin', route: '/focus-origin'},
    {name: 'Focus Trap', route: '/focus-trap'},
    {name: 'Google Map', route: '/google-map'},
    {name: 'Grid List', route: '/grid-list'},
    {name: 'Icon', route: '/icon'},
    {name: 'Input Modality', route: '/input-modality'},
    {name: 'Input', route: '/input'},
    {name: 'Layout', route: '/layout'},
    {name: 'List', route: '/list'},
    {name: 'Live Announcer', route: '/live-announcer'},
    {name: 'Menu', route: '/menu'},
    {name: 'Menubar', route: '/menubar'},
    {name: 'Paginator', route: '/paginator'},
    {name: 'Platform', route: '/platform'},
    {name: 'Popover Edit', route: '/popover-edit'},
    {name: 'Portal', route: '/portal'},
    {name: 'Progress Bar', route: '/progress-bar'},
    {name: 'Progress Spinner', route: '/progress-spinner'},
    {name: 'Radio', route: '/radio'},
    {name: 'Ripple', route: '/ripple'},
    {name: 'Screen Type', route: '/screen-type'},
    {name: 'Select', route: '/select'},
    {name: 'Selection', route: '/selection'},
    {name: 'Sidenav', route: '/sidenav'},
    {name: 'Slide Toggle', route: '/slide-toggle'},
    {name: 'Slider', route: '/slider'},
    {name: 'Snack Bar', route: '/snack-bar'},
    {name: 'Stepper', route: '/stepper'},
    {name: 'Table Scroll Container', route: '/table-scroll-container'},
    {name: 'Table', route: '/table'},
    {name: 'Tabs', route: '/tabs'},
    {name: 'Toolbar', route: '/toolbar'},
    {name: 'Tooltip', route: '/tooltip'},
    {name: 'Tree', route: '/tree'},
    {name: 'Typography', route: '/typography'},
    {name: 'Virtual Scrolling', route: '/virtual-scroll'},
    {name: 'YouTube Player', route: '/youtube-player'},
  ];

  /** List of possible global density scale values. */
  private _densityScales = [0, -1, -2, -3, -4, 'minimum', 'maximum'];

  private _ngZone = inject(NgZone);

  readonly isZoneless = this._ngZone instanceof ɵNoopNgZone;

  constructor(
    private _element: ElementRef<HTMLElement>,
    private _rippleOptions: DevAppRippleOptions,
    @Inject(Directionality) private _dir: DevAppDirectionality,
    private _changeDetectorRef: ChangeDetectorRef,
    @Inject(DOCUMENT) private _document: Document,
    private _iconRegistry: MatIconRegistry,
  ) {
    this.toggleTheme(this.state.darkTheme);
    this.toggleStrongFocus(this.state.strongFocusEnabled);
    this.toggleDensity(Math.max(this._densityScales.indexOf(this.state.density), 0));
    this.toggleRippleDisabled(this.state.rippleDisabled);
    this.toggleDirection(this.state.direction);
    this.toggleM3(this.state.m3Enabled);
    this.toggleColorApiBackCompat(this.state.colorApiBackCompat);
  }

  toggleTheme(value = !this.state.darkTheme) {
    this.state.darkTheme = value;
    this._document.body.classList.toggle('demo-unicorn-dark-theme', value);
    setAppState(this.state);
  }

  toggleFullscreen() {
    this._element.nativeElement.querySelector('.demo-content')?.requestFullscreen();
  }

  toggleStrongFocus(value = !this.state.strongFocusEnabled) {
    this.state.strongFocusEnabled = value;
    this._document.body.classList.toggle('demo-strong-focus', value);
    setAppState(this.state);
  }

  toggleZoneless(value = !this.isZoneless) {
    this.state.zoneless = value;
    setAppState(this.state);
    location.reload();
  }

  toggleAnimations() {
    this.state.animations = !this.state.animations;
    setAppState(this.state);
    location.reload();
  }

  toggleDensity(index?: number, tooltipInstance?: MatTooltip) {
    if (index == null) {
      index = (this._densityScales.indexOf(this.state.density) + 1) % this._densityScales.length;
    }

    this.state.density = this._densityScales[index];
    setAppState(this.state);

    // Keep the tooltip open so we can see what the density was changed to. Ideally we'd
    // always show the density in a badge, but the M2 badge is too large for the toolbar.
    if (tooltipInstance) {
      requestAnimationFrame(() => tooltipInstance.show(0));
    }
  }

  toggleRippleDisabled(value = !this.state.rippleDisabled) {
    this._rippleOptions.disabled = this.state.rippleDisabled = value;
    setAppState(this.state);
  }

  toggleDirection(value: Direction = this.state.direction === 'ltr' ? 'rtl' : 'ltr') {
    if (value !== this._dir.value) {
      this._dir.value = this.state.direction = value;
      this._changeDetectorRef.markForCheck();
      setAppState(this.state);
    }
  }

  toggleM3(value = !this.state.m3Enabled) {
    // We need to diff this one since it's a bit more expensive to toggle.
    if (value !== this.state.m3Enabled) {
      (document.getElementById('theme-styles') as HTMLLinkElement).href = value
        ? 'theme-m3.css'
        : 'theme.css';
    }

    this._iconRegistry.setDefaultFontSetClass(
      value ? 'material-symbols-outlined' : 'material-icons',
    );
    this.state.m3Enabled = value;
    setAppState(this.state);
  }

  toggleColorApiBackCompat(value = !this.state.colorApiBackCompat) {
    this.state.colorApiBackCompat = value;
    this._document.body.classList.toggle('demo-color-api-back-compat', value);
    setAppState(this.state);
  }

  getDensityClass() {
    return `demo-density-${this.state.density}`;
  }
}
