import {fakeAsync, tick} from '@angular/core/testing';
import {debounce} from './debounce';

describe('debounce', () => {
  let func: jasmine.Spy;

  beforeEach(() => func = jasmine.createSpy('test function'));

  it('should debounce calls to a function', fakeAsync(() => {
    let debounced = debounce(func, 100);

    debounced();
    debounced();
    debounced();

    tick(100);

    expect(func).toHaveBeenCalledTimes(1);
  }));

  it('should pass the arguments to the debounced function', fakeAsync(() => {
    let debounced = debounce(func, 250);

    debounced(1, 2, 3);
    debounced(4, 5, 6);

    tick(250);

    expect(func).toHaveBeenCalledWith(4, 5, 6);
  }));

  it('should be able to invoke a function with a context', fakeAsync(() => {
    let context = { name: 'Bilbo' };
    let debounced = debounce(func, 300, context);

    debounced();
    tick(300);

    expect(func.calls.mostRecent().object).toBe(context);
  }));
});
