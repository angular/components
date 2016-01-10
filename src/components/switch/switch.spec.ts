import {
  it,
  iit,
  describe,
  ddescribe,
  expect,
  inject,
  injectAsync,
  TestComponentBuilder,
  beforeEachProviders,
  beforeEach,
} from 'angular2/testing';
import {provide, Component} from 'angular2/core';
import {DebugElement} from "angular2/core";
import {MdSwitch} from './switch';
import {AsyncTestFn} from "angular2/testing";
import {FORM_DIRECTIVES} from "angular2/common";
import {Input} from "angular2/core";


describe('MdSwitch', () => {
  let builder: TestComponentBuilder;

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => { builder = tcb; }));

  describe('md-switch', () => {
    it('should change the model value', (done: () => void) => {
      return builder.createAsync(TestApp).then((fixture) => {
        let testComponent = fixture.debugElement.componentInstance;
        let switchElement = getChildDebugElement(fixture.debugElement, 'md-switch');

        expect(switchElement.nativeElement.classList.contains('md-checked')).toBe(false);

        testComponent.testSwitch = true;

        fixture.detectChanges();

        expect(switchElement.nativeElement.classList.contains('md-checked')).toBe(true);
        done();
      });
    });
  });
});

/** Gets a child DebugElement by tag name. */
function getChildDebugElement(parent: DebugElement, tagName: string): DebugElement {
  return parent.query(debugEl => debugEl.nativeElement.tagName.toLowerCase() == tagName);
}

/** Test component that contains an MdSwitch. */
@Component({
  selector: 'test-app',
  directives: [MdSwitch, FORM_DIRECTIVES],
  template:
    '<md-switch [(ngModel)]="testSwitch">Test Switch</md-switch>',
})
class TestApp {
  testSwitch = false;
}
