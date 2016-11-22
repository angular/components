import {DisableBodyScroll} from './disable-body-scroll';


describe('DisableBodyScroll', () => {
  let service: DisableBodyScroll;
  let forceScrollElement: HTMLElement;

  beforeEach(() => {
    forceScrollElement = document.createElement('div');
    forceScrollElement.style.height = '3000px';
    document.body.appendChild(forceScrollElement);
    service = new DisableBodyScroll();
  });

  afterEach(() => {
    forceScrollElement.parentNode.removeChild(forceScrollElement);
    forceScrollElement = null;
    service.deactivate();
  });

  it('should prevent scrolling', () => {
    window.scroll(0, 0);

    service.activate();

    window.scroll(0, 500);

    expect(window.pageYOffset).toBe(0);
  });

  it('should toggle the isActive property', () => {
    service.activate();
    expect(service.isActive).toBe(true);

    service.deactivate();
    expect(service.isActive).toBe(false);
  });

  it('should not disable scrolling if the content is shorter than the viewport height', () => {
    forceScrollElement.style.height = '0';
    service.activate();
    expect(service.isActive).toBe(false);
  });

  it('should add the proper inline styles to the <body> and <html> nodes', () => {
    let bodyCSS = document.body.style;
    let htmlCSS = document.documentElement.style;

    window.scroll(0, 500);
    service.activate();

    expect(bodyCSS.position).toBe('fixed');
    expect(bodyCSS.width).toBe('100%');
    expect(bodyCSS.top).toBe('-500px');
    expect(bodyCSS.maxWidth).toBeTruthy();
    expect(htmlCSS.overflowY).toBe('scroll');
  });

  it('should revert any previously-set inline styles', () => {
    let bodyCSS = document.body.style;
    let htmlCSS = document.documentElement.style;

    bodyCSS.position = 'static';
    bodyCSS.width = '1000px';
    htmlCSS.overflowY = 'hidden';

    service.activate();
    service.deactivate();

    expect(bodyCSS.position).toBe('static');
    expect(bodyCSS.width).toBe('1000px');
    expect(htmlCSS.overflowY).toBe('hidden');

    bodyCSS.cssText = '';
    htmlCSS.cssText = '';
  });

  it('should restore the scroll position when enabling scrolling', () => {
    window.scroll(0, 1000);

    service.activate();
    service.deactivate();

    expect(window.pageYOffset).toBe(1000);
  });
});
