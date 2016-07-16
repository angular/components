import {
    Directive,
    ElementRef,
    Input,
    Output,
    EventEmitter,
    HostListener,
    ViewContainerRef,
    AfterViewInit,
    OnDestroy
} from '@angular/core';
import {MdMenu} from './menu';
import {MdMenuItem, MdMenuAnchor} from './menu-item';
import {MdMenuMissingError} from './menu-errors';
import {
    Overlay,
    OverlayState,
    OverlayRef,
    OVERLAY_PROVIDERS,
    TemplatePortal
} from '@angular2-material/core/core';
import {
    ConnectedPositionStrategy
} from '@angular2-material/core/overlay/position/connected-position-strategy';

/**
 * This directive is intended to be used in conjunction with an md-menu tag.  It is
 * responsible for toggling the display of the provided menu instance.
 */
@Directive({
  selector: '[md-menu-trigger-for]',
  host: {'aria-haspopup': 'true'},
  providers: [OVERLAY_PROVIDERS],
  exportAs: 'mdMenuTrigger'
})
export class MdMenuTrigger implements AfterViewInit, OnDestroy {
  private _portal: TemplatePortal;
  private _overlay: OverlayRef;
  menuOpen: boolean = false;

  @Input('md-menu-trigger-for') menu: MdMenu;
  @Output() onMenuOpen = new EventEmitter();
  @Output() onMenuClose = new EventEmitter();

  constructor(private _overlayBuilder: Overlay, private _element: ElementRef,
              private _viewContainerRef: ViewContainerRef) {}

  ngAfterViewInit() {
    this._checkMenu();
    this._createOverlay();
    this.menu.close.subscribe(() => this.closeMenu());
  }

  ngOnDestroy() { this.destroyMenu(); }

  @HostListener('click')
  toggleMenu(): Promise<void> {
    return this.menuOpen ? this.closeMenu() : this.openMenu();
  }

  openMenu(): Promise<void> {
    return this._overlay.attach(this._portal)
      .then(() => this._setMenuState(true));
  }

  closeMenu(): Promise<void> {
    return this._overlay.detach()
        .then(() => this._setMenuState(false));
  }

  destroyMenu(): void {
    this._overlay.dispose();
  }

  // set state rather than toggle to support triggers sharing a menu
  private _setMenuState(bool: boolean): void {
    this.menuOpen = bool;
    this.menu._setClickCatcher(bool);
    this.menuOpen ? this.onMenuOpen.emit(null) : this.onMenuClose.emit(null);
  }

  private _checkMenu() {
    if (!this.menu || !(this.menu instanceof MdMenu)) {
      throw new MdMenuMissingError();
    }
  }

  private _createOverlay(): void {
    this._portal = new TemplatePortal(this.menu.templateRef, this._viewContainerRef);
    this._overlayBuilder.create(this._getOverlayConfig())
        .then(overlay => this._overlay = overlay);
  }

  private _getOverlayConfig(): OverlayState {
    const overlayState = new OverlayState();
    overlayState.positionStrategy = this._getPosition();
    return overlayState;
  }

  private _getPosition(): ConnectedPositionStrategy  {
    return this._overlayBuilder.position().connectedTo(
      this._element,
      {originX: 'start', originY: 'top'},
      {overlayX: 'start', overlayY: 'top'}
    );
  }
}

export const MD_MENU_DIRECTIVES = [MdMenu, MdMenuItem, MdMenuTrigger, MdMenuAnchor];
