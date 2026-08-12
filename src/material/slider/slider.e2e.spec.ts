/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {waitForAngularReady} from '../../cdk/testing/selenium-webdriver';
import {createE2eWebDriver} from '../../e2e-app/e2e-setup';

const {builder, port} = createE2eWebDriver();

describe('MatSlider E2E', () => {
  let wd: webdriver.WebDriver;

  const getStandardSlider = () => wd.findElement(webdriver.By.id('standard-slider'));
  const getDisabledSlider = () => wd.findElement(webdriver.By.id('disabled-slider'));
  const getRangeSlider = () => wd.findElement(webdriver.By.id('range-slider'));

  beforeAll(async () => {
    wd = await builder.build();
  });

  afterAll(async () => {
    await wd.quit();
  });

  beforeEach(async () => {
    await wd.get(`http://localhost:${port}/slider`);
    await waitForAngularReady(wd);
  });

  describe('standard slider', () => {
    let slider: webdriver.WebElement;
    beforeEach(() => {
      slider = getStandardSlider();
    });

    it('should update the value on click', async () => {
      await setValueByClick(slider, 49);
      expect(await getSliderValue(slider, Thumb.END)).toBe(49);
    });

    it('should update the value on slide', async () => {
      await slideToValue(slider, 35, Thumb.END);
      expect(await getSliderValue(slider, Thumb.END)).toBe(35);
    });

    it('should display the value indicator when focused', async () => {
      await focusSliderThumb(slider, Thumb.END);
      const indicator = await wd.findElement(webdriver.By.css('.mdc-slider__value-indicator'));
      const rect: DOMRect = await wd.executeScript(
        'return arguments[0].getBoundingClientRect();',
        indicator,
      );

      expect(rect.width).not.toBe(0);
      expect(rect.height).not.toBe(0);

      await wd.actions().mouseUp().perform();
    });

    it('should not cause passive event listener errors when changing the value', async () => {
      // retrieving the logs clears the collection
      await wd.manage().logs().get(webdriver.logging.Type.BROWSER);
      await setValueByClick(slider, 15);

      const logs = await wd.manage().logs().get(webdriver.logging.Type.BROWSER);
      expect(logs).not.toContain(jasmine.objectContaining({level: webdriver.logging.Level.SEVERE}));
    });
  });

  describe('disabled slider', () => {
    let slider: webdriver.WebElement;
    beforeEach(() => {
      slider = getDisabledSlider();
    });

    it('should not update the value on click', async () => {
      await setValueByClick(slider, 15);
      expect(await getSliderValue(slider, Thumb.END)).not.toBe(15);
    });

    it('should not update the value on slide', async () => {
      await slideToValue(slider, 35, Thumb.END);
      expect(await getSliderValue(slider, Thumb.END)).not.toBe(35);
    });
  });

  describe('range slider', () => {
    let slider: webdriver.WebElement;
    beforeEach(() => {
      slider = getRangeSlider();
    });

    it('should update the start thumb value on slide', async () => {
      await slideToValue(slider, 35, Thumb.START);
      expect(await getSliderValue(slider, Thumb.START)).toBe(35);
    });

    it('should update the end thumb value on slide', async () => {
      await slideToValue(slider, 55, Thumb.END);
      expect(await getSliderValue(slider, Thumb.END)).toBe(55);
    });

    it(
      'should update the start thumb value on click between thumbs ' +
        'but closer to the start thumb',
      async () => {
        await setValueByClick(slider, 49);
        expect(await getSliderValue(slider, Thumb.START)).toBe(49);
        expect(await getSliderValue(slider, Thumb.END)).toBe(100);
      },
    );

    it(
      'should update the end thumb value on click between thumbs ' + 'but closer to the end thumb',
      async () => {
        await setValueByClick(slider, 51);
        expect(await getSliderValue(slider, Thumb.START)).toBe(0);
        expect(await getSliderValue(slider, Thumb.END)).toBe(51);
      },
    );
  });

  /** Returns the current value of the slider. */
  async function getSliderValue(
    slider: webdriver.WebElement,
    thumbPosition: Thumb,
  ): Promise<number> {
    const inputs = await slider.findElements(webdriver.By.css('.mdc-slider__input'));
    return thumbPosition === Thumb.END
      ? Number(await inputs[inputs.length - 1].getAttribute('value'))
      : Number(await inputs[0].getAttribute('value'));
  }

  /** Focuses on the MatSlider at the coordinates corresponding to the given thumb. */
  async function focusSliderThumb(
    slider: webdriver.WebElement,
    thumbPosition: Thumb,
  ): Promise<void> {
    const inputs = await slider.findElements(webdriver.By.css('.mdc-slider__input'));
    const input = thumbPosition === Thumb.END ? inputs[inputs.length - 1] : inputs[0];
    await wd.executeScript('arguments[0].focus();', input);
    const coords = await getCoordsForValue(slider, await getSliderValue(slider, thumbPosition));
    return await wd.actions().mouseMove(slider, coords).mouseDown().perform();
  }

  /** Clicks on the MatSlider at the coordinates corresponding to the given value. */
  async function setValueByClick(slider: webdriver.WebElement, value: number): Promise<void> {
    return clickElementAtPoint(slider, await getCoordsForValue(slider, value));
  }

  /** Clicks on the MatSlider at the coordinates corresponding to the given value. */
  async function slideToValue(
    slider: webdriver.WebElement,
    value: number,
    thumbPosition: Thumb,
  ): Promise<void> {
    const startCoords = await getCoordsForValue(
      slider,
      await getSliderValue(slider, thumbPosition),
    );
    const endCoords = await getCoordsForValue(slider, value);
    return await wd
      .actions()
      .mouseMove(slider, startCoords)
      .mouseDown()
      .mouseMove(slider, endCoords)
      .mouseUp()
      .perform();
  }

  /** Returns the x and y coordinates for the given slider value. */
  async function getCoordsForValue(slider: webdriver.WebElement, value: number): Promise<Point> {
    const inputs = await slider.findElements(webdriver.By.css('.mdc-slider__input'));

    const min = Number(await inputs[0].getAttribute('min'));
    const max = Number(await inputs[inputs.length - 1].getAttribute('max'));
    const percent = (value - min) / (max - min);

    const {width, height} = await slider.getSize();

    const x = Math.round(width * percent);
    const y = Math.round(height / 2);

    return {x, y};
  }

  /**
   * Clicks an element at a specific point. Useful if there's another element
   * that covers part of the target and can catch the click.
   */
  async function clickElementAtPoint(target: webdriver.WebElement, coords: Point) {
    await wd.actions().mouseMove(target, coords).click().perform();
  }
});

enum Thumb {
  START = 1,
  END = 2,
}

interface Point {
  x: number;
  y: number;
}
