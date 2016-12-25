import {Component} from '@angular/core';
import {async, TestBed, ComponentFixture} from '@angular/core/testing';
import {ObserveContentModule} from './observe-content';

// TODO(elad): `ProxyZone` doesn't seem to capture the events raised by
// `MutationObserver` and needs to be investigated

describe('Observe content', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ObserveContentModule],
      declarations: [
        ComponentWithTextContent,
        ComponentWithChildTextContent,
        ComponentWithDebouncedListener
      ],
    });

    TestBed.compileComponents();
  }));

  describe('text content change', () => {
    it('should call the registered for changes function', done => {
      let fixture = TestBed.createComponent(ComponentWithTextContent);
      fixture.detectChanges();

      // If the hint label is empty, expect no label.
      const spy = spyOn(fixture.componentInstance, 'doSomething').and.callFake(() => {
        expect(spy.calls.any()).toBe(true);
        done();
      });

      expect(spy.calls.any()).toBe(false);

      fixture.componentInstance.text = 'text';
      fixture.detectChanges();
    });
  });

  describe('child text content change', () => {
    it('should call the registered for changes function', done => {
      let fixture = TestBed.createComponent(ComponentWithChildTextContent);
      fixture.detectChanges();

      // If the hint label is empty, expect no label.
      const spy = spyOn(fixture.componentInstance, 'doSomething').and.callFake(() => {
        expect(spy.calls.any()).toBe(true);
        done();
      });

      expect(spy.calls.any()).toBe(false);

      fixture.componentInstance.text = 'text';
      fixture.detectChanges();
    });
  });

  // Note that these tests need to use real timeouts, instead of fakeAsync, because Angular doens't
  // mock out the MutationObserver, in addition to it being async. Perhaps we should find a way to
  // stub the MutationObserver for tests?
  describe('debounced', () => {
    let fixture: ComponentFixture<ComponentWithDebouncedListener>;
    let instance: ComponentWithDebouncedListener;

    const setText = (text: string, delay: number) => {
      setTimeout(() => {
        instance.text = text;
        fixture.detectChanges();
      }, delay);
    };

    beforeEach(() => {
      fixture = TestBed.createComponent(ComponentWithDebouncedListener);
      instance = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should debounce the content changes', (done: any) => {
      setText('a', 5);
      setText('b', 10);
      setText('c', 15);

      setTimeout(() => {
        expect(instance.spy).toHaveBeenCalledTimes(1);
        done();
      }, 50);
    });

    it('should should keep track of all of the mutation records', (done: any) => {
      setText('a', 5);
      setText('b', 10);
      setText('c', 15);

      setTimeout(() => {
        expect(instance.spy.calls.mostRecent().args[0].length).toBeGreaterThanOrEqual(1);
        done();
      }, 50);
    });
  });
});


@Component({ template: `<div (cdkObserveContent)="doSomething()">{{text}}</div>` })
class ComponentWithTextContent {
  text = '';
  doSomething() {}
}

@Component({ template: `<div (cdkObserveContent)="doSomething()"><div>{{text}}<div></div>` })
class ComponentWithChildTextContent {
  text = '';
  doSomething() {}
}

@Component({
  template: `<div (cdkObserveContent)="spy($event)" [debounce]="debounce">{{text}}</div>`
})
class ComponentWithDebouncedListener {
  text = '';
  debounce = 15;
  spy = jasmine.createSpy('MutationObserver callback');
}
