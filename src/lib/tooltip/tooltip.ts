import {
    NgModule,
    ModuleWithProviders,
    Component,
    Directive,
    Input,
    ElementRef,
    ViewContainerRef,
    ChangeDetectorRef, state, trigger, transition, style, animate
} from '@angular/core';
import {
  Overlay,
  OverlayState,
  OverlayModule,
  OverlayRef,
  ComponentPortal,
  OverlayConnectionPosition,
  OriginConnectionPosition,
  OVERLAY_PROVIDERS,
} from '../core';

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

  constructor(private _overlay: Overlay, private _elementRef: ElementRef,
      private _viewContainerRef: ViewContainerRef,
      private _changeDetectionRef: ChangeDetectorRef) {}

  /**
   * Create overlay on init
   * TODO: internal
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
        this.hide();
        this._createOverlay();
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

      this._overlayRef = this._overlay.create(config);
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
  show(): void {
    if (!this.visible && this._overlayRef && !this._overlayRef.hasAttached()) {
      this.visible = true;

      let portal = new ComponentPortal(TooltipComponent, this._viewContainerRef);
      let tooltipRef = this._overlayRef.attach(portal);
      tooltipRef.instance.message = this.message;
      this._updatePosition();
    }
  }

  /**
   * Hides the tooltip and returns a promise that will resolve when the tooltip is hidden
   */
  hide(): void {
    if (this.visible && this._overlayRef && this._overlayRef.hasAttached()) {
      this.visible = false;
      this._overlayRef.detach();
    }
  }

  /**
   * Shows/hides the tooltip and returns a promise that will resolve when it is done
   */
  toggle(): void {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
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

export type TooltipAnimationState = 'hidden' | 'visible';

// TODO(jelbourn): we can't use constants from animation.ts here because you can't use
// a text interpolation in anything that is analyzed statically with ngc (for AoT compile).
export const TOOLTIP_SCALE_TRANSITION = '125ms cubic-bezier(0.4,0.0,1,1)';
export const TOOLTIP_HIDE_ANIMATION = '195ms cubic-bezier(0.0,0.0,0.2,1)';

@Component({
  moduleId: module.id,
  selector: 'md-tooltip-component',
  template: `<div class="md-tooltip" [@state]="animationState">{{message}}</div>`,
  styleUrls: ['tooltip.css'],
  animations: [
    trigger('state', [
      state('void', style({transform: 'scale(.1)'})),
      transition(':enter',
          animate(TOOLTIP_SCALE_TRANSITION, style({transform: 'scale(1)'}))),
    ])
  ],
})
export class TooltipComponent {
  message: string;
  animationState: TooltipAnimationState = 'hidden';

}


@NgModule({
  imports: [OverlayModule],
  exports: [MdTooltip, TooltipComponent],
  declarations: [MdTooltip, TooltipComponent],
  entryComponents: [TooltipComponent],
})
export class MdTooltipModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdTooltipModule,
      providers: OVERLAY_PROVIDERS,
    };
  }
}
