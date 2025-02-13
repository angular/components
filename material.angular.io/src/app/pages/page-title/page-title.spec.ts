import {Title} from '@angular/platform-browser';
import {TestBed} from '@angular/core/testing';
import {ComponentPageTitle} from './page-title';

describe('ComponentPageTitle', () => {
  let service: ComponentPageTitle;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{provide: Title, useValue: new Title({})}],
    });
    service = TestBed.inject(ComponentPageTitle);
  });

  it('should initialize title to empty string', () => {
    expect(service._title).toEqual('');
    expect(service.title).toEqual('');
  });
});
