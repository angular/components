describe('slide-toggle', () => {
    beforeEach(() => browser.get('/slide-toggle'));
    
    describe('check behavior', () => {
        it('should be checked when clicked, and  be unchecked when clicked again', () => {
            element(by.id('test-slide-toggle')).click();
            element(by.css('input[id=test-slide-toggle-input]'))
                .getAttribute('checked')
                .then((value: string) => {
                    expect(value).toBeTruthy('Expect slide toggle "checked" property to be true');
                });

            element(by.id('test-slide-toggle')).click();
            element(by.css('input[id=test-slide-toggle-input]'))
                .getAttribute('checked')
                .then((value: string) => {
                    expect(value).toBeFalsy('Expect slide toggle "check" property to be false');
                });
        });
    });

    describe('disable behavior', () => {
        it('should prevent click handlers from executing when disabled', () => {
            element(by.id('disable-toggle')).click();
            element(by.id('test-slide-toggle')).click();
            element(by.css('input[id=test-slide-toggle-input]'))
                .getAttribute('checked')
                .then((value: string) => {
                    expect(value).toBeFalsy('Expect slide toggle "check" property to be false');
                });
        });
    });
});