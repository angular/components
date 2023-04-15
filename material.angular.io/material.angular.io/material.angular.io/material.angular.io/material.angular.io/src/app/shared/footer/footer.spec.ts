import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';

import {Footer} from './footer';
import {DocsAppTestingModule} from '../../testing/testing-module';


describe('Footer', () => {
  let fixture: ComponentFixture<Footer>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DocsAppTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
  });

  it('should have a link to angular.io', () => {
    const link = fixture.nativeElement.querySelector('.docs-footer-logo a');
    const href = link.getAttribute('href');
    const text = link.textContent;
    expect(href).toContain('angular.io');
    expect(text).toContain('Learn Angular');
  });
});
