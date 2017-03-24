import {
    Component,
    Input,
    Output,
    EventEmitter,
    ViewEncapsulation,
    AfterContentInit,
    ElementRef,
    Renderer,
    Inject,
    forwardRef,
    ContentChildren,
    QueryList,
    ContentChild,
    HostListener,
    NgModule,
    ModuleWithProviders
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdButton, MdButtonModule} from '../button/index';

const Z_INDEX_ITEM: number = 23;

@Component({
    moduleId: module.id,
    selector: 'md-fab-trigger, mat-fab-trigger',
    template: `
        <ng-content select="[md-fab], [mat-fab]"></ng-content>
    `,
    host: {
        '[class.mat-fab-trigger]': 'true',
        '[class.mat-spin]': 'spin'
    }
})
export class MdFabSpeedDialTrigger {

    /**
     * Whether this trigger should spin (360dg) while opening the speed dial
     */
    @Input() spin: boolean = false;

    constructor(@Inject(forwardRef(() => MdFabSpeedDialComponent))
                private _parent: MdFabSpeedDialComponent) {
    }

    @HostListener('click', ['$event'])
    _onClick(event: any) {
        if (!this._parent.fixed) {
            this._parent.toggle();
            event.stopPropagation();
        }
    }

}

@Component({
    moduleId: module.id,
    selector: 'md-fab-actions, mat-fab-actions',
    template: `
        <ng-content select="[md-mini-fab], [mat-mini-fab]"></ng-content>
    `,
    host: {
        '[class.mat-fab-actions]': 'true'
    }
})
export class MdFabSpeedDialActions implements AfterContentInit {

    @ContentChildren(MdButton) _buttons: QueryList<MdButton>;

    constructor(@Inject(forwardRef(() => MdFabSpeedDialComponent))
                private _parent: MdFabSpeedDialComponent,
                private renderer: Renderer) {
    }

    ngAfterContentInit(): void {
        this._buttons.changes.subscribe(() => {
            this.initButtonStates();
            this._parent.setActionsVisibility();
        });

        this.initButtonStates();
    }

    private initButtonStates() {
        this._buttons.toArray().forEach((button, i) => {
            this.renderer.setElementClass(button._getHostElement(), 'mat-fab-action-item', true);
            this.changeElementStyle(button._getHostElement(), 'z-index', '' + (Z_INDEX_ITEM - i));
        });
    }

    show() {
        if (this._buttons) {
            this._buttons.toArray().forEach((button, i) => {
                let delay = 0;
                let transform: string;
                if (this._parent.animationMode == 'scale') {
                    // Incremental transition delay of 65ms for each action button
                    delay = 3 + (65 * i);
                    transform = 'scale(1)';
                } else {
                    transform = this.getTranslateFunction('0');
                }
                this.changeElementStyle(button._getHostElement(), 'transition-delay', delay + 'ms');
                this.changeElementStyle(button._getHostElement(), 'opacity', '1');
                this.changeElementStyle(button._getHostElement(), 'transform', transform);
            });
        }
    }

    hide() {
        if (this._buttons) {
            this._buttons.toArray().forEach((button, i) => {
                let opacity = '1';
                let delay = 0;
                let transform: string;
                if (this._parent.animationMode == 'scale') {
                    delay = 3 - (65 * i);
                    transform = 'scale(0)';
                    opacity = '0';
                } else {
                    transform = this.getTranslateFunction((55 * (i + 1) - (i * 5)) + 'px');
                }
                this.changeElementStyle(button._getHostElement(), 'transition-delay', delay + 'ms');
                this.changeElementStyle(button._getHostElement(), 'opacity', opacity);
                this.changeElementStyle(button._getHostElement(), 'transform', transform);
            });
        }
    }

    private getTranslateFunction(value: string) {
        let dir = this._parent.direction;
        let translateFn = (dir == 'up' || dir == 'down') ? 'translateY' : 'translateX';
        let sign = (dir == 'down' || dir == 'right') ? '-' : '';
        return translateFn + '(' + sign + value + ')';
    }

    private changeElementStyle(elem: any, style: string, value: string) {
        // FIXME - Find a way to create a "wrapper" around the action button(s),
        // so we don't change it's style tag
        this.renderer.setElementStyle(elem, style, value);
    }
}

@Component({
    moduleId: module.id,
    selector: 'md-fab-speed-dial, mat-fab-speed-dial',
    template: `
        <div class="mat-fab-speed-dial-container">
            <ng-content select="md-fab-trigger, mat-fab-trigger"></ng-content>
            <ng-content select="md-fab-actions, mat-fab-actions"></ng-content>
        </div>
    `,
    styleUrls: ['fab-speed-dial.css'],
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class.mat-fab-speed-dial]': 'true',
        '[class.mat-opened]': 'open'
    }
})
export class MdFabSpeedDialComponent implements AfterContentInit {
    private isInitialized: boolean = false;
    private _direction: string = 'up';
    private _open: boolean = false;
    private _animationMode: string = 'fling';

    /**
     * Whether this speed dial is fixed on screen (user cannot change it by clicking)
     */
    @Input() fixed: boolean = false;

    /**
     * Whether this speed dial is opened
     */
    @Input() get open() {
        return this._open;
    }

    set open(open: boolean) {
        open = open === true;
        let previousOpen = this._open;
        this._open = open;
        if (previousOpen != this._open) {
            this.openChange.emit(this._open);
            if (this.isInitialized) {
                this.setActionsVisibility();
            }
        }
    }

    /**
     * The direction of the speed dial. Can be 'up', 'down', 'left' or 'right'
     */
    @Input() get direction() {
        return this._direction;
    }

    set direction(direction: string) {
        direction = direction ? direction : 'up';
        let previousDir = this._direction;
        this._direction = direction;
        if (previousDir != this.direction) {
            this._setElementClass(previousDir, false);
            this._setElementClass(this.direction, true);

            if (this.isInitialized) {
                this.setActionsVisibility();
            }
        }
    }

    /**
     * The animation mode to open the speed dial. Can be 'fling' or 'scale'
     */
    @Input() get animationMode() {
        return this._animationMode;
    }

    set animationMode(animationMode: string) {
        animationMode = animationMode ? animationMode : 'fling';
        let previousAnimationMode = this._animationMode;
        this._animationMode = animationMode;
        if (previousAnimationMode != this._animationMode) {
            this._setElementClass(previousAnimationMode, false);
            this._setElementClass(this.animationMode, true);

            if (this.isInitialized) {
                // To start another detect lifecycle and force the close on the action buttons
                Promise.resolve(null).then(() => this.open = false);
            }
        }
    }

    @Output() openChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ContentChild(MdFabSpeedDialActions) _childActions: MdFabSpeedDialActions;

    constructor(private elementRef: ElementRef, private renderer: Renderer) {
    }

    ngAfterContentInit(): void {
        this.isInitialized = true;
        this.setActionsVisibility();
        this._setElementClass(this.direction, true);
        this._setElementClass(this.animationMode, true);
    }

    /**
     * Toggle the open state of this speed dial
     */
    public toggle() {
        this.open = !this.open;
    }

    @HostListener('click')
    _onClick() {
        if (!this.fixed && this.open) {
            this.open = false;
        }
    }

    setActionsVisibility() {
        if (this.open) {
            this._childActions.show();
        } else {
            this._childActions.hide();
        }
    }

    private _setElementClass(elemClass: string, isAdd: boolean) {
        this.renderer.setElementClass(this.elementRef.nativeElement, `mat-${elemClass}`, isAdd);
    }
}


@NgModule({
    imports: [CommonModule, MdButtonModule],
    exports: [
        MdFabSpeedDialTrigger,
        MdFabSpeedDialActions,
        MdFabSpeedDialComponent
    ],
    declarations: [
        MdFabSpeedDialTrigger,
        MdFabSpeedDialActions,
        MdFabSpeedDialComponent
    ],
})
export class MdFabSpeedDialModule {
    /** @deprecated */
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: MdFabSpeedDialModule,
            providers: []
        };
    }
}
