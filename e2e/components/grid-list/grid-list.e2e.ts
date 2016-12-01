import {browser} from 'protractor';
import {E2EUtils} from '../../utils.e2e';

describe('grid-list', () => {
  const utils = new E2EUtils();

  beforeEach(() => browser.get('/grid-list'));

  it('should render a grid list container', () => {
    utils.expectToExist('md-grid-list');
  });

  it('should render list items inside the grid list container', () => {
    utils.expectToExist('md-grid-list md-grid-tile');
  });
});
