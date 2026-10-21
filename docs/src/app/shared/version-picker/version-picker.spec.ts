import {provideZoneChangeDetection} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {VersionPicker} from './version-picker';

describe('VersionPicker', () => {
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideZoneChangeDetection()],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  function openMenu() {
    const fixture = TestBed.createComponent(VersionPicker);
    fixture.detectChanges();
    return fixture;
  }

  function getMenuItems() {
    return Array.from(document.querySelectorAll('.docs-version-picker-menu [mat-menu-item]')).map(
      item => item.textContent?.trim(),
    );
  }

  it('should list the versions that were fetched', async () => {
    const fixture = openMenu();
    httpTestingController.expectOne('https://material.angular.dev/assets/versions.json').flush([
      {url: 'https://v21.material.angular.dev', title: '21.x'},
      {url: 'https://v20.material.angular.dev', title: '20.x'},
    ]);
    await fixture.whenStable();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();

    expect(getMenuItems()).toEqual(['21.x', '20.x']);
  });

  it('should not list any versions if fetching them fails', async () => {
    const fixture = openMenu();
    httpTestingController
      .expectOne('https://material.angular.dev/assets/versions.json')
      .flush(null, {status: 500, statusText: 'Server Error'});
    await fixture.whenStable();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();

    expect(getMenuItems()).toEqual([]);
  });
});
