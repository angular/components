export declare class WebdriverElement implements TestElement {
    constructor(_webElement: () => WebElement);
    blur(): Promise<void>;
    clear(): Promise<void>;
    click(...args: [ModifierKeys?] | ['center', ModifierKeys?] | [
        number,
        number,
        ModifierKeys?
    ]): Promise<void>;
    dispatchEvent(name: string, data?: Record<string, EventData>): Promise<void>;
    focus(): Promise<void>;
    getAttribute(name: string): Promise<string | null>;
    getCssValue(property: string): Promise<string>;
    getDimensions(): Promise<ElementDimensions>;
    getProperty(name: string): Promise<any>;
    hasClass(name: string): Promise<boolean>;
    hover(): Promise<void>;
    isFocused(): Promise<boolean>;
    matchesSelector(selector: string): Promise<boolean>;
    mouseAway(): Promise<void>;
    rightClick(...args: [ModifierKeys?] | ['center', ModifierKeys?] | [
        number,
        number,
        ModifierKeys?
    ]): Promise<void>;
    selectOptions(...optionIndexes: number[]): Promise<void>;
    sendKeys(...keys: (string | TestKey)[]): Promise<void>;
    sendKeys(modifiers: ModifierKeys, ...keys: (string | TestKey)[]): Promise<void>;
    setInputValue(newValue: string): Promise<void>;
    text(options?: TextOptions): Promise<string>;
}

export declare class WebdriverHarnessEnvironment extends HarnessEnvironment<() => WebElement> {
    protected constructor(rawRootElement: () => WebElement);
    protected createEnvironment(element: () => WebElement): HarnessEnvironment<() => WebElement>;
    protected createTestElement(element: () => WebElement): TestElement;
    forceStabilize(): Promise<void>;
    protected getAllRawElements(selector: string): Promise<(() => WebElement)[]>;
    protected getDocumentRoot(): () => WebElement;
    waitForTasksOutsideAngular(): Promise<void>;
    static loader(driver: WebDriver): HarnessLoader;
}
