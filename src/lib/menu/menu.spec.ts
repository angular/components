import {TestBed, async} from '@angular/core/testing';
import {Component} from '@angular/core';
import {MatMenuModule} from './menu';


describe('MatMenu', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatMenuModule.forRoot()],
      declarations: [TestMenu],
    });

    TestBed.compileComponents();
  }));

  it('should add and remove focus class on focus/blur', () => {
    let fixture = TestBed.createComponent(TestMenu);
    expect(fixture).toBeTruthy();
  });
});

@Component({template: ``})
class TestMenu {}
