import {browser} from 'protractor';
import {E2EUtils} from '../../utils.e2e';

describe('progress-bar', () => {
  const utils = new E2EUtils();

  beforeEach(() => browser.get('/progress-bar'));

  it('should render a determinate progress bar', () => {
    utils.expectToExist('md-progress-bar[mode="determinate"]');
  });

  it('should render a buffer progress bar', () => {
    utils.expectToExist('md-progress-bar[mode="buffer"]');
  });

  it('should render a query progress bar', () => {
    utils.expectToExist('md-progress-bar[mode="query"]');
  });

  it('should render a indeterminate progress bar', () => {
    utils.expectToExist('md-progress-bar[mode="indeterminate"]');
  });
});
