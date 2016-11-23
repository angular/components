import {
  ViewChild,
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  trigger,
  state,
  style,
  animate,
  transition,
  AnimationTransitionEvent,
  ElementRef,
  Optional
} from '@angular/core';
import {TemplatePortal, PortalHostDirective, Dir, LayoutDirection} from '../core';
import 'rxjs/add/operator/map';

export type MdTabBodyPositionState =
    'left' | 'center' | 'right' | 'left-origin-center' | 'right-origin-center';

export type MdTabBodyOriginState = 'left' | 'right';

@Component({
  moduleId: module.id,
  selector: 'md-tab-body',
  templateUrl: 'tab-body.html',
  animations: [
    trigger('translateTab', [
      state('left', style({transform: 'translate3d(-100%, 0, 0)'})),
      state('left-origin-center', style({transform: 'translate3d(0, 0, 0)'})),
      state('right-origin-center', style({transform: 'translate3d(0, 0, 0)'})),
      state('center', style({transform: 'translate3d(0, 0, 0)'})),
      state('right', style({transform: 'translate3d(100%, 0, 0)'})),
      transition('* => left, * => right, left => center, right => center',
          animate('500ms cubic-bezier(0.35, 0, 0.25, 1)')),
      transition('void => left-origin-center', [
        style({transform: 'translate3d(-100%, 0, 0)'}),
        animate('500ms cubic-bezier(0.35, 0, 0.25, 1)')
      ]),
      transition('void => right-origin-center', [
        style({transform: 'translate3d(100%, 0, 0)'}),
        animate('500ms cubic-bezier(0.35, 0, 0.25, 1)')
      ])
    ])
  ],
  host: {
    'md-tab-body-active': "'this._position == 'center'"
  }
})
export class MdTabBody implements OnInit {
  /** The portal host inside of this container into which the tab body content will be loaded. */
  @ViewChild(PortalHostDirective) _portalHost: PortalHostDirective;

  /** Event emitted when the tab begins to animate towards the center as the active tab. */
  @Output()
  onTabBodyCentering: EventEmitter<number> = new EventEmitter<number>();

  /** Event emitted when the tab completes its animation towards the center. */
  @Output()
  onTabBodyCentered: EventEmitter<void> = new EventEmitter<void>(true);

  /** The tab body content to display. */
  @Input('md-tab-body-content') _content: TemplatePortal;

  /** The shifted index position of the tab body, where zero represents the active center tab. */
  _position: MdTabBodyPositionState;
  @Input('md-tab-position') set position(position: number) {
    if (position < 0) {
      this._position = this._getLayoutDirection() == 'ltr' ? 'left' : 'right';
    } else if (position > 0) {
      this._position = this._getLayoutDirection() == 'ltr' ? 'right' : 'left';
    } else {
      this._position = 'center';
    }
  }

  /** The origin position from which this tab should appear when it is centered into view. */
  _origin: MdTabBodyOriginState;
  @Input('md-tab-origin') set origin(origin: number) {
    if (origin == null) { return; }

    if (origin <= 0) {
      this._origin = this._getLayoutDirection() == 'ltr' ? 'left' : 'right';
    } else {
      this._origin = this._getLayoutDirection() == 'ltr' ? 'right' : 'left';
    }
  }

  constructor(private _elementRef: ElementRef, @Optional() private _dir: Dir) {}

  /**
   * After initialized, check if the content is centered and has an origin. If so, set the
   * special position states that transition the tab from the left or right before centering.
   */
  ngOnInit() {
    if (this._position == 'center' && this._origin) {
      this._position = this._origin == 'left' ? 'left-origin-center' : 'right-origin-center';
    }
  }

  /**
   * After the view has been set, check if the tab content is set to the center and attach the
   * content if it is not already attached.
   */
  ngAfterViewChecked() {
    if (this._isCenterPosition(this._position) && !this._portalHost.hasAttached()) {
      this._portalHost.attach(this._content);
    }
  }

  _onTranslateTabStarted(e: AnimationTransitionEvent) {
    console.log('Animation began with position ', this._position);
    if (this._isCenterPosition(e.toState)) {
      this.onTabBodyCentering.emit(this._elementRef.nativeElement.clientHeight);
    }
  }

  _onTranslateTabComplete(e: AnimationTransitionEvent) {
    // If the end state is that the tab is not centered, then detach the content.
    if (!this._isCenterPosition(e.toState) && !this._isCenterPosition(this._position)) {
      this._portalHost.detach();
    }

    // If the transition to the center is complete, emit an event.
    if (this._isCenterPosition(e.toState) && this._isCenterPosition(this._position)) {
      this.onTabBodyCentered.emit();
    }
  }

  /** The text direction of the containing app. */
  _getLayoutDirection(): LayoutDirection {
    return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
  }


  /** Whether the provided position state is considered center, regardless of origin. */
  private _isCenterPosition(position: MdTabBodyPositionState|string): boolean {
    return position == 'center' ||
        position == 'left-origin-center' ||
        position == 'right-origin-center';
  }
}
