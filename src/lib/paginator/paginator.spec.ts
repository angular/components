import {async, TestBed} from '@angular/core/testing';
import {MdPaginatorModule} from './index';
import {Component} from '@angular/core';

describe('MdPaginator', () => {
  let x = 0;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdPaginatorModule],
      declarations: [MdPaginatorApp],
    }).compileComponents();
  }));

  it('should test', () => {
    expect(true).toBe(false);
  });
});

@Component({
  template: `
    test
  `
})
class MdPaginatorApp {
}