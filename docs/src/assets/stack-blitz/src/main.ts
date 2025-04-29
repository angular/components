import '@angular/localize/init';
import {bootstrapApplication} from '@angular/platform-browser';
import {provideHttpClient} from '@angular/common/http';
import {provideAnimations} from '@angular/platform-browser/animations';
import {VERSION as CDK_VERSION} from '@angular/cdk';
import {VERSION as MAT_VERSION, provideNativeDateAdapter} from '@angular/material/core';
import {MaterialDocsExample} from './example/material-docs-example';

console.info('Angular CDK version', CDK_VERSION.full);
console.info('Angular Material version', MAT_VERSION.full);

bootstrapApplication(MaterialDocsExample, {
  providers: [provideAnimations(), provideHttpClient(), provideNativeDateAdapter()],
}).catch(err => console.error(err));
