import {
  Directive, ElementRef, OnInit, OnDestroy, ModuleWithProviders,
  NgModule
} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {Scroll} from './scroll';


/**
 * Sends an event when the directive's element is scrolled. Registers itself with the Scroll
 * service to include itself as part of its collection of scrolling events that it can be listened
 * to through the service.
 */
@Directive({
  selector: '[md-scrollable]'
})
export class Scrollable implements OnInit, OnDestroy {
  /** Subject for notifying that the element has been scrolled. */
  private _elementScrolled: Subject<Event> = new Subject();

  constructor(private _elementRef: ElementRef, private _scroll: Scroll) {}

  ngOnInit() {
    this._scroll.register(this);
    this._elementRef.nativeElement.addEventListener('scroll', (e: Event) => {
      this._elementScrolled.next(e);
    });
  }

  ngOnDestroy() {
    this._scroll.deregister(this);
  }

  /** Returns observable that emits an event when the scroll event is fired on the host element. */
  elementScrolled(): Observable<Event> {
    return this._elementScrolled.asObservable();
  }
}


@NgModule({
  exports: [Scrollable],
  declarations: [Scrollable],
})
export class ScrollModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ScrollModule,
      providers: [Scroll]
    };
  }
}
