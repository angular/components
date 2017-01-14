/**
 * Collects and executes a chain of functions. Useful in cases like RxJS, where we can't chain
 * the methods directly, but rather have to call them individually.
 * @docs-private
 *
 * @example
 * // Standard way
 * someObservable.filter(...).map(...).do(...);
 *
 * // Function chain
 * new FunctionChain()
 *   .context(someObservable)
 *   .call(filter, ...)
 *   .call(map, ...)
 *   .call(do, ...)
 *   .execute();
 */
export class FunctionChain<T> {
  /** Tracks the currently-chained functions. */
  private _chainedCalls: any[] = [];

  constructor(private _initialContext?: any) { }

  /**
   * Adds a function to the chain.
   * @param fn Functions to be added to the chain.
   * @param ...args Arguments with which to call the function.
   */
  call(fn: Function, ...args: any[]): this {
    this._chainedCalls.push([fn, ...args]);
    return this;
  }

  /**
   * Executes all of the functions in the chain and clears it.
   * @returns The return value of the final function in the chain.
   */
  execute(): T {
    let result = this._chainedCalls.reduce((currentValue, currentFunction) => {
      return (currentFunction.shift() as Function).apply(currentValue, currentFunction);
    }, this._initialContext);

    this._chainedCalls.length = 0;

    return result as T;
  }

  /**
   * Allows setting the initial context in a separate call from the constructor.
   * This helps with readability where the line with the constructor could be too long.
   * @param initialContext The new initial context.
   */
  context(initialContext: any): this {
    this._initialContext = initialContext;
    return this;
  }
}
