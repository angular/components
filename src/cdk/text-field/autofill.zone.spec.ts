import {Component, ElementRef, NgZone, ViewChild, provideZoneChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed, inject} from '@angular/core/testing';
import {AutofillMonitor} from './autofill';
import {TextFieldModule} from './text-field-module';

describe('AutofillMonitor', () => {
  let autofillMonitor: AutofillMonitor;
  let fixture: ComponentFixture<Inputs>;
  let testComponent: Inputs;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZoneChangeDetection()],
      imports: [TextFieldModule, Inputs],
    }).compileComponents();
  });

  beforeEach(inject([AutofillMonitor], (afm: AutofillMonitor) => {
    autofillMonitor = afm;
    fixture = TestBed.createComponent(Inputs);
    testComponent = fixture.componentInstance;
    fixture.detectChanges();

    for (const input of [testComponent.input1, testComponent.input2, testComponent.input3]) {
      spyOn(input.nativeElement, 'addEventListener');
      spyOn(input.nativeElement, 'removeEventListener');
    }
  }));

  it('should emit on stream inside the NgZone', () => {
    const inputEl = testComponent.input1.nativeElement;
    let animationStartCallback: Function = () => {};
    inputEl.addEventListener.and.callFake(
      (_: string, cb: Function) => (animationStartCallback = cb),
    );
    const autofillStream = autofillMonitor.monitor(inputEl);
    const spy = jasmine.createSpy('autofill spy');

    autofillStream.subscribe(() => spy(NgZone.isInAngularZone()));
    expect(spy).not.toHaveBeenCalled();

    animationStartCallback({animationName: 'cdk-text-field-autofill-start', target: inputEl});
    expect(spy).toHaveBeenCalledWith(true);
  });
});

@Component({
  template: `
      <input #input1>
      <input #input2>
      <input #input3>
    `,
  standalone: true,
  imports: [TextFieldModule],
})
class Inputs {
  // Cast to `any` so we can stub out some methods in the tests.
  @ViewChild('input1') input1: ElementRef<any>;
  @ViewChild('input2') input2: ElementRef<any>;
  @ViewChild('input3') input3: ElementRef<any>;
}
