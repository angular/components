import {A11yModule, AriaDescriber} from '@angular/cdk/a11y';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';

fdescribe('AriaDescriber', () => {
  let ariaDescriber: AriaDescriber;
  let fixture: ComponentFixture<TestApp>;

  describe('with default element', () => {

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [A11yModule],
        declarations: [TestApp],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(TestApp);
    });

    it('should test', () => {
      console.log(fixture.componentInstance.ariaDescriber);
    });
  });
});

@Component({template: `<div #element1></div>`})
class TestApp {
  constructor(public ariaDescriber: AriaDescriber) { }
}
