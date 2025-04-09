/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import 'zone.js';
import 'zone.js/testing';
import 'reflect-metadata';

import {ErrorHandler, NgModule, provideExperimentalZonelessChangeDetection} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';

@NgModule({
  providers: [
    provideExperimentalZonelessChangeDetection(),
    {
      provide: ErrorHandler,
      useValue: {
        handleError: (e: any) => {
          throw e;
        },
      },
    },
  ],
})
export class TestModule {}

/*
 * Common setup / initialization for all unit tests in Angular Material and CDK.
 */
TestBed.initTestEnvironment([BrowserTestingModule, TestModule], platformBrowserTesting());

(window as any).module = {};
(window as any).isNode = false;
(window as any).isBrowser = true;
(window as any).global = window;
