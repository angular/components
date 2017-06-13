import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {MdPaginatorModule} from './index';

describe('CdkTable', () => {
  let fixture: ComponentFixture<SimpleMdPaginatorApp>;

  let component: SimpleMdPaginatorApp;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdPaginatorModule],
      declarations: [SimpleMdPaginatorApp],
    }).compileComponents();

    fixture = TestBed.createComponent(SimpleMdPaginatorApp);

    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should initially fail', () => {
    expect(true).toBe(false);
  });
});

@Component({
  template: `
    <md-paginator></md-paginator>
  `
})
class SimpleMdPaginatorApp {

}