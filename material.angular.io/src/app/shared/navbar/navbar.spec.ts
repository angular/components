import {async, TestBed, ComponentFixture} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {MaterialModule} from '@angular/material';

import {NavBar} from './navbar';


describe('NavBar', () => {
  let fixture: ComponentFixture<NavBar>;
  let component: NavBar;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [NavBar],
    });

    fixture = TestBed.createComponent(NavBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should have a link to material github', () => {
    const githublink = 'https://github.com/angular/material2';
    const links = fixture
      .nativeElement.querySelectorAll('.docs-navbar .mat-button');
    const link  = links[links.length - 1];
    expect(link.getAttribute('href')).toEqual(githublink);
  });
});
