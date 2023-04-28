import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { HighchartsChartModule } from 'highcharts-angular';
import { PlaceholderComponent } from './placeholder/placeholder.component';

@NgModule({
  declarations: [AppComponent, PlaceholderComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatCardModule,
    HighchartsChartModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
