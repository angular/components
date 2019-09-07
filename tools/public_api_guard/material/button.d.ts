export declare const MAT_BUTTON_DEFAULT_OPTIONS: InjectionToken<MatButtonDefaultOptions>;

export declare function MAT_BUTTON_DEFAULT_OPTIONS_FACTORY(): MatButtonDefaultOptions;

export declare class MatAnchor extends MatButton {
    tabIndex: number;
    constructor(focusMonitor: FocusMonitor, elementRef: ElementRef, animationMode: string, defaults: MatButtonDefaultOptions);
    _haltDisabledEvents(event: Event): void;
}

export declare class MatButton extends _MatButtonMixinBase implements OnDestroy, CanDisable, CanColor, CanDisableRipple, FocusableOption {
    _animationMode: string;
    readonly isIconButton: boolean;
    readonly isRoundButton: boolean;
    ripple: MatRipple;
    constructor(elementRef: ElementRef, _focusMonitor: FocusMonitor, _animationMode: string, defaults: MatButtonDefaultOptions);
    _getHostElement(): any;
    _hasHostAttributes(...attributes: string[]): boolean;
    _isRippleDisabled(): boolean;
    focus(_origin?: FocusOrigin, options?: FocusOptions): void;
    ngOnDestroy(): void;
}

export interface MatButtonDefaultOptions {
    type?: 'button' | 'reset' | 'submit';
}

export declare class MatButtonModule {
}
