import {
    AfterViewInit,
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    Optional,
    Output,
    Renderer,
    ViewContainerRef,
} from '@angular/core';
import {MdPopoverPanel} from './popover-panel';
import {MdPopoverMissingError} from './popover-errors';
import {
    isFakeMousedownFromScreenReader,
    Dir,
    LayoutDirection,
    Overlay,
    OverlayState,
    OverlayRef,
    TemplatePortal,
    ConnectedPositionStrategy,
    HorizontalConnectionPos,
    VerticalConnectionPos,
} from '../core';
import {Subscription} from 'rxjs/Subscription';
import {PopoverPositionX, PopoverPositionY} from './popover-positions';

/**
 * This directive is intended to be used in conjunction with an md-popover tag.  It is
 * responsible for toggling the display of the provided popover instance.
 */
@Directive({
  selector: '[md-popover-trigger-for], [mat-popover-trigger-for], [mdPopoverTriggerFor]',
  host: {
    'aria-haspopup': 'true',
    '(mousedown)': '_handleMousedown($event)',
    // '(click)': 'togglePopover()',
    // '(mouseenter)': 'openPopover()',
    // '(mouseleave)': 'closePopover()',
  },
  exportAs: 'mdPopoverTrigger'
})
export class MdPopoverTrigger implements AfterViewInit, OnDestroy {
  private _portal: TemplatePortal;
  private _overlayRef: OverlayRef;
  private _popoverOpen: boolean = false;
  private _backdropSubscription: Subscription;
  private _positionSubscription: Subscription;

  // tracking input type is necessary so it's possible to only auto-focus
  // the first item of the list when the popover is opened via the keyboard
  private _openedByMouse: boolean = false;

  private _mouseoverTimmer: number;
  private _popoverCloseDisabled = false;



  /** @deprecated */
  @Input('md-popover-trigger-for')
  get _deprecatedPopoverTriggerFor(): MdPopoverPanel { return this.popover; }
  set _deprecatedPopoverTriggerFor(v: MdPopoverPanel) { this.popover = v; }

  /** References the popover instance that the trigger is associated with. */
  @Input('mdPopoverTriggerFor') popover: MdPopoverPanel;


  @HostListener('click') onClick() {
    if (this.popover.mdPopoverTrigger == 'click') {
      this.togglePopover();
    }
  }


  @HostListener('mouseover') onMouseOver() {
    if (this.popover.mdPopoverTrigger == 'hover') {
      this._mouseoverTimmer = setTimeout(() => {
        this.openPopover();
      }, this.popover.mdPopoverDelay);
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (this.popover.mdPopoverTrigger == 'hover') {
      clearTimeout(this._mouseoverTimmer);
      if (this._popoverOpen) {
        setTimeout(() => {
          if (!this.popover.closeDisabled) {
            this.closePopover();
          }
        }, 200);
      }
    }
  }



  /** Event emitted when the associated popover is opened. */
  @Output() onPopoverOpen = new EventEmitter<void>();

  /** Event emitted when the associated popover is closed. */
  @Output() onPopoverClose = new EventEmitter<void>();


  constructor(private _overlay: Overlay, private _element: ElementRef,
              private _viewContainerRef: ViewContainerRef, private _renderer: Renderer,
              @Optional() private _dir: Dir) {}

  ngAfterViewInit() {
    this._checkPopover();
    this.popover.close.subscribe(() => this.closePopover());
  }

  ngOnDestroy() { this.destroyPopover(); }

  /** Whether the popover is open. */
  get popoverOpen(): boolean { return this._popoverOpen; }

  /** Toggles the popover between the open and closed states. */
  togglePopover(): void {
    return this._popoverOpen ? this.closePopover() : this.openPopover();
  }


  /** Opens the popover. */
  openPopover(): void {
    if (!this._popoverOpen) {
      this._createOverlay();
      this._overlayRef.attach(this._portal);
      this._subscribeToBackdrop();
      this._initPopover();
    }
  }

  /** Closes the popover. */
  closePopover(): void {
    if (this._overlayRef) {
      this._overlayRef.detach();
      this._backdropSubscription.unsubscribe();
      this._resetPopover();
    }
  }

  /** Removes the popover from the DOM. */
  destroyPopover(): void {
    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._overlayRef = null;

      this._cleanUpSubscriptions();
    }
  }

  /** Focuses the popover trigger. */
  focus() {
    this._renderer.invokeElementMethod(this._element.nativeElement, 'focus');
  }

  /** The text direction of the containing app. */
  get dir(): LayoutDirection {
    return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
  }

  /**
   * This method ensures that the popover closes when the overlay backdrop is clicked.
   * We do not use first() here because doing so would not catch clicks from within
   * the popover, and it would fail to unsubscribe properly. Instead, we unsubscribe
   * explicitly when the popover is closed or destroyed.
   */
  private _subscribeToBackdrop(): void {
    this._backdropSubscription = this._overlayRef.backdropClick().subscribe(() => {
      this.closePopover();
    });
  }

  /**
   * This method sets the popover state to open and focuses the first item if
   * the popover was opened via the keyboard.
   */
  private _initPopover(): void {
    this._setIsPopoverOpen(true);

    // Should only set focus if opened via the keyboard, so keyboard users can
    // can easily navigate popover items. According to spec, mouse users should not
    // see the focus style.
    if (!this._openedByMouse) {
      this.popover.focusFirstItem();
    }
  };

  /**
   * This method resets the popover when it's closed, most importantly restoring
   * focus to the popover trigger if the popover was opened via the keyboard.
   */
  private _resetPopover(): void {
    this._setIsPopoverOpen(false);

    // Focus only needs to be reset to the host element if the popover was opened
    // by the keyboard and manually shifted to the first popover item.
    if (!this._openedByMouse) {
      this.focus();
    }
    this._openedByMouse = false;
  }

  // set state rather than toggle to support triggers sharing a popover
  private _setIsPopoverOpen(isOpen: boolean): void {
    this._popoverOpen = isOpen;
    this._popoverOpen ? this.onPopoverOpen.emit() : this.onPopoverClose.emit();
  }

  /**
   *  This method checks that a valid instance of MdPopover has been passed into
   *  mdPopoverTriggerFor. If not, an exception is thrown.
   */
  private _checkPopover() {
    if (!this.popover) {
      throw new MdPopoverMissingError();
    }
  }

  /**
   *  This method creates the overlay from the provided popover's template and saves its
   *  OverlayRef so that it can be attached to the DOM when openPopover is called.
   */
  private _createOverlay(): void {
    if (!this._overlayRef) {
      this._portal = new TemplatePortal(this.popover.templateRef, this._viewContainerRef);
      const config = this._getOverlayConfig();
      this._subscribeToPositions(config.positionStrategy as ConnectedPositionStrategy);
      this._overlayRef = this._overlay.create(config);
    }
  }

  /**
   * This method builds the configuration object needed to create the overlay, the OverlayState.
   * @returns OverlayState
   */
  private _getOverlayConfig(): OverlayState {
    const overlayState = new OverlayState();
    overlayState.positionStrategy = this._getPosition()
                                        .withDirection(this.dir);
    if (this.popover.mdPopoverTrigger == 'click') {
      overlayState.hasBackdrop = true;
      overlayState.backdropClass = 'cdk-overlay-transparent-backdrop';
    }
    overlayState.direction = this.dir;
    return overlayState;
  }

  /**
   * Listens to changes in the position of the overlay and sets the correct classes
   * on the popover based on the new position. This ensures the animation origin is always
   * correct, even if a fallback position is used for the overlay.
   */
  private _subscribeToPositions(position: ConnectedPositionStrategy): void {
    this._positionSubscription = position.onPositionChange.subscribe((change) => {
      const posX: PopoverPositionX = change.connectionPair.originX === 'start' ? 'after' : 'before';
      let posY: PopoverPositionY = change.connectionPair.originY === 'top' ? 'below' : 'above';

      if (!this.popover.overlapTrigger) {
        posY = posY === 'below' ? 'above' : 'below';
      }

      this.popover.setPositionClasses(posX, posY);
    });
  }

  /**
   * This method builds the position strategy for the overlay, so the popover is properly connected
   * to the trigger.
   * @returns ConnectedPositionStrategy
   */
  private _getPosition(): ConnectedPositionStrategy  {
    const [posX, fallbackX]: HorizontalConnectionPos[] =
      this.popover.positionX === 'before' ? ['end', 'start'] : ['start', 'end'];

    const [overlayY, fallbackOverlayY]: VerticalConnectionPos[] =
      this.popover.positionY === 'above' ? ['bottom', 'top'] : ['top', 'bottom'];

    let originY = overlayY;
    let fallbackOriginY = fallbackOverlayY;

    if (!this.popover.overlapTrigger) {
      originY = overlayY === 'top' ? 'bottom' : 'top';
      fallbackOriginY = fallbackOverlayY === 'top' ? 'bottom' : 'top';
    }

    return this._overlay.position()
      .connectedTo(this._element,
          {originX: posX, originY: originY}, {overlayX: posX, overlayY: overlayY})
      .withFallbackPosition(
          {originX: fallbackX, originY: originY},
          {overlayX: fallbackX, overlayY: overlayY})
      .withFallbackPosition(
          {originX: posX, originY: fallbackOriginY},
          {overlayX: posX, overlayY: fallbackOverlayY})
      .withFallbackPosition(
          {originX: fallbackX, originY: fallbackOriginY},
          {overlayX: fallbackX, overlayY: fallbackOverlayY});
  }

  private _cleanUpSubscriptions(): void {
    if (this._backdropSubscription) {
      this._backdropSubscription.unsubscribe();
    }
    if (this._positionSubscription) {
      this._positionSubscription.unsubscribe();
    }
  }

  _handleMousedown(event: MouseEvent): void {
    if (!isFakeMousedownFromScreenReader(event)) {
      this._openedByMouse = true;
    }
  }

}
