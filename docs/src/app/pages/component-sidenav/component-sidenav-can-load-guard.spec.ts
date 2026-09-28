import {TestBed} from '@angular/core/testing';
import {ActivatedRouteSnapshot, provideRouter, Router, UrlSegment, UrlTree} from '@angular/router';
import {canActivateComponentSidenav} from './component-sidenav-can-load-guard';

describe('canActivateComponentSidenav', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  function runGuard(section: string) {
    const route = {url: [new UrlSegment(section, {})]} as unknown as ActivatedRouteSnapshot;
    return TestBed.runInInjectionContext(() => canActivateComponentSidenav(route, {} as any));
  }

  it('should allow activation for a known section', () => {
    expect(runGuard('components')).toBe(true);
    expect(runGuard('cdk')).toBe(true);
  });

  it('should match the section case-insensitively', () => {
    expect(runGuard('CDK')).toBe(true);
  });

  it('should redirect to the root for an unknown section', () => {
    const result = runGuard('unknown');
    const router = TestBed.inject(Router);

    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/');
  });
});
