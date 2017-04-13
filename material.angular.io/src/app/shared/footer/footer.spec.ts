import {async, TestBed, ComponentFixture} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {MaterialModule} from '@angular/material';

import {Footer} from './footer';


describe('Footer', () => {
  let fixture: ComponentFixture<Footer>;
  let component: Footer;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModule],
      declarations: [Footer],
    });

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should have a link to angular.io', () => {
    const link = fixture
      .nativeElement
      .querySelector('.docs-footer-links a');
    const href = link.getAttribute('href');
    const text = link.textContent;
    expect(href).toContain('angular.io');
    expect(text).toContain('Learn Angular');
  });
});
