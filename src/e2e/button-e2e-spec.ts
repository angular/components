describe('protractor sanity test', function() {
  var url = 'index.html';

  beforeEach(() => { browser.get(url); });

  it('should sanity check the demo-app', () => {
    var button = element.all(by.css('button')).first();
    expect(button.getAttribute('md-button')).toBeDefined();
  });
});
