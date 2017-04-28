import { TestBed, async } from '@angular/core/testing';
import { MdFooterModule } from './index';


describe('MdFooter', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdFooterModule.forRoot()]
    });
    TestBed.compileComponents();
  }));
});
