export declare class WebDriverElement implements TestElement {
    constructor(_webElement: () => webdriver.WebElement);
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

export declare class WebDriverHarnessEnvironment extends HarnessEnvironment<() => webdriver.WebElement> {
    protected constructor(rawRootElement: () => webdriver.WebElement);
    protected createEnvironment(element: () => webdriver.WebElement): HarnessEnvironment<() => webdriver.WebElement>;
    protected createTestElement(element: () => webdriver.WebElement): TestElement;
    forceStabilize(): Promise<void>;
    protected getAllRawElements(selector: string): Promise<(() => webdriver.WebElement)[]>;
    protected getDocumentRoot(): () => webdriver.WebElement;
    waitForTasksOutsideAngular(): Promise<void>;
    static loader(driver: webdriver.WebDriver): HarnessLoader;
}
