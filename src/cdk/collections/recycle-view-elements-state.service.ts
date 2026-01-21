import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

/**
 * Service that keeps state of virtual scroll destroyed/recycled views.
 * Provides state storage and observable subscriptions for state changes.
 */
@Injectable()
export class RecycleViewElementsState {
  /** Map storing state data keyed by unique identifiers. */
  private _stateMap = new Map<string, Record<string, unknown>>();

  /** Map storing BehaviorSubjects for each state identifier to enable reactive subscriptions. */
  private _stateSubjects = new Map<string, BehaviorSubject<Record<string, unknown> | undefined>>();

  /**
   * Adds or merges state for a given identifier.
   * When the identifier already exists, the new state is merged with the existing state,
   * with new properties overwriting existing ones.
   * @param id The unique identifier for the state.
   * @param state The state object to add or merge.
   */
  add(id: string, state: Record<string, unknown>): void {
    const existingState = this._stateMap.get(id);
    // Merge new state with existing state, or create a new state object if none exists.
    const newState: Record<string, unknown> = existingState
      ? {...existingState, ...state}
      : {...state};

    this._stateMap.set(id, newState);

    // Notify subscribers of the state change.
    const subject = this._stateSubjects.get(id);
    if (subject) {
      subject.next(newState);
    } else {
      // Initialize a new subject for this identifier to enable future subscriptions.
      const newSubject = new BehaviorSubject<Record<string, unknown> | undefined>(newState);
      this._stateSubjects.set(id, newSubject);
    }
  }

  /**
   * Removes state for a given identifier.
   * @param id The unique identifier for the state to remove.
   * @returns Whether the state was successfully removed.
   */
  remove(id: string): boolean {
    const removed = this._stateMap.delete(id);

    // Notify subscribers that the state has been removed, then clean up the subject.
    const subject = this._stateSubjects.get(id);
    if (subject) {
      subject.next(undefined);
      subject.complete();
      this._stateSubjects.delete(id);
    }

    return removed;
  }

  /**
   * Retrieves the state for a given identifier.
   * @param id The unique identifier for the state.
   * @returns The state object, or undefined if no state exists for the identifier.
   */
  get<T extends Record<string, unknown> = Record<string, unknown>>(id: string): T | undefined {
    return this._stateMap.get(id) as T | undefined;
  }

  /**
   * Checks whether state exists for a given identifier.
   * @param id The unique identifier for the state.
   * @returns Whether state exists for the given identifier.
   */
  has(id: string): boolean {
    return this._stateMap.has(id);
  }

  /**
   * Clears all stored state and completes all active subscriptions.
   * This method should be called when resetting the application state or during cleanup.
   */
  clear(): void {
    // Complete all active subjects to prevent memory leaks before clearing.
    this._stateSubjects.forEach(subject => {
      subject.complete();
    });
    this._stateSubjects.clear();
    this._stateMap.clear();
  }

  /**
   * Creates an observable stream of state changes for a given identifier.
   * The observable immediately emits the current state (or undefined if none exists),
   * then emits subsequent changes until the state is removed or cleared.
   * @param id The unique identifier for the state to observe.
   * @returns An Observable that emits the state whenever it changes, or undefined when removed.
   */
  subscribe<T extends Record<string, unknown> = Record<string, unknown>>(
    id: string,
  ): Observable<T | undefined> {
    let subject = this._stateSubjects.get(id);
    if (!subject) {
      // Initialize a new subject with the current state to support late subscriptions.
      const currentState = this._stateMap.get(id);
      subject = new BehaviorSubject<Record<string, unknown> | undefined>(currentState);
      this._stateSubjects.set(id, subject);
    }
    return subject.asObservable() as Observable<T | undefined>;
  }
}
