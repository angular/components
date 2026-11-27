import {UniqueSelectionDispatcher} from './unique-selection-dispatcher';

describe('Unique selection dispatcher', () => {
  let dispatcher: UniqueSelectionDispatcher;

  beforeEach(() => (dispatcher = new UniqueSelectionDispatcher()));

  it('should notify registered listeners', () => {
    const spy = jasmine.createSpy('listen handler');

    dispatcher.listen(spy);
    dispatcher.notify('id', 'name');

    expect(spy).toHaveBeenCalledWith('id', 'name');
  });

  it('should not notify unregistered listeners', () => {
    const spy = jasmine.createSpy('listen handler');
    const unregister = dispatcher.listen(spy);

    unregister();
    dispatcher.notify('id', 'name');

    expect(spy).not.toHaveBeenCalled();
  });

  it('should notify unfiltered listeners and listeners that accept the scope', () => {
    const scope = {};
    const otherScope = {};
    const all = jasmine.createSpy('all');
    const matching = jasmine.createSpy('matching');
    const other = jasmine.createSpy('other');

    dispatcher.listen(all);
    dispatcher.listen(matching, owner => owner === scope);
    dispatcher.listen(other, owner => owner === otherScope);
    dispatcher.notify('id', 'name', scope);

    expect(all).toHaveBeenCalledWith('id', 'name');
    expect(matching).toHaveBeenCalledWith('id', 'name');
    expect(other).not.toHaveBeenCalled();
  });

  it('should notify every listener when a selection has no scope', () => {
    const all = jasmine.createSpy('all');
    const filtered = jasmine.createSpy('filtered');
    dispatcher.listen(all);
    dispatcher.listen(filtered, () => false);
    dispatcher.notify('id', 'name');

    expect(all).toHaveBeenCalledWith('id', 'name');
    expect(filtered).toHaveBeenCalledWith('id', 'name');
  });

  it('should remove a scoped registration without removing another scope for the same listener', () => {
    const first = {};
    const second = {};
    const listener = jasmine.createSpy('listener');
    const unregister = dispatcher.listen(listener, scope => scope === first);
    dispatcher.listen(listener, scope => scope === second);

    unregister();
    dispatcher.notify('first', 'name', first);
    dispatcher.notify('second', 'name', second);

    expect(listener.calls.allArgs()).toEqual([['second', 'name']]);
  });

  it('should remove all listeners when destroyed', () => {
    const spy = jasmine.createSpy('listen handler');
    dispatcher.listen(spy);

    dispatcher.ngOnDestroy();
    dispatcher.notify('id', 'name');

    expect(spy).not.toHaveBeenCalled();
  });
});
