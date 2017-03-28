import { Component } from '@angular/core';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MdFooterModule } from './index';


describe('MdFooter', () => {
  let footerElement: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdFooterModule.forRoot()]
    });
    TestBed.compileComponents();
  }));
});
