import {NgModule} from '@angular/core';
import {HttpModule, XHRBackend} from '@angular/http';
import {MockBackend} from '@angular/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {MATERIAL_SANITY_CHECKS} from '@angular/material';

@NgModule({
  imports: [RouterTestingModule, HttpModule],
  exports: [RouterTestingModule],
  providers: [
    MockBackend,
    {provide: XHRBackend, useExisting: MockBackend},
    {provide: MATERIAL_SANITY_CHECKS, useValue: false},
  ],
})
export class DocsAppTestingModule {}
