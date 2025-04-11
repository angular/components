import {Platform} from '../../platform';
import {patchElementFocus} from '../../testing/private';
import {Component, NgZone, provideZoneChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {A11yModule} from '../a11y-module';
import {FocusMonitor} from './focus-monitor';

describe('FocusMonitor observable stream Zone.js integration', () => {
  let fixture: ComponentFixture<PlainButton>;
  let buttonElement: HTMLElement;
  let focusMonitor: FocusMonitor;
  let fakePlatform: Platform;

  beforeEach(() => {
    fakePlatform = {isBrowser: true} as Platform;
    TestBed.configureTestingModule({
      imports: [A11yModule, PlainButton],
      providers: [{provide: Platform, useValue: fakePlatform}, provideZoneChangeDetection()],
    });
    fixture = TestBed.createComponent(PlainButton);
    focusMonitor = TestBed.inject(FocusMonitor);
    fixture.detectChanges();
    buttonElement = fixture.debugElement.nativeElement.querySelector('button');
    patchElementFocus(buttonElement);
  });

  it('should emit inside the NgZone', fakeAsync(() => {
    const spy = jasmine.createSpy('zone spy');
    focusMonitor.monitor(buttonElement).subscribe(() => spy(NgZone.isInAngularZone()));
    expect(spy).not.toHaveBeenCalled();

    buttonElement.focus();
    fixture.detectChanges();
    tick();
    expect(spy).toHaveBeenCalledWith(true);
  }));
});

@Component({
  template: `<div class="parent"><button>focus me!</button></div>`,
  imports: [A11yModule],
})
class PlainButton {}
