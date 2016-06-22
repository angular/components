import {
    describe,
    inject
} from '@angular/core/testing';
import {TestComponentBuilder} from '@angular/compiler/testing';
import {Component} from '@angular/core';
import {MdSlider} from './slider';

describe('MdSlider', () => {
  let builder: TestComponentBuilder;

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    builder = tcb;
  }));

  describe('standard slider', () => {
  });
});


@Component({
  directives: [[MdSlider]],
  template: `
  <md-slider></md-slider>
  `
})
class StandardSlider { }
