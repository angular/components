import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IXComponentSampleComponent } from './component-sample.component';

describe('ComponentSampleComponent', () => {
  let component: IXComponentSampleComponent;
  let fixture: ComponentFixture<IXComponentSampleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IXComponentSampleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IXComponentSampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
