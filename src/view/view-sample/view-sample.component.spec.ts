import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IXViewSampleComponent } from './view-sample.component';

describe('ViewSampleComponent', () => {
  let component: IXViewSampleComponent;
  let fixture: ComponentFixture<IXViewSampleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IXViewSampleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IXViewSampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
