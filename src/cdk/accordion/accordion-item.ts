/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Output,
  Directive,
  EventEmitter,
  Input,
  OnDestroy,
  ChangeDetectorRef,
  booleanAttribute,
  inject,
  OnInit,
} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';
import {UniqueSelectionDispatcher} from '@angular/cdk/collections';
import {CDK_ACCORDION, CdkAccordion} from './accordion';
import {Subscription} from 'rxjs';

/**
 * A basic directive expected to be extended and decorated as a component.  Sets up all
 * events and attributes needed to be managed by a CdkAccordion parent.
 */
@Directive({
  selector: 'cdk-accordion-item, [cdkAccordionItem]',
  exportAs: 'cdkAccordionItem',
  providers: [
    // Provide `CDK_ACCORDION` as undefined to prevent nested accordion items from
    // registering to the same accordion.
    {provide: CDK_ACCORDION, useValue: undefined},
  ],
})
export class CdkAccordionItem implements OnInit, OnDestroy {
  accordion = inject<CdkAccordion>(CDK_ACCORDION, {optional: true, skipSelf: true})!;
  private _changeDetectorRef = inject(ChangeDetectorRef);
  protected _expansionDispatcher = inject(UniqueSelectionDispatcher);

  /** Subscription to openAll/closeAll events. */
  private _openCloseAllSubscription = Subscription.EMPTY;
  /** Event emitted every time the AccordionItem is closed. */
  @Output() readonly closed: EventEmitter<void> = new EventEmitter<void>();
  /** Event emitted every time the AccordionItem is opened. */
  @Output() readonly opened: EventEmitter<void> = new EventEmitter<void>();
  /** Event emitted when the AccordionItem is destroyed. */
  @Output() readonly destroyed: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Emits whenever the expanded state of the accordion changes.
   * Primarily used to facilitate two-way binding.
   * @docs-private
   */
  @Output() readonly expandedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  /** The unique AccordionItem id. */
  readonly id: string = inject(_IdGenerator).getId('cdk-accordion-child-');

  /** Whether the AccordionItem is expanded. */
  @Input({transform: booleanAttribute})
  get expanded(): boolean {
    return this._expanded;
  }
  set expanded(expanded: boolean) {
    // Only emit events and update the internal value if the value changes.
    if (this._expanded !== expanded) {
      this._expanded = expanded;
      this.expandedChange.emit(expanded);

      if (expanded) {
        this.opened.emit();
        /**
         * In the unique selection dispatcher, the id parameter is the id of the CdkAccordionItem,
         * the name value is the id of the accordion.
         */
        const accordionId = this.accordion ? this.accordion.id : this.id;
        this._expansionDispatcher.notify(this.id, accordionId);
      } else {
        this.closed.emit();
      }

      // Ensures that the animation will run when the value is set outside of an `@Input`.
      // This includes cases like the open, close and toggle methods.
      this._changeDetectorRef.markForCheck();
    }
  }
  private _expanded = false;

  /** Whether the AccordionItem is disabled. */
  @Input({transform: booleanAttribute}) disabled: boolean = false;

  /** Unregister function for _expansionDispatcher. */
  private _removeUniqueSelectionListener: () => void = () => {};

  constructor(...args: unknown[]);
  constructor() {}

  ngOnInit() {
    this._removeUniqueSelectionListener = this._expansionDispatcher.listen(
      (id: string, accordionId: string) => {
        if (
          this.accordion &&
          !this.accordion.multi &&
          this.accordion.id === accordionId &&
          this.id !== id
        ) {
          this.expanded = false;
        }
      },
    );

    // When an accordion item is hosted in an accordion, subscribe to open/close events.
    if (this.accordion) {
      this._openCloseAllSubscription = this._subscribeToOpenCloseAllActions();
    }
  }

  /** Emits an event for the accordion item being destroyed. */
  ngOnDestroy() {
    this.opened.complete();
    this.closed.complete();
    this.destroyed.emit();
    this.destroyed.complete();
    this._removeUniqueSelectionListener();
    this._openCloseAllSubscription.unsubscribe();
  }

  /** Toggles the expanded state of the accordion item. */
  toggle(): void {
    if (!this.disabled) {
      this.expanded = !this.expanded;
    }
  }

  /** Sets the expanded state of the accordion item to false. */
  close(): void {
    if (!this.disabled) {
      this.expanded = false;
    }
  }

  /** Sets the expanded state of the accordion item to true. */
  open(): void {
    if (!this.disabled) {
      this.expanded = true;
    }
  }

  private _subscribeToOpenCloseAllActions(): Subscription {
    return this.accordion._openCloseAllActions.subscribe(expanded => {
      // Only change expanded state if item is enabled
      if (!this.disabled) {
        this.expanded = expanded;
      }
    });
  }
}
