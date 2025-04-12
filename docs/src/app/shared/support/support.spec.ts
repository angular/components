import {ComponentFixture, TestBed} from '@angular/core/testing';

import {Support} from './support';

describe('HelpSupportComponent', () => {
  let component: Support;
  let fixture: ComponentFixture<Support>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Support);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
