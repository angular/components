/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Directionality} from '@angular/cdk/bidi';
import {BooleanInput, coerceArray, coerceBooleanProperty} from '@angular/cdk/coercion';
import {DOWN_ARROW, ENTER, ESCAPE, TAB} from '@angular/cdk/keycodes';
import {
  ConnectedPosition,
  createBlockScrollStrategy,
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  FlexibleConnectedPositionStrategy,
  OverlayConfig,
  OverlayRef,
} from '@angular/cdk/overlay';
import {_getEventTarget} from '@angular/cdk/platform';
import {TemplatePortal} from '@angular/cdk/portal';

import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  EventEmitter,
  HOST_TAG_NAME,
  InjectionToken,
  Injector,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
  ViewContainerRef,
  inject,
  DOCUMENT,
} from '@angular/core';

export type AriaHasPopupValue = 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
export type OpenAction = 'focus' | 'click' | 'downKey' | 'toggle';
export type OpenActionInput = OpenAction | OpenAction[] | string | null | undefined;

const allowedOpenActions = ['focus', 'click', 'downKey', 'toggle'];

export const CDK_COMBOBOX = new InjectionToken<CdkCombobox>('CDK_COMBOBOX');

@Directive({
  selector: '[cdkCombobox]',
  exportAs: 'cdkCombobox',
  host: {
    'role': 'combobox',
    'class': 'cdk-combobox',
    '(click)': '_handleInteractions("click")',
    '(focus)': '_handleInteractions("focus")',
    '(keydown)': '_keydown($event)',
    '(document:click)': '_attemptClose($event)',
    '[attr.aria-disabled]': 'disabled',
    '[attr.aria-owns]': 'contentId',
    '[attr.aria-haspopup]': 'contentType',
    '[attr.aria-expanded]': 'isOpen()',
    '[attr.tabindex]': '_getTabIndex()',
  },
  providers: [{provide: CDK_COMBOBOX, useExisting: CdkCombobox}],
})
export class CdkCombobox<T = unknown> implements OnDestroy {
  private readonly _tagName = inject(HOST_TAG_NAME);
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly _viewContainerRef = inject(ViewContainerRef);
  private readonly _injector = inject(Injector);
  private readonly _doc = inject(DOCUMENT);
  private readonly _directionality = inject(Directionality, {optional: true});
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _overlayRef: OverlayRef;
  private _panelPortal: TemplatePortal;

  @Input('cdkComboboxTriggerFor')
  _panelTemplateRef: TemplateRef<unknown>;

  @Input()
  value: T | T[];

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled: boolean = false;

  @Input()
  get openActions(): OpenAction[] {
    return this._openActions;
  }
  set openActions(action: OpenActionInput) {
    this._openActions = this._coerceOpenActionProperty(action);
  }
  private _openActions: OpenAction[] = ['click'];

  /** Whether the textContent is automatically updated upon change of the combobox value. */
  @Input()
  get autoSetText(): boolean {
    return this._autoSetText;
  }
  set autoSetText(value: BooleanInput) {
    this._autoSetText = coerceBooleanProperty(value);
  }
  private _autoSetText: boolean = true;

  @Output('comboboxPanelOpened') readonly opened: EventEmitter<void> = new EventEmitter<void>();
  @Output('comboboxPanelClosed') readonly closed: EventEmitter<void> = new EventEmitter<void>();
  @Output('panelValueChanged') readonly panelValueChanged: EventEmitter<T[]> = new EventEmitter<
    T[]
  >();

  contentId: string = '';
  contentType: AriaHasPopupValue;

  ngOnDestroy() {
    if (this._overlayRef) {
      this._overlayRef.dispose();
    }

    this.opened.complete();
    this.closed.complete();
    this.panelValueChanged.complete();
  }

  _keydown(event: KeyboardEvent) {
    const {keyCode} = event;

    if (keyCode === DOWN_ARROW) {
      if (this.isOpen()) {
        // TODO: instead of using a focus function, potentially use cdk/a11y focus trapping
        this._doc.getElementById(this.contentId)?.focus();
      } else if (this._openActions.indexOf('downKey') !== -1) {
        this.open();
      }
    } else if (keyCode === ENTER) {
      if (this._openActions.indexOf('toggle') !== -1) {
        this.toggle();
      } else if (this._openActions.indexOf('click') !== -1) {
        this.open();
      }
    } else if (keyCode === ESCAPE) {
      event.preventDefault();
      this.close();
    } else if (keyCode === TAB) {
      this.close();
    }
  }

  /** Handles click or focus interactions. */
  _handleInteractions(interaction: OpenAction) {
    if (interaction === 'click') {
      if (this._openActions.indexOf('toggle') !== -1) {
        this.toggle();
      } else if (this._openActions.indexOf('click') !== -1) {
        this.open();
      }
    } else if (interaction === 'focus') {
      if (this._openActions.indexOf('focus') !== -1) {
        this.open();
      }
    }
  }

  /** Given a click in the document, determines if the click was inside a combobox. */
  _attemptClose(event: MouseEvent) {
    if (this.isOpen()) {
      let target = _getEventTarget(event);
      while (target instanceof Element) {
        if (target.className.indexOf('cdk-combobox') !== -1) {
          return;
        }
        target = target.parentElement;
      }
    }

    this.close();
  }

  /** Toggles the open state of the panel. */
  toggle() {
    if (this.hasPanel()) {
      this.isOpen() ? this.close() : this.open();
    }
  }

  /** If the combobox is closed and not disabled, opens the panel. */
  open() {
    if (!this.isOpen() && !this.disabled) {
      this.opened.next();
      this._overlayRef =
        this._overlayRef || createOverlayRef(this._injector, this._getOverlayConfig());
      this._overlayRef.attach(this._getPanelContent());
      this._changeDetectorRef.markForCheck();
      if (!this._isTextTrigger()) {
        // TODO: instead of using a focus function, potentially use cdk/a11y focus trapping
        this._doc.getElementById(this.contentId)?.focus();
      }
    }
  }

  /** If the combobox is open and not disabled, closes the panel. */
  close() {
    if (this.isOpen() && !this.disabled) {
      this.closed.next();
      this._overlayRef.detach();
      this._changeDetectorRef.markForCheck();
    }
  }

  /** Returns true if panel is currently opened. */
  isOpen(): boolean {
    return this._overlayRef ? this._overlayRef.hasAttached() : false;
  }

  /** Returns true if combobox has a child panel. */
  hasPanel(): boolean {
    return !!this._panelTemplateRef;
  }

  _getTabIndex(): string | null {
    return this.disabled ? null : '0';
  }

  private _setComboboxValue(value: T | T[]) {
    const valueChanged = this.value !== value;
    this.value = value;

    if (valueChanged) {
      this.panelValueChanged.emit(coerceArray(value));
      if (this._autoSetText) {
        this._setTextContent(value);
      }
    }
  }

  updateAndClose(value: T | T[]) {
    this._setComboboxValue(value);
    this.close();
  }

  private _setTextContent(content: T | T[]) {
    const contentArray = coerceArray(content);
    this._elementRef.nativeElement.textContent = contentArray.join(' ');
  }

  private _isTextTrigger() {
    // TODO: Should check if the trigger is contenteditable.
    const tagName = this._tagName.toLowerCase();
    return tagName === 'input' || tagName === 'textarea';
  }

  private _getOverlayConfig() {
    return new OverlayConfig({
      positionStrategy: this._getOverlayPositionStrategy(),
      scrollStrategy: createBlockScrollStrategy(this._injector),
      direction: this._directionality || undefined,
    });
  }

  private _getOverlayPositionStrategy(): FlexibleConnectedPositionStrategy {
    return createFlexibleConnectedPositionStrategy(this._injector, this._elementRef).withPositions(
      this._getOverlayPositions(),
    );
  }

  private _getOverlayPositions(): ConnectedPosition[] {
    return [
      {originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top'},
      {originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom'},
      {originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top'},
      {originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom'},
    ];
  }

  private _getPanelInjector() {
    return this._injector;
  }

  private _getPanelContent() {
    const hasPanelChanged = this._panelTemplateRef !== this._panelPortal?.templateRef;
    if (this._panelTemplateRef && (!this._panelPortal || hasPanelChanged)) {
      this._panelPortal = new TemplatePortal(
        this._panelTemplateRef,
        this._viewContainerRef,
        undefined,
        this._getPanelInjector(),
      );
    }

    return this._panelPortal;
  }

  private _coerceOpenActionProperty(input: OpenActionInput): OpenAction[] {
    let actions = typeof input === 'string' ? input.trim().split(/[ ,]+/) : input;
    if (
      (typeof ngDevMode === 'undefined' || ngDevMode) &&
      actions?.some(a => allowedOpenActions.indexOf(a) === -1)
    ) {
      throw Error(`${input} is not a support open action for CdkCombobox`);
    }
    return actions as OpenAction[];
  }

  /** Registers the content's id and the content type with the panel. */
  _registerContent(contentId: string, contentType: AriaHasPopupValue) {
    if (
      (typeof ngDevMode === 'undefined' || ngDevMode) &&
      contentType !== 'listbox' &&
      contentType !== 'dialog'
    ) {
      throw Error('CdkComboboxPanel currently only supports listbox or dialog content.');
    }
    this.contentId = contentId;
    this.contentType = contentType;
  }
}
