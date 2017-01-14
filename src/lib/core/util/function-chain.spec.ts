import {FunctionChain} from './function-chain';

describe('FunctionChain', () => {
  it('should chain functions', () => {
    let first = jasmine.createSpy('First function');
    let second = jasmine.createSpy('Second function');
    let third = jasmine.createSpy('Third function');

    new FunctionChain().call(first).call(second).call(third).execute();

    expect(first).toHaveBeenCalled();
    expect(second).toHaveBeenCalled();
    expect(third).toHaveBeenCalled();
  });

  it('should pass in arguments to the functions', () => {
    let first = jasmine.createSpy('First function');
    let second = jasmine.createSpy('Second function');

    new FunctionChain().call(first, 1, 2).call(second, 3, 4).execute();

    expect(first).toHaveBeenCalledWith(1, 2);
    expect(second).toHaveBeenCalledWith(3, 4);
  });

  it('should clear the chain once it has been executed', () => {
    let fn = jasmine.createSpy('Spy function');
    let chain = new FunctionChain().call(fn);

    chain.execute();
    expect(fn).toHaveBeenCalledTimes(1);

    chain.execute();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should return the final function result', () => {
    let result = new FunctionChain()
      .context([1, 2, 3, 4, 5])
      .call(Array.prototype.map, (current: number) => current * 2)
      .call(Array.prototype.filter, (current: number) => current > 5)
      .execute();

    expect(result).toEqual([6, 8, 10]);
  });
});
