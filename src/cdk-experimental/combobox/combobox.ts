/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export type OpenAction = 'focus' | 'click' | 'downKey' | 'toggle';

export type OpenActionInput = OpenAction | OpenAction[] | string | null | undefined;

import {
  AfterContentInit,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Optional,
  Output, ViewContainerRef
} from '@angular/core';
import {CdkComboboxPanel} from '@angular/cdk-experimental/combobox';
import {TemplatePortal} from '@angular/cdk/portal';
import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayConfig,
  OverlayRef
} from '@angular/cdk/overlay';
import {Directionality} from '@angular/cdk/bidi';
import {BooleanInput, coerceBooleanProperty, coerceArray} from '@angular/cdk/coercion';


@Directive({
  selector: '[cdkCombobox]',
  exportAs: 'cdkCombobox',
  host: {
    'role': 'combobox',
    '(click)': 'toggle()',
    '[attr.aria-disabled]': 'disabled'
  }
})
export class CdkCombobox<T = unknown> implements OnDestroy, AfterContentInit {
  @Input('triggerFor')
  get comboboxPanel(): CdkComboboxPanel<T> | undefined {
    return this._comboboxPanel;
  }
  set comboboxPanel(panel: CdkComboboxPanel<T> | undefined) {
    this._comboboxPanel = panel;
  }
  private _comboboxPanel: CdkComboboxPanel<T> | undefined;

  @Input()
  get value(): T {
    return this._value;
  }
  set value(val: T) {
    this._value = val;
  }
  private _value: T;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled: boolean = false;

  @Input()
  get openAction(): OpenAction[] {
    return this._openActions;
  }
  set openAction(action: OpenAction[]) {
    this._openActions = this._coerceOpenActionProperty(action);
  }
  private _openActions: OpenAction[] = ['click'];

  @Output('comboboxPanelOpened') readonly opened: EventEmitter<void> = new EventEmitter<void>();
  @Output('comboboxPanelClosed') readonly closed: EventEmitter<void> = new EventEmitter<void>();
  @Output('panelValueChanged') readonly panelValueChanged: EventEmitter<T> = new EventEmitter<T>();

  private _overlayRef: OverlayRef;
  private _panel: TemplatePortal;

  constructor(
    private readonly _elementRef: ElementRef<HTMLElement>,
    private readonly _overlay: Overlay,
    protected readonly _viewContainerRef: ViewContainerRef,
    @Optional() private readonly _directionality?: Directionality
  ) {}

  ngAfterContentInit() {
    this._comboboxPanel?.valueUpdated.subscribe(data => {
      this._setComboboxValue(data);
      this.close();
    });
  }

  ngOnDestroy() {
    this.opened.complete();
    this.closed.complete();
    this.panelValueChanged.complete();
  }

  toggle() {
    if (this.hasPanel()) {
      this.isOpen() ? this.close() : this.open();
    }
  }

  open() {
    if (!this.isOpen() && !this.disabled) {
      this.opened.next();
      this._overlayRef = this._overlayRef || this._overlay.create(this._getOverlayConfig());
      this._overlayRef.attach(this._getPortal());
    }
  }

  close() {
    if (this.isOpen() && !this.disabled) {
      this.closed.next();
      this._overlayRef.detach();
    }
  }

  isOpen(): boolean {
    return this._overlayRef ? this._overlayRef.hasAttached() : false;
  }

  hasPanel(): boolean {
    return !!this.comboboxPanel;
  }

  private _setComboboxValue(value: T) {
    const valueChanged = (this.value !== value);
    this.value = value;

    if (valueChanged) {
      this.panelValueChanged.emit(value);
    }
  }

  private _getOverlayConfig() {
    return new OverlayConfig({
      positionStrategy: this._getOverlayPositionStrategy(),
      scrollStrategy: this._overlay.scrollStrategies.block(),
      direction: this._directionality,
    });
  }

  private _getOverlayPositionStrategy(): FlexibleConnectedPositionStrategy {
    return this._overlay
        .position()
        .flexibleConnectedTo(this._elementRef)
        .withPositions(this._getOverlayPositions());
  }

  private _getOverlayPositions(): ConnectedPosition[] {
    return [
      {originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top'},
      {originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom'},
      {originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top'},
      {originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom'},
    ];
  }

  private _getPortal() {
    const hasPanelChanged = this._comboboxPanel?._templateRef !== this._panel?.templateRef;
    if (this._comboboxPanel && (!this._panel || hasPanelChanged)) {
      this._panel = new TemplatePortal(this._comboboxPanel._templateRef, this._viewContainerRef);
    }

    return this._panel;
  }

  private _coerceOpenActionProperty(input: any): OpenAction[] {
    const actions: OpenAction[] = [];

    const inputArray = coerceArray(input);
    for (const action of inputArray) {
      if (action !== 'focus' && action !== 'click' && action !== 'downKey' && action !== 'toggle') {
        throw Error('Not a valid open action.');
      } else {
        actions.push(action);
      }
    }

    return actions;
  }

  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_openActions: OpenActionInput;
}
