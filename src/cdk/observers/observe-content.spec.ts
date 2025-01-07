import {Component, ElementRef, ViewChild} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  inject,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import {ContentObserver, MutationObserverFactory, ObserversModule} from './observe-content';

describe('Observe content directive', () => {
  describe('basic usage', () => {
    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [ObserversModule, ComponentWithTextContent, ComponentWithChildTextContent],
      });
    }));

    it('should trigger the callback when the content of the element changes', done => {
      let fixture = TestBed.createComponent(ComponentWithTextContent);
      fixture.detectChanges();

      // If the hint label is empty, expect no label.
      const spy = spyOn(fixture.componentInstance, 'doSomething').and.callFake(() => {
        expect(spy).toHaveBeenCalled();
        done();
      });

      expect(spy).not.toHaveBeenCalled();

      fixture.componentInstance.text = 'text';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
    });

    it('should trigger the callback when the content of the children changes', done => {
      let fixture = TestBed.createComponent(ComponentWithChildTextContent);
      fixture.detectChanges();

      // If the hint label is empty, expect no label.
      const spy = spyOn(fixture.componentInstance, 'doSomething').and.callFake(() => {
        expect(spy).toHaveBeenCalled();
        done();
      });

      expect(spy).not.toHaveBeenCalled();

      fixture.componentInstance.text = 'text';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
    });

    it('should disconnect the MutationObserver when the directive is disabled', () => {
      const observeSpy = jasmine.createSpy('observe spy');
      const disconnectSpy = jasmine.createSpy('disconnect spy');

      // Note: since we can't know exactly when the native MutationObserver will emit, we can't
      // test this scenario reliably without risking flaky tests, which is why we supply a mock
      // MutationObserver and check that the methods are called at the right time.
      TestBed.overrideProvider(MutationObserverFactory, {
        deps: [],
        useFactory: () => ({
          create: () => ({observe: observeSpy, disconnect: disconnectSpy}),
        }),
      });

      const fixture = TestBed.createComponent(ComponentWithTextContent);
      fixture.detectChanges();

      expect(observeSpy).toHaveBeenCalledTimes(1);
      expect(disconnectSpy).not.toHaveBeenCalled();

      fixture.componentInstance.disabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(observeSpy).toHaveBeenCalledTimes(1);
      expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('debounced', () => {
    let fixture: ComponentFixture<ComponentWithDebouncedListener>;
    let callbacks: Function[];
    let invokeCallbacks = (args?: any) => callbacks.forEach(callback => callback(args));

    beforeEach(waitForAsync(() => {
      callbacks = [];

      TestBed.configureTestingModule({
        imports: [ObserversModule, ComponentWithDebouncedListener],
        providers: [
          {
            provide: MutationObserverFactory,
            useValue: {
              create: function (callback: Function) {
                callbacks.push(callback);
                return {
                  observe: () => {},
                  disconnect: () => {},
                };
              },
            },
          },
        ],
      });

      fixture = TestBed.createComponent(ComponentWithDebouncedListener);
      fixture.detectChanges();
    }));

    it('should debounce the content changes', fakeAsync(() => {
      invokeCallbacks([{type: 'fake'}]);
      invokeCallbacks([{type: 'fake'}]);
      invokeCallbacks([{type: 'fake'}]);

      tick(500);
      expect(fixture.componentInstance.spy).toHaveBeenCalledTimes(1);
    }));
  });
});

describe('ContentObserver injectable', () => {
  describe('basic usage', () => {
    let callbacks: Function[];
    let invokeCallbacks = (args?: any) => callbacks.forEach(callback => callback(args));
    let contentObserver: ContentObserver;

    beforeEach(fakeAsync(() => {
      callbacks = [];

      TestBed.configureTestingModule({
        imports: [ObserversModule, UnobservedComponentWithTextContent],
        providers: [
          {
            provide: MutationObserverFactory,
            useValue: {
              create: function (callback: Function) {
                callbacks.push(callback);
                return {
                  observe: () => {},
                  disconnect: () => {},
                };
              },
            },
          },
        ],
      });
    }));

    beforeEach(inject([ContentObserver], (co: ContentObserver) => {
      contentObserver = co;
    }));

    it('should trigger the callback when the content of the element changes', fakeAsync(() => {
      const spy = jasmine.createSpy('content observer');
      const fixture = TestBed.createComponent(UnobservedComponentWithTextContent);
      fixture.detectChanges();

      contentObserver.observe(fixture.componentInstance.contentEl).subscribe(() => spy());

      expect(spy).not.toHaveBeenCalled();

      fixture.componentInstance.text = 'text';
      invokeCallbacks([{type: 'fake'}]);

      expect(spy).toHaveBeenCalled();
    }));

    it('should only create one MutationObserver when observing the same element twice', fakeAsync(
      inject([MutationObserverFactory], (mof: MutationObserverFactory) => {
        const spy = jasmine.createSpy('content observer');
        spyOn(mof, 'create').and.callThrough();
        const fixture = TestBed.createComponent(UnobservedComponentWithTextContent);
        fixture.detectChanges();

        const sub1 = contentObserver
          .observe(fixture.componentInstance.contentEl)
          .subscribe(() => spy());
        contentObserver.observe(fixture.componentInstance.contentEl).subscribe(() => spy());

        expect(mof.create).toHaveBeenCalledTimes(1);

        fixture.componentInstance.text = 'text';
        invokeCallbacks([{type: 'fake'}]);

        expect(spy).toHaveBeenCalledTimes(2);

        spy.calls.reset();
        sub1.unsubscribe();
        fixture.componentInstance.text = 'text text';
        invokeCallbacks([{type: 'fake'}]);

        expect(spy).toHaveBeenCalledTimes(1);
      }),
    ));
  });

  describe('real behavior', () => {
    let spy: jasmine.Spy;
    let contentEl: HTMLElement;
    let contentObserver: ContentObserver;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [ObserversModule, UnobservedComponentWithTextContent],
      });

      const fixture = TestBed.createComponent(UnobservedComponentWithTextContent);
      fixture.autoDetectChanges();
      spy = jasmine.createSpy('content observer');
      contentObserver = TestBed.inject(ContentObserver);
      contentEl = fixture.componentInstance.contentEl.nativeElement;
      contentObserver.observe(contentEl).subscribe(spy);
    }));

    it('should ignore addition or removal of comments', waitForAsync(async () => {
      const comment = document.createComment('cool');
      await new Promise(r => setTimeout(r));

      spy.calls.reset();
      contentEl.appendChild(comment);
      await new Promise(r => setTimeout(r));
      expect(spy).not.toHaveBeenCalled();

      comment.remove();
      await new Promise(r => setTimeout(r));
      expect(spy).not.toHaveBeenCalled();
    }));

    it('should not ignore addition or removal of text', waitForAsync(async () => {
      const text = document.createTextNode('cool');
      await new Promise(r => setTimeout(r));

      spy.calls.reset();
      contentEl.appendChild(text);
      await new Promise(r => setTimeout(r));
      expect(spy).toHaveBeenCalled();

      spy.calls.reset();
      text.remove();
      await new Promise(r => setTimeout(r));
      expect(spy).toHaveBeenCalled();
    }));

    it('should ignore comment content change', waitForAsync(async () => {
      const comment = document.createComment('cool');
      contentEl.appendChild(comment);
      await new Promise(r => setTimeout(r));

      spy.calls.reset();
      comment.textContent = 'beans';
      await new Promise(r => setTimeout(r));
      expect(spy).not.toHaveBeenCalled();
    }));

    it('should not ignore text content change', waitForAsync(async () => {
      const text = document.createTextNode('cool');
      contentEl.appendChild(text);
      await new Promise(r => setTimeout(r));

      spy.calls.reset();
      text.textContent = 'beans';
      await new Promise(r => setTimeout(r));
      expect(spy).toHaveBeenCalled();
    }));
  });
});

@Component({
  template: `
    <div
      (cdkObserveContent)="doSomething()"
      [cdkObserveContentDisabled]="disabled">{{text}}</div>
  `,
  imports: [ObserversModule],
})
class ComponentWithTextContent {
  text = '';
  disabled = false;
  doSomething() {}
}

@Component({
  template: `<div (cdkObserveContent)="doSomething()"><div>{{text}}</div></div>`,
  imports: [ObserversModule],
})
class ComponentWithChildTextContent {
  text = '';
  doSomething() {}
}

@Component({
  template: `<div (cdkObserveContent)="spy($event)" [debounce]="debounce">{{text}}</div>`,
  imports: [ObserversModule],
})
class ComponentWithDebouncedListener {
  debounce = 500;
  spy = jasmine.createSpy('MutationObserver callback');
}

@Component({
  template: `<div #contentEl>{{text}}</div>`,
  imports: [ObserversModule],
})
class UnobservedComponentWithTextContent {
  @ViewChild('contentEl') contentEl: ElementRef;
  text = '';
}
