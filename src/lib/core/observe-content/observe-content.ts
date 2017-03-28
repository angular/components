import {
  Directive,
  ElementRef,
  NgModule,
  Output,
  Input,
  EventEmitter,
  OnDestroy,
  AfterContentInit,
  Injector,
} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';

/**
 * Directive that triggers a callback whenever the content of
 * its associated element has changed.
 */
@Directive({
  selector: '[cdkObserveContent]'
})
export class ObserveContent implements AfterContentInit, OnDestroy {
  private _observer: MutationObserver;

  /** Event emitted for each change in the element's content. */
  @Output('cdkObserveContent') event = new EventEmitter<MutationRecord[]>();

  /** Used for debouncing the emitted values to the observeContent event. */
  private _debouncer = new Subject<MutationRecord[]>();

  /** Debounce interval for emitting the changes. */
  @Input() debounce: number;

  constructor(private _elementRef: ElementRef, private _injector: Injector) { }

  ngAfterContentInit() {
    this._debouncer
      .debounceTime(this.debounce)
      .subscribe(mutations => this.event.emit(mutations));

    this._observer = new (this._injector.get(MutationObserver) as any)(
        (mutations: MutationRecord[]) => this._debouncer.next(mutations));

    this._observer.observe(this._elementRef.nativeElement, {
      characterData: true,
      childList: true,
      subtree: true
    });
  }

  ngOnDestroy() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }
}

@NgModule({
  exports: [ObserveContent],
  declarations: [ObserveContent],
  providers: [
    // Pass the MutationObserver through DI so it can be stubbed when testing.
    { provide: MutationObserver, useValue: MutationObserver }
  ]
})
export class ObserveContentModule {}
