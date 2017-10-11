import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentSampleComponent } from './component-sample.component';

describe('ComponentSampleComponent', () => {
  let component: ComponentSampleComponent;
  let fixture: ComponentFixture<ComponentSampleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComponentSampleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentSampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
