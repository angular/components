import {browser} from 'protractor';
import {E2EUtils} from '../../utils.e2e';

describe('list', () => {
  const utils = new E2EUtils();

  beforeEach(() => browser.get('/list'));

  it('should render a list container', () => {
    utils.expectToExist('md-list');
  });

  it('should render list items inside the list container', () => {
    utils.expectToExist('md-list md-list-item');
  });
});
