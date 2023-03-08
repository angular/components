import {HttpClientTestingModule} from '@angular/common/http/testing';
import {NgModule} from '@angular/core';
import {MATERIAL_SANITY_CHECKS} from '@angular/material/core';
import {RouterTestingModule} from '@angular/router/testing';


@NgModule({
  imports: [RouterTestingModule, HttpClientTestingModule],
  exports: [RouterTestingModule],
  providers: [
    {provide: MATERIAL_SANITY_CHECKS, useValue: false},
  ],
})
export class DocsAppTestingModule {}
