import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {ComponentPageHeader} from './component-page-header';
import {DocsAppTestingModule} from '../../testing/testing-module';


describe('ComponentPageHeader', () => {
  let fixture: ComponentFixture<ComponentPageHeader>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DocsAppTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentPageHeader);
  });

  it('should return the title', () => {
    const component = fixture.componentInstance;
    const title = 'foobar';
    fixture.detectChanges();
    component._componentPageTitle.title = title;
    expect(component.getTitle()).toEqual(title);
  });

  it('should emit a toggleSideNav event', () => {
    const component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(component.toggleSidenav, 'emit');
    fixture
      .nativeElement
      .querySelector('.sidenav-toggle')
      .click();
    expect(component.toggleSidenav.emit).toHaveBeenCalled();
  });
});
