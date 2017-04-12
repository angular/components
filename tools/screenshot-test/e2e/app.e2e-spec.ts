import { ScreenshotTestPage } from './app.po';

describe('screenshot-test App', function() {
  let page: ScreenshotTestPage;

  beforeEach(() => {
    page = new ScreenshotTestPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
