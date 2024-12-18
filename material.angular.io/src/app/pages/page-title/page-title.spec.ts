import {ComponentPageTitle} from './page-title';
import {Title} from '@angular/platform-browser';

describe('ComponentPageTitle', () => {
  const title: Title = new Title({});
  const service: ComponentPageTitle = new ComponentPageTitle(title);

  it('should initialize title to empty string', () => {
    expect(service._title).toEqual('');
    expect(service.title).toEqual('');
  });
});
