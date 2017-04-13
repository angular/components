import {async, TestBed, ComponentFixture} from '@angular/core/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterTestingModule} from '@angular/router/testing';
import {MaterialModule} from '@angular/material';

import {GuideItems} from '../../shared/guide-items/guide-items';
import {GuideList} from './guide-list';


describe('GuideList', () => {
  let fixture: ComponentFixture<GuideList>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MaterialModule,
        RouterTestingModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [GuideList],
      providers: [GuideItems],
    });

    fixture = TestBed.createComponent(GuideList);
  }));

  it('should display a link for each item in guide items', () => {
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const totalItems = component.guideItems.getAllItems().length;
    const totalLinks = fixture
      .nativeElement
      .querySelectorAll('.docs-guide-item')
      .length;
    expect(totalLinks).toEqual(totalItems);
  });
});
