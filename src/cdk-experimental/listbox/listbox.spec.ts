import {
  ComponentFixture,
  async,
  TestBed,
} from '@angular/core/testing';
import {Component, Type} from '@angular/core';
import {By} from '@angular/platform-browser';
import {
  CdkOption,
  CdkListbox,
  CdkListboxModule
} from './index';

describe('CdkOption', () => {

  describe('selection state change', () => {
    let fixture: ComponentFixture<CdkListboxWithCdkOptions>;
    let listboxInstance: CdkListbox;
    let options: Array<CdkOption>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkListboxModule],
        declarations: [CdkListboxWithCdkOptions],
      }).compileComponents();

      fixture = TestBed.createComponent(CdkListboxWithCdkOptions);
      fixture.detectChanges();
      listboxInstance = fixture.debugElement.query(By.directive(CdkListbox)).injector.get(CdkListbox);
      options = listboxInstance._options.toArray();
    }));

    it('should have option selected defaults of null', () => {
      options.forEach(option => {
        expect(option.selected).toBe(null);
      });
    });



  });

});

@Component({
  template:`
    <div cdkListbox>
      <div cdkOption></div>
      <div cdkOption></div>
      <div cdkOption></div>
      <div cdkOption></div> 
    </div>`
})
class CdkListboxWithCdkOptions {

}




