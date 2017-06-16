import {browser, element, by, Key, ExpectedConditions} from 'protractor';
import {expectToExist} from '../../util/index';
import {screenshot} from '../../screenshot';
import {getScrollPosition} from '../../util/index';

describe('sticky-header', () => {
    describe('test sticky-header', () => {
        beforeEach(() => browser.get('/sticky-header'));

        fit('should get the right sticky-header element', () => {
            let stickyParent = element(by.id('sticky-region'));
            let stickyHeader = element(by.id('sticky-header'));
            console.log(stickyHeader);
            let scrollable = element(by.id('scrollable-container'));
            scrollable.scrollTop += 200;
            expect(stickyHeader.getAttribute('cdkStickyHeader')).toBe('');
        });

        fit('should get the right sticky-parent element', () => {
            let stickyParent = element(by.id('sticky-region'));
            let stickyHeader = element(by.id('sticky-header'));
            let scrollable = element(by.id('scrollable-container'));
            scrollable.scrollTop += 200;
            expect(stickyParent.getAttribute('cdkStickyRegion')).toBe('');
        });

        it('should open a dialog inside a fullscreen element and move it to the document body', () => {
            let scrollable = element(by.id('scrollable-container'));
            element(by.id('click-to-scroll')).click();

            console.log(scrollable.scrollTop);

        });



    });

});
