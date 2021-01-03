export declare class BidiModule {
    static ɵinj: i0.ɵɵInjectorDef<BidiModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<BidiModule, [typeof i1.Dir], never, [typeof i1.Dir]>;
}

export declare class Dir extends Directionality implements AfterContentInit {
    constructor();
    ngAfterContentInit(): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<Dir, "[dir]", ["dir"], { "dir": "dir"; }, { "change": "dirChange"; }, never>;
    static ɵfac: i0.ɵɵFactoryDef<Dir, never>;
}

export declare const DIR_DOCUMENT: InjectionToken<Document>;

export declare type Direction = 'ltr' | 'rtl';

export declare class Directionality implements OnDestroy {
    protected _isInitialized: boolean;
    _rawDir: string;
    readonly change: EventEmitter<Direction>;
    get dir(): Direction;
    set dir(value: Direction);
    get value(): Direction;
    constructor(_document?: any);
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDef<Directionality, [{ optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDef<Directionality>;
}
