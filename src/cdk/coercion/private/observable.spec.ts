import {Observable, ReplaySubject} from 'rxjs';
import {coerceObservable} from './observable';
import {fakeAsync} from '@angular/core/testing';

describe('coerceObservable', () => {
  it('should return the Observable, if an Observable is passed in', () => {
    const observable = new Observable();
    expect(coerceObservable(observable)).toBe(observable);
  });

  it('should return subclasses of Observables', () => {
    const observable = new ReplaySubject(1);
    expect(coerceObservable(observable)).toBe(observable);
  });

  it('should wrap non-Observables in Observables', fakeAsync(() => {
    const observable = coerceObservable(3);
    let emittedValue = 0;
    observable.subscribe(value => {
      emittedValue = value;
    });
    expect(emittedValue).toBe(3);
  }));
});
