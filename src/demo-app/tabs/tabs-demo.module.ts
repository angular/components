import {NgModule} from '@angular/core';
import {MaterialModule} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';

import {TabsDemo, RoutedContent1, RoutedContent2, RoutedContext3} from './tabs-demo';

@NgModule({
  imports: [
    FormsModule,
    BrowserModule,
    MaterialModule,
    RouterModule,
  ],
  declarations: [
    TabsDemo,
    RoutedContent1,
    RoutedContent2,
    RoutedContext3,
  ]
})
export class TabsDemoModule {}
