export declare class ProtractorElement extends WebDriverElementBase {
    readonly element: ElementFinder;
    constructor(element: ElementFinder);
}

export declare class ProtractorHarnessEnvironment extends HarnessEnvironment<ElementFinder> {
    protected constructor(rawRootElement: ElementFinder, options?: ProtractorHarnessEnvironmentOptions);
    protected createEnvironment(element: ElementFinder): HarnessEnvironment<ElementFinder>;
    protected createTestElement(element: ElementFinder): TestElement;
    forceStabilize(): Promise<void>;
    protected getAllRawElements(selector: string): Promise<ElementFinder[]>;
    protected getDocumentRoot(): ElementFinder;
    waitForTasksOutsideAngular(): Promise<void>;
    static getNativeElement(el: TestElement): ElementFinder;
    static loader(options?: ProtractorHarnessEnvironmentOptions): HarnessLoader;
}

export interface ProtractorHarnessEnvironmentOptions {
    queryFn: (selector: string, root: ElementFinder) => ElementArrayFinder;
}
