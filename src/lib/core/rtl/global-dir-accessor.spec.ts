import {TestBed, ComponentFixture} from '@angular/core/testing';
import {Component, Injector} from '@angular/core';
import {RtlModule, Dir, GlobalDirAccessor, LayoutDirection} from './index';
import {By} from '@angular/platform-browser';

describe('Dir', () => {
  let fixture: ComponentFixture<DivWithDir>;
  let div: HTMLTextAreaElement;
  let dir: Dir;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RtlModule.forRoot()],
      declarations: [DivWithDir]
    });

    TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DivWithDir);
    fixture.detectChanges();

    div = fixture.nativeElement.querySelector('div');
    dir = fixture.debugElement.query(
      By.directive(Dir)).injector.get(Dir);
  });

  fit('should resize the textarea based on its content', () => {
    console.log(fixture.componentInstance.activeLayoutDirection);
  });
});

@Component({
  template: `<div dir="rtl"></div>`,
})
class DivWithDir {
  private _dir: LayoutDirection;

  constructor(public activeLayoutDirection: GlobalDirAccessor,
              _injector: Injector) {
    activeLayoutDirection.getActiveDirection(_injector)
      .then(direction => this._dir = direction);
  }
}
