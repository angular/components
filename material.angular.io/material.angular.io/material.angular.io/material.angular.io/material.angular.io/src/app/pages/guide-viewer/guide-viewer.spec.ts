import {async, TestBed, ComponentFixture} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {MaterialModule} from '@angular/material';
import {ActivatedRoute} from '@angular/router';

import {GuideItems} from '../../shared/guide-items/guide-items';
import {GuideViewer} from './guide-viewer';

const guideItemsID = 'getting-started';
const mockActivatedRoute = {
  params: Observable.create(observer => {
    observer.next({id: guideItemsID});
    observer.complete();
  })
};


describe('GuideViewer', () => {
  let fixture: ComponentFixture<GuideViewer>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [GuideViewer],
      providers: [
        {provide: ActivatedRoute, useValue: mockActivatedRoute},
        GuideItems
      ]
    });

    fixture = TestBed.createComponent(GuideViewer);
  }));

  it('should set the guide based off route params', () => {
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.guide)
      .toEqual(component.guideItems.getItemById(guideItemsID));
  });
});
