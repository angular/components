import {async, inject, TestBed, ComponentFixture} from '@angular/core/testing';
import {ComponentPageTitle} from './page-title';


describe('ComponentPageTitle', () => {
  const service: ComponentPageTitle = new ComponentPageTitle();

  it('should initialize title to empty string', () => {
    expect(service._title).toEqual('');
    expect(service.title).toEqual('');
  });
});
