import {
    NgModule,
    Component,
    ComponentRef,
    Directive,
    Input,
    ElementRef,
    ViewContainerRef,
    ChangeDetectorRef
} from '@angular/core';
import {
  Overlay,
  OverlayState,
  OverlayModule,
  OverlayRef,
  ComponentPortal,
  OverlayConnectionPosition,
  OriginConnectionPosition,
} from '@angular2-material/core/core';

export type TooltipPosition = 'before' | 'after' | 'above' | 'below';

@Directive({
  selector: '[md-tooltip]',
  host: {
    '(mouseenter)': '_handleMouseEnter($event)',
    '(mouseleave)': '_handleMouseLeave($event)',
  }
})
export class MdTooltip {
  visible: boolean = false;

  /** Allows the user to define the position of the tooltip relative to the parent element */
  private _position: TooltipPosition = 'below';
  @Input('tooltip-position') get position(): TooltipPosition {
    return this._position;
  }
  set position(value: TooltipPosition) {
    if (value !== this._position) {
      this._position = value;
      this._createOverlay();
      this._updatePosition();
    }
  }

  /** The message to be displayed in the tooltip */
  private _message: string;
  @Input('md-tooltip') get message() {
    return this._message;
  }
  set message(value: string) {
    this._message = value;
    this._updatePosition();
  }

  private _overlayRef: OverlayRef;
  private _tooltipContainer: TooltipContainer;

  constructor(private _overlay: Overlay, private _elementRef: ElementRef,
      private _viewContainerRef: ViewContainerRef,
      private _changeDetectionRef: ChangeDetectorRef) {}

  /** 
   * Create overlay on init
   * TODO: @internal
   */
  ngOnInit() {
    this._createOverlay();
  }

  /**
   * Create the overlay config and position strategy
   */
  private _createOverlay() {
    if (this._overlayRef) {
      if (this.visible) {
        // if visible, hide before destroying
        this.hide().then(() => this._createOverlay());
      } else {
        // if not visible, dispose and recreate
        this._overlayRef.dispose();
        this._overlayRef = null;
        this._createOverlay();
      }
    } else {
      let origin = this._getOrigin();
      let position = this._getOverlayPosition();
      let strategy = this._overlay.position().connectedTo(this._elementRef, origin, position);
      let config = new OverlayState();
      config.positionStrategy = strategy;
      this._overlay.create(config).then(ref => {
        this._overlayRef = ref;
      });
    }
  }

  /**
   * Returns the origin position based on the user's position preference
   */
  private _getOrigin(): OriginConnectionPosition {
    switch (this.position) {
      case 'before': return { originX: 'start', originY: 'center' };
      case 'after':  return { originX: 'end', originY: 'center' };
      case 'above':  return { originX: 'center', originY: 'top' };
      case 'below':  return { originX: 'center', originY: 'bottom' };
    }
  }

  /**
   * Returns the overlay position based on the user's preference
   */
  private _getOverlayPosition(): OverlayConnectionPosition {
    switch (this.position) {
      case 'before': return { overlayX: 'end', overlayY: 'center' };
      case 'after':  return { overlayX: 'start', overlayY: 'center' };
      case 'above':  return { overlayX: 'center', overlayY: 'bottom' };
      case 'below':  return { overlayX: 'center', overlayY: 'top' };
    }
  }

  /**
   * Shows the tooltip on mouse enter
   * @param event
   */
  _handleMouseEnter(event: MouseEvent) {
    this.show();
  }

  /**
   * Hides the tooltip on mouse leave
   * @param event
   */
  _handleMouseLeave(event: MouseEvent) {
    this.hide();
  }

  /**
   * Shows the tooltip and returns a promise that will resolve when the tooltip is visible
   */
  show(): Promise<any> {
    if (!this.visible && this._overlayRef && !this._overlayRef.hasAttached()) {
      this.visible = true;
      let promise = this._overlayRef.attach(new ComponentPortal(TooltipContainer,
          this._viewContainerRef));
      promise.then((ref: ComponentRef<TooltipContainer>) => {
        this._tooltipContainer = ref.instance;
        ref.instance.tooltip = this;
        this._updatePosition();
      });
      return promise;
    }
  }

  /**
   * Hides the tooltip and returns a promise that will resolve when the tooltip is hidden
   */
  hide(): Promise<any> {
    if (this._tooltipContainer) {
      let tooltipContainer = this._tooltipContainer;
      // Reset _tooltipContainer to prevent duplicate calls to `hide()`
      this._tooltipContainer = null;
      return tooltipContainer.remove().then(() => this.destroy());
    }
  }

  /**
   * Removes the tooltip from the DOM and returns a promise that resolves once the element is fully
   * removed.
   */
  destroy(): Promise<any> {
    if (this.visible && this._overlayRef && this._overlayRef.hasAttached()) {
      this.visible = false;
      return this._overlayRef.detach();
    }
  }

  /**
   * Shows/hides the tooltip and returns a promise that will resolve when it is done
   */
  toggle(): Promise<any> {
    if (this.visible) {
      return this.hide();
    } else {
      return this.show();
    }
  }

  /**
   * Updates the tooltip's position
   */
  private _updatePosition() {
    if (this._overlayRef) {
      this._changeDetectionRef.detectChanges();
      this._overlayRef.updatePosition();
    }
  }
}

@Component({
  moduleId: module.id,
  selector: 'md-tooltip-component',
  template: `<div class="md-tooltip {{positionClass}}"
                [class.md-tooltip-initialized]="initialized"
                [class.md-tooltip-visible]="visible">{{message}}</div>`,
  styleUrls: ['tooltip.css'],
})
class TooltipContainer {
  tooltip: MdTooltip;
  visible = false;
  initialized = false;

  constructor(private _elementRef: ElementRef) {}

  get message() {
    return this.tooltip.message;
  }

  get positionClass() {
    return `md-tooltip-${this.tooltip.position}`;
  }

  /** Once the view is rendered, add the `visible` class to trigger enter animation */
  ngAfterViewInit() {
    // transitions are only enabled after the view is initialized
    this.initialized = true;
    // with animations enabled, we can make the tooltip visible
    this.visible = true;
  }

  /** Trigger the leave animation and returns a promise that resolves when the animation is done */
  remove(): Promise<any> {
    this.visible = false;
    return new Promise(done => {
      // Note: This only works if all transitions have the same duration
      this._elementRef.nativeElement.addEventListener('transitionend', () => done());
    });
  }
}

/** @deprecated */
export const MD_TOOLTIP_DIRECTIVES = [MdTooltip];


@NgModule({
  imports: [OverlayModule],
  exports: [MD_TOOLTIP_DIRECTIVES, TooltipContainer],
  declarations: [MD_TOOLTIP_DIRECTIVES, TooltipContainer],
  entryComponents: [TooltipContainer],
})
export class MdTooltipModule { }
