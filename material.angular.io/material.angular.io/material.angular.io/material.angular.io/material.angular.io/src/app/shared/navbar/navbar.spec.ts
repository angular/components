import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {NavBar, NavBarModule} from './navbar';
import {DocsAppTestingModule} from '../../testing/testing-module';


describe('NavBar', () => {
  let fixture: ComponentFixture<NavBar>;
  let component: NavBar;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NavBarModule, DocsAppTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have a link to material github', () => {
    const githublink = 'https://github.com/angular/material2';
    const links = fixture
      .nativeElement.querySelectorAll('.docs-navbar .mat-button');
    const link  = links[links.length - 1];
    expect(link.getAttribute('href')).toEqual(githublink);
  });
});
