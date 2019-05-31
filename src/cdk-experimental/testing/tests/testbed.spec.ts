import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {getNativeElement, load} from '../testbed';
import {MainComponentHarness} from './harnesses/main-component-harness';

import {TestComponentsModule} from './test-components-module';
import {TestMainComponent} from './test-main-component';

describe('Testbed Helper Test:', () => {
  let harness: MainComponentHarness;
  let fixture: ComponentFixture<{}>;
  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        imports: [TestComponentsModule],
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(TestMainComponent);
        harness = load(MainComponentHarness, fixture);
      });
  }));

  describe('Locator ', () => {
    it('should be able to locate a element based on css selector', async () => {
      const title = await harness.title();
      expect(await title.text()).toEqual('Main Component');
    });

    it('should be able to locate all elements based on css selector',
      async () => {
        const labels = await harness.allLabels();
        expect(labels.length).toEqual(2);
        expect(await labels[0].text()).toEqual('Count:');
        expect(await labels[1].text()).toEqual('AsyncCounter:');
      });

    it('should be able to locate the sub harnesses', async () => {
      const items = await harness.getTestTools();
      expect(items.length).toEqual(3);
      expect(await items[0].text()).toEqual('Protractor');
      expect(await items[1].text()).toEqual('TestBed');
      expect(await items[2].text()).toEqual('Other');
    });

    it('should be able to locate all sub harnesses', async () => {
      const alllists = await harness.allLists();
      const items1 = await alllists[0].getItems();
      const items2 = await alllists[1].getItems();
      expect(alllists.length).toEqual(2);
      expect(items1.length).toEqual(3);
      expect(await items1[0].text()).toEqual('Protractor');
      expect(await items1[1].text()).toEqual('TestBed');
      expect(await items1[2].text()).toEqual('Other');
      expect(items2.length).toEqual(3);
      expect(await items2[0].text()).toEqual('Unit Test');
      expect(await items2[1].text()).toEqual('Integration Test');
      expect(await items2[2].text()).toEqual('Performance Test');
    });
  });

  describe('Test element ', () => {
    it('should be able to clear', async () => {
      const input = await harness.input();
      await input.sendKeys('Yi');
      expect(await input.getAttribute('value')).toEqual('Yi');

      await input.clear();
      expect(await input.getAttribute('value')).toEqual('');
    });

    it('should be able to click', async () => {
      const counter = await harness.counter();
      expect(await counter.text()).toEqual('0');
      await harness.increaseCounter(3);
      expect(await counter.text()).toEqual('3');
    });

    it('should be able to send key', async () => {
      const input = await harness.input();
      const value = await harness.value();
      await input.sendKeys('Yi');

      expect(await input.getAttribute('value')).toEqual('Yi');
      expect(await value.text()).toEqual('Input:Yi');
    });

    it('focuses the element before sending key', async () => {
      const input = await harness.input();
      await input.sendKeys('Yi');
      expect(await input.getAttribute('id'))
        .toEqual(document.activeElement!.id);
    });

    it('should be able to hover', async () => {
      const host = await harness.host();
      let classAttr = await host.getAttribute('class');
      expect(classAttr).not.toContain('hovering');
      await host.hover();
      classAttr = await host.getAttribute('class');
      expect(classAttr).toContain('hovering');
    });

    it('should be able to getAttribute', async () => {
      const memoStr = `
        This is an example that shows how to use component harness
        You should use getAttribute('value') to retrieve the text in textarea
      `;
      const memo = await harness.memo();
      await memo.sendKeys(memoStr);
      expect(await memo.getAttribute('value')).toEqual(memoStr);
    });

    it('should be able to getCssValue', async () => {
      const title = await harness.title();
      expect(await title.getCssValue('height')).toEqual('50px');
    });
  });

  describe('Async operation ', () => {
    it('should wait for async opeartion to complete', async () => {
      const asyncCounter = await harness.asyncCounter();
      expect(await asyncCounter.text()).toEqual('5');
      await harness.increaseCounter(3);
      expect(await asyncCounter.text()).toEqual('8');
    });
  });

  describe('Allow null ', () => {
    it('should allow element to be null when setting allowNull', async () => {
      expect(await harness.nullItem()).toBe(null);
    });

    it('should allow harness to be null when setting allowNull', async () => {
      expect(await harness.nullComponentHarness()).toBe(null);
    });
  });

  describe('Throw error ', () => {
    it('should show the correct error', async () => {
      try {
        await harness.errorItem();
        fail('Should throw error');
      } catch (err) {
        expect(err.message)
          .toEqual(
            'Cannot find element based on the css selector: wrong locator');
      }
    });
  });

  describe('getNativeElement', () => {
    it('should return the native element', async () => {
      expect(getNativeElement(harness.host())).toEqual(fixture.nativeElement);
    });
  });
});
