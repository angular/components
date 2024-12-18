import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Router} from '@angular/router';
import {SECTIONS} from '../../shared/documentation-items/documentation-items';

/**
 * Guard to determine if the sidenav can load, based on whether the section exists in documentation
 * items.
 */
@Injectable({providedIn: 'root'})
export class CanActivateComponentSidenav  {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot) {
    // Searches if the section defined in the base UrlSegment is a valid section from the
    // documentation items. If found, returns true to allow activation, otherwise blocks activation
    // and navigates to '/'.
    if (Object.keys(SECTIONS).some((s => s.toLowerCase() === route.url[0].path.toLowerCase()))) {
      return true;
    }

    this.router.navigateByUrl('/');
    return false;
  }
}
