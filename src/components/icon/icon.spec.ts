import {
  inject,
  TestComponentBuilder
} from 'angular2/testing';
import {
  it,
  describe,
  expect,
  beforeEach,
} from '../../core/facade/testing';
import {Component} from 'angular2/core';
import {By} from 'angular2/platform/browser';

import {MdIcon} from './icon';
import {MdIconProvider} from './icon-provider';

export function main() {
  describe('MdIcon', () => {
    let builder: TestComponentBuilder;

    beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
      builder = tcb;
    }));
  });
}