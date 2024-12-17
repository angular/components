/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {FocusTrap} from '@angular/cdk/a11y';
import {OverlayRef, OverlaySizeConfig, PositionStrategy} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {
  afterRender,
  AfterViewInit,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  NgZone,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  inject,
  Renderer2,
  ListenerOptions,
} from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {
  debounceTime,
  filter,
  map,
  mapTo,
  share,
  startWith,
  takeUntil,
  throttleTime,
  withLatestFrom,
} from 'rxjs/operators';

import {CELL_SELECTOR, EDIT_PANE_CLASS, EDIT_PANE_SELECTOR, ROW_SELECTOR} from './constants';
import {EditEventDispatcher, HoverContentState} from './edit-event-dispatcher';
import {EditServices} from './edit-services';
import {FocusDispatcher} from './focus-dispatcher';
import {
  FocusEscapeNotifier,
  FocusEscapeNotifierDirection,
  FocusEscapeNotifierFactory,
} from './focus-escape-notifier';
import {closest} from './polyfill';
import {EditRef} from './edit-ref';
import {_bindEventWithOptions} from '@angular/cdk/platform';

/**
 * Describes the number of columns before and after the originating cell that the
 * edit popup should span. In left to right locales, before means left and after means
 * right. In right to left locales before means right and after means left.
 */
export interface CdkPopoverEditColspan {
  before?: number;
  after?: number;
}

/** Used for rate-limiting mousemove events. */
const MOUSE_MOVE_THROTTLE_TIME_MS = 10;

/**
 * A directive that must be attached to enable editability on a table.
 * It is responsible for setting up delegated event handlers and providing the
 * EditEventDispatcher service for use by the other edit directives.
 */
@Directive({
  selector: 'table[editable], cdk-table[editable], mat-table[editable]',
  providers: [EditEventDispatcher, EditServices],
})
export class CdkEditable implements AfterViewInit, OnDestroy {
  protected readonly elementRef = inject(ElementRef);
  protected readonly editEventDispatcher =
    inject<EditEventDispatcher<EditRef<unknown>>>(EditEventDispatcher);
  protected readonly focusDispatcher = inject(FocusDispatcher);
  protected readonly ngZone = inject(NgZone);
  private readonly _renderer = inject(Renderer2);

  protected readonly destroyed = new Subject<void>();

  private _rendered = new Subject();

  constructor() {
    afterRender(() => {
      this._rendered.next();
    });
  }

  ngAfterViewInit(): void {
    this._listenForTableEvents();
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
    this._rendered.complete();
  }

  private _observableFromEvent<T extends Event>(
    element: Element,
    name: string,
    options?: ListenerOptions,
  ) {
    return new Observable<T>(subscriber => {
      const handler = (event: T) => subscriber.next(event);
      const cleanup = options
        ? _bindEventWithOptions(this._renderer, element, name, handler, options)
        : this._renderer.listen(element, name, handler, options);
      return () => {
        cleanup();
        subscriber.complete();
      };
    });
  }

  private _listenForTableEvents(): void {
    const element = this.elementRef.nativeElement;
    const toClosest = (selector: string) =>
      map((event: UIEvent) => closest(event.target, selector));

    this.ngZone.runOutsideAngular(() => {
      // Track mouse movement over the table to hide/show hover content.
      this._observableFromEvent<MouseEvent>(element, 'mouseover')
        .pipe(toClosest(ROW_SELECTOR), takeUntil(this.destroyed))
        .subscribe(this.editEventDispatcher.hovering);
      this._observableFromEvent<MouseEvent>(element, 'mouseleave')
        .pipe(mapTo(null), takeUntil(this.destroyed))
        .subscribe(this.editEventDispatcher.hovering);
      this._observableFromEvent<MouseEvent>(element, 'mousemove')
        .pipe(
          throttleTime(MOUSE_MOVE_THROTTLE_TIME_MS),
          toClosest(ROW_SELECTOR),
          takeUntil(this.destroyed),
        )
        .subscribe(this.editEventDispatcher.mouseMove);

      // Track focus within the table to hide/show/make focusable hover content.
      this._observableFromEvent<FocusEvent>(element, 'focus', {capture: true})
        .pipe(toClosest(ROW_SELECTOR), share(), takeUntil(this.destroyed))
        .subscribe(this.editEventDispatcher.focused);

      merge(
        this._observableFromEvent(element, 'blur', {capture: true}),
        this._observableFromEvent<KeyboardEvent>(element, 'keydown').pipe(
          filter(event => event.key === 'Escape'),
        ),
      )
        .pipe(mapTo(null), share(), takeUntil(this.destroyed))
        .subscribe(this.editEventDispatcher.focused);

      // Keep track of rows within the table. This is used to know which rows with hover content
      // are first or last in the table. They are kept focusable in case focus enters from above
      // or below the table.
      this._rendered
        .pipe(
          // Avoid some timing inconsistencies since Angular v19.
          debounceTime(0),
          // Optimization: ignore dom changes while focus is within the table as we already
          // ensure that rows above and below the focused/active row are tabbable.
          withLatestFrom(this.editEventDispatcher.editingOrFocused),
          filter(([_, activeRow]) => activeRow == null),
          map(() => element.querySelectorAll(ROW_SELECTOR)),
          share(),
          takeUntil(this.destroyed),
        )
        .subscribe(this.editEventDispatcher.allRows);

      this._observableFromEvent<KeyboardEvent>(element, 'keydown')
        .pipe(
          filter(event => event.key === 'Enter'),
          toClosest(CELL_SELECTOR),
          takeUntil(this.destroyed),
        )
        .subscribe(this.editEventDispatcher.editing);

      // Keydown must be used here or else key auto-repeat does not work properly on some platforms.
      this._observableFromEvent<KeyboardEvent>(element, 'keydown')
        .pipe(takeUntil(this.destroyed))
        .subscribe(this.focusDispatcher.keyObserver);
    });
  }
}

const POPOVER_EDIT_HOST_BINDINGS = {
  '[attr.tabindex]': 'disabled ? null : 0',
  'class': 'cdk-popover-edit-cell',
  '[attr.aria-haspopup]': '!disabled',
};

const POPOVER_EDIT_INPUTS = [
  {name: 'template', alias: 'cdkPopoverEdit'},
  {name: 'context', alias: 'cdkPopoverEditContext'},
  {name: 'colspan', alias: 'cdkPopoverEditColspan'},
  {name: 'disabled', alias: 'cdkPopoverEditDisabled'},
  {name: 'ariaLabel', alias: 'cdkPopoverEditAriaLabel'},
];

/**
 * Attaches an ng-template to a cell and shows it when instructed to by the
 * EditEventDispatcher service.
 * Makes the cell focusable.
 */
@Directive({
  selector: '[cdkPopoverEdit]:not([cdkPopoverEditTabOut])',
  host: POPOVER_EDIT_HOST_BINDINGS,
  inputs: POPOVER_EDIT_INPUTS,
})
export class CdkPopoverEdit<C> implements AfterViewInit, OnDestroy {
  protected readonly services = inject(EditServices);
  protected readonly elementRef = inject(ElementRef);
  protected readonly viewContainerRef = inject(ViewContainerRef);

  /** The edit lens template shown over the cell on edit. */
  template: TemplateRef<any> | null = null;

  /**
   * Implicit context to pass along to the template. Can be omitted if the template
   * is defined within the cell.
   */
  context?: C;

  /** Aria label to set on the popover dialog element. */
  ariaLabel?: string;

  /**
   * Specifies that the popup should cover additional table cells before and/or after
   * this one.
   */
  get colspan(): CdkPopoverEditColspan {
    return this._colspan;
  }
  set colspan(value: CdkPopoverEditColspan) {
    this._colspan = value;

    // Recompute positioning when the colspan changes.
    if (this.overlayRef) {
      this.overlayRef.updatePositionStrategy(this._getPositionStrategy());

      if (this.overlayRef.hasAttached()) {
        this._updateOverlaySize();
      }
    }
  }
  private _colspan: CdkPopoverEditColspan = {};

  /** Whether popover edit is disabled for this cell. */
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;

    if (value) {
      this.services.editEventDispatcher.doneEditingCell(this.elementRef.nativeElement!);
      this.services.editEventDispatcher.disabledCells.set(this.elementRef.nativeElement!, true);
    } else {
      this.services.editEventDispatcher.disabledCells.delete(this.elementRef.nativeElement!);
    }
  }
  private _disabled = false;

  protected focusTrap?: FocusTrap;
  protected overlayRef?: OverlayRef;
  protected readonly destroyed = new Subject<void>();

  ngAfterViewInit(): void {
    this._startListeningToEditEvents();
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();

    if (this.focusTrap) {
      this.focusTrap.destroy();
      this.focusTrap = undefined;
    }

    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }

  protected initFocusTrap(): void {
    this.focusTrap = this.services.focusTrapFactory.create(this.overlayRef!.overlayElement);
  }

  protected closeEditOverlay(): void {
    this.services.editEventDispatcher.doneEditingCell(this.elementRef.nativeElement!);
  }

  protected panelClass(): string {
    return EDIT_PANE_CLASS;
  }

  private _startListeningToEditEvents(): void {
    this.services.editEventDispatcher
      .editingCell(this.elementRef.nativeElement!)
      .pipe(takeUntil(this.destroyed))
      .subscribe(open => {
        if (open && this.template) {
          if (!this.overlayRef) {
            this._createEditOverlay();
          }

          this._showEditOverlay();
        } else if (this.overlayRef) {
          this._maybeReturnFocusToCell();

          this.overlayRef.detach();
        }
      });
  }

  private _createEditOverlay(): void {
    this.overlayRef = this.services.overlay.create({
      disposeOnNavigation: true,
      panelClass: this.panelClass(),
      positionStrategy: this._getPositionStrategy(),
      scrollStrategy: this.services.overlay.scrollStrategies.reposition(),
      direction: this.services.directionality,
    });

    this.initFocusTrap();
    this.overlayRef.overlayElement.setAttribute('role', 'dialog');
    if (this.ariaLabel) {
      this.overlayRef.overlayElement.setAttribute('aria-label', this.ariaLabel);
    }

    this.overlayRef.detachments().subscribe(() => this.closeEditOverlay());
  }

  private _showEditOverlay(): void {
    this.overlayRef!.attach(
      new TemplatePortal(this.template!, this.viewContainerRef, {$implicit: this.context}),
    );

    // We have to defer trapping focus, because doing so too early can cause the form inside
    // the overlay to be submitted immediately if it was opened on an Enter keydown event.
    this.services.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.focusTrap!.focusInitialElement();
      });
    });

    // Update the size of the popup initially and on subsequent changes to
    // scroll position and viewport size.
    merge(this.services.scrollDispatcher.scrolled(), this.services.viewportRuler.change())
      .pipe(startWith(null), takeUntil(merge(this.overlayRef!.detachments(), this.destroyed)))
      .subscribe(() => {
        this._updateOverlaySize();
      });
  }

  private _getOverlayCells(): HTMLElement[] {
    const cell = closest(this.elementRef.nativeElement!, CELL_SELECTOR) as HTMLElement;

    if (!this._colspan.before && !this._colspan.after) {
      return [cell];
    }

    const row = closest(this.elementRef.nativeElement!, ROW_SELECTOR)!;
    const rowCells = Array.from(row.querySelectorAll(CELL_SELECTOR)) as HTMLElement[];
    const ownIndex = rowCells.indexOf(cell);

    return rowCells.slice(
      ownIndex - (this._colspan.before || 0),
      ownIndex + (this._colspan.after || 0) + 1,
    );
  }

  private _getPositionStrategy(): PositionStrategy {
    const cells = this._getOverlayCells();
    return this.services.overlay
      .position()
      .flexibleConnectedTo(cells[0])
      .withGrowAfterOpen()
      .withPush()
      .withViewportMargin(16)
      .withPositions([
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top',
        },
      ]);
  }

  private _updateOverlaySize(): void {
    this.overlayRef!.updateSize(this._sizeConfigForCells(this._getOverlayCells()));
  }

  private _maybeReturnFocusToCell(): void {
    if (closest(document.activeElement, EDIT_PANE_SELECTOR) === this.overlayRef!.overlayElement) {
      this.elementRef.nativeElement!.focus();
    }
  }

  private _sizeConfigForCells(cells: HTMLElement[]): OverlaySizeConfig {
    if (cells.length === 0) {
      return {};
    }

    if (cells.length === 1) {
      return {width: cells[0].getBoundingClientRect().width};
    }

    let firstCell, lastCell;
    if (this.services.directionality.value === 'ltr') {
      firstCell = cells[0];
      lastCell = cells[cells.length - 1];
    } else {
      lastCell = cells[0];
      firstCell = cells[cells.length - 1];
    }

    return {width: lastCell.getBoundingClientRect().right - firstCell.getBoundingClientRect().left};
  }
}

/**
 * Attaches an ng-template to a cell and shows it when instructed to by the
 * EditEventDispatcher service.
 * Makes the cell focusable.
 */
@Directive({
  selector: '[cdkPopoverEdit][cdkPopoverEditTabOut]',
  host: POPOVER_EDIT_HOST_BINDINGS,
  inputs: POPOVER_EDIT_INPUTS,
})
export class CdkPopoverEditTabOut<C> extends CdkPopoverEdit<C> {
  protected readonly focusEscapeNotifierFactory = inject(FocusEscapeNotifierFactory);

  protected override focusTrap?: FocusEscapeNotifier = undefined;

  protected override initFocusTrap(): void {
    this.focusTrap = this.focusEscapeNotifierFactory.create(this.overlayRef!.overlayElement);

    this.focusTrap
      .escapes()
      .pipe(takeUntil(this.destroyed))
      .subscribe(direction => {
        this.services.editEventDispatcher.editRef?.blur();
        this.services.focusDispatcher.moveFocusHorizontally(
          closest(this.elementRef.nativeElement!, CELL_SELECTOR) as HTMLElement,
          direction === FocusEscapeNotifierDirection.START ? -1 : 1,
        );

        this.closeEditOverlay();
      });
  }
}

/**
 * A structural directive that shows its contents when the table row containing
 * it is hovered or when an element in the row has focus.
 */
@Directive({
  selector: '[cdkRowHoverContent]',
})
export class CdkRowHoverContent implements AfterViewInit, OnDestroy {
  protected readonly services = inject(EditServices);
  protected readonly elementRef = inject(ElementRef);
  protected readonly templateRef = inject<TemplateRef<any>>(TemplateRef);
  protected readonly viewContainerRef = inject(ViewContainerRef);

  protected readonly destroyed = new Subject<void>();
  protected viewRef: EmbeddedViewRef<any> | null = null;

  private _row?: Element;

  ngAfterViewInit(): void {
    this._row = closest(this.elementRef.nativeElement!, ROW_SELECTOR)!;

    this.services.editEventDispatcher.registerRowWithHoverContent(this._row);
    this._listenForHoverAndFocusEvents();
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();

    if (this.viewRef) {
      this.viewRef.destroy();
    }

    if (this._row) {
      this.services.editEventDispatcher.deregisterRowWithHoverContent(this._row);
    }
  }

  /**
   * Called immediately after the hover content is created and added to the dom.
   * In the CDK version, this is a noop but subclasses such as MatRowHoverContent use this
   * to prepare/style the inserted element.
   */
  protected initElement(_: HTMLElement): void {}

  /**
   * Called when the hover content needs to be focusable to preserve a reasonable tab ordering
   * but should not yet be shown.
   */
  protected makeElementHiddenButFocusable(element: HTMLElement): void {
    element.style.opacity = '0';
  }

  /**
   * Called when the hover content needs to be focusable to preserve a reasonable tab ordering
   * but should not yet be shown.
   */
  protected makeElementVisible(element: HTMLElement): void {
    element.style.opacity = '';
  }

  private _listenForHoverAndFocusEvents(): void {
    this.services.editEventDispatcher
      .hoverOrFocusOnRow(this._row!)
      .pipe(takeUntil(this.destroyed))
      .subscribe(eventState => {
        // When in FOCUSABLE state, add the hover content to the dom but make it transparent so
        // that it is in the tab order relative to the currently focused row.

        if (eventState === HoverContentState.ON || eventState === HoverContentState.FOCUSABLE) {
          if (!this.viewRef) {
            this.viewRef = this.viewContainerRef.createEmbeddedView(this.templateRef, {});
            this.initElement(this.viewRef.rootNodes[0] as HTMLElement);
            this.viewRef.markForCheck();
          } else if (this.viewContainerRef.indexOf(this.viewRef) === -1) {
            this.viewContainerRef.insert(this.viewRef!);
            this.viewRef.markForCheck();
          }

          if (eventState === HoverContentState.ON) {
            this.makeElementVisible(this.viewRef.rootNodes[0] as HTMLElement);
          } else {
            this.makeElementHiddenButFocusable(this.viewRef.rootNodes[0] as HTMLElement);
          }
        } else if (this.viewRef) {
          this.viewContainerRef.detach(this.viewContainerRef.indexOf(this.viewRef));
        }
      });
  }
}

/**
 * Opens the closest edit popover to this element, whether it's associated with this exact
 * element or an ancestor element.
 */
@Directive({
  selector: '[cdkEditOpen]',
  host: {
    '(click)': 'openEdit($event)',
  },
})
export class CdkEditOpen {
  protected readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly editEventDispatcher =
    inject<EditEventDispatcher<EditRef<unknown>>>(EditEventDispatcher);

  constructor() {
    const elementRef = this.elementRef;

    const nativeElement = elementRef.nativeElement;

    // Prevent accidental form submits.
    if (nativeElement.nodeName === 'BUTTON' && !nativeElement.getAttribute('type')) {
      nativeElement.setAttribute('type', 'button');
    }
  }

  openEdit(evt: Event): void {
    this.editEventDispatcher.editing.next(closest(this.elementRef.nativeElement!, CELL_SELECTOR));
    evt.stopPropagation();
  }
}
