/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  effect,
  model,
  ModelSignal,
  DestroyRef,
  Directive,
  OnDestroy,
  output,
  OutputEmitterRef,
  inject,
  input,
  InputSignal,
  OnInit,
} from '@angular/core';
import { outputToObservable, takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {_IdGenerator} from '@angular/cdk/a11y';
import {UniqueSelectionDispatcher} from '@angular/cdk/collections';
import {CDK_ACCORDION, CdkAccordion} from './accordion';
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
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);
  private readonly _accordion: CdkAccordion | null = inject<CdkAccordion>(CDK_ACCORDION, {optional: true, skipSelf: true})!;
  private readonly _expansionDispatcher: UniqueSelectionDispatcher = inject(UniqueSelectionDispatcher);
  /** The unique AccordionItem id. */
  readonly id: string = inject(_IdGenerator).getId('cdk-accordion-child-');

  /** Unregister function for _expansionDispatcher. */
  private _removeUniqueSelectionListener: () => void = () => {};

  /** Event emitted every time the AccordionItem is closed. */
  readonly closed: OutputEmitterRef<void> = output<void>();
  /** Event emitted every time the AccordionItem is opened. */
  readonly opened: OutputEmitterRef<void> = output<void>();
  /** Event emitted when the AccordionItem is destroyed. */
  readonly destroyed: OutputEmitterRef<void> = output<void>();

  /** Whether the AccordionItem is expanded. */
  readonly expanded: ModelSignal<boolean> = model<boolean>(false);

  /** Whether the AccordionItem is disabled. */
  readonly disabled: InputSignal<boolean> = input<boolean>(false);

  constructor(...args: unknown[]);
  constructor() {
    effect(() => {
      if (this.expanded()) {
        this.opened.emit();
        const accordionId: string = this._accordion ? this._accordion.id : this.id;
        this._expansionDispatcher.notify(this.id, accordionId);
      } else {
        this.closed.emit();
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    if (this._accordion) {
      outputToObservable(this._accordion?.openCloseAllActions)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(expanded => {
          if (!this.disabled()) {
            this.expanded.set(expanded);
          }
        });

      this._removeUniqueSelectionListener = this._expansionDispatcher
        .listen((id: string, accordionId: string) => {
            if (this._accordion && !this._accordion.multi() && this._accordion.id === accordionId && this.id !== id) {
              this.expanded.set(false);
            }
          },
        );
    }

    /** Emits an event for the accordion item being destroyed. */
    ngOnDestroy() {
      this.destroyed.emit();
      this._removeUniqueSelectionListener();
    }

    /** Toggles the expanded state of the accordion item. */
    toggle(): void {
      if (!this.disabled()) {
      this.expanded.update((prev: boolean) => !prev);
    }
  }

    /** Sets the expanded state of the accordion item to false. */
    close(): void {
      if (!this.disabled()) {
      this.expanded.set(false);
    }
  }

    /** Sets the expanded state of the accordion item to true. */
    open(): void {
      if (!this.disabled()) {
      this.expanded.set(true);
    }
  }
  }

