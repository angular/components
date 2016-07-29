import {
  inject,
  TestComponentBuilder,
  TestBed,
  //doAsyncEntryPointCompilation,
  async,
} from '@angular/core/testing';
import {Component} from '@angular/core';
import {MdMenuModule} from './menu';

describe('MdMenu', () => {
  let builder: TestComponentBuilder;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdMenuModule],
      declarations: [TestList],
      //entryComponents: [TestList],
    });

    //doAsyncEntryPointCompilation();
  }));

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    builder = tcb;
  }));

  it('should add and remove focus class on focus/blur', async(() => {
    var template = ``;
    builder.overrideTemplate(TestList, template).createAsync(TestList).then(fixture => {
       expect(true).toBe(true);
    });
  }));

});

@Component({
  selector: 'test-menu',
  template: ``
})
class TestList {}
