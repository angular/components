import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {NavBar, NavBarModule} from './navbar';
import {DocsAppTestingModule} from '../../testing/testing-module';


describe('NavBar', () => {
  let fixture: ComponentFixture<NavBar>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NavBarModule, DocsAppTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavBar);
    fixture.detectChanges();
  });

  // Note: Add tests as logic is added to navbar class.
});
