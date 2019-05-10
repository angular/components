export declare const MAT_BUTTON_DEFAULT_OPTIONS: InjectionToken<MatButtonDefaultOptions>;

export declare function MAT_BUTTON_DEFAULT_OPTIONS_FACTORY(): MatButtonDefaultOptions;

export declare class MatAnchor extends MatButton {
    tabIndex: number;
    constructor(focusMonitor: FocusMonitor, elementRef: ElementRef, defaults: MatButtonDefaultOptions, animationMode: string);
    _haltDisabledEvents(event: Event): void;
}

export declare class MatButton extends _MatButtonMixinBase implements OnDestroy, CanDisable, CanColor, CanDisableRipple {
    _animationMode: string;
    readonly isIconButton: boolean;
    readonly isRoundButton: boolean;
    ripple: MatRipple;
    constructor(elementRef: ElementRef, _focusMonitor: FocusMonitor, defaults: MatButtonDefaultOptions, _animationMode: string);
    _getHostElement(): any;
    _hasHostAttributes(...attributes: string[]): boolean;
    _isRippleDisabled(): boolean;
    focus(): void;
    ngOnDestroy(): void;
}

export interface MatButtonDefaultOptions {
    type: 'submit' | 'reset' | 'button';
    [key: string]: string;
}

export declare class MatButtonModule {
}
