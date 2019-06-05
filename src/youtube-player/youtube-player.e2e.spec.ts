import {browser, by, element, ExpectedConditions} from 'protractor';

describe('youtube-player', () => {
  let originalTimeout: number;

  beforeEach(function() {
    // Increase timeout to let the youtube script load
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
  });

  beforeEach(async () => await browser.get('/youtube-player'));

  afterEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  it('should load a youtube player in an iframe', async () => {
    // The YouTube iframe doesn't have Angular, which causes protractor to hang.
    browser.ignoreSynchronization = true;
    await browser.wait(
      ExpectedConditions.presenceOf(element(by.css('youtube-player iframe'))));
  });
});
