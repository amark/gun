import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { NgPipesModule } from 'ngx-pipes';

import { AppComponent } from './app.component';
import { GunDb } from 'app/gun.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    NgPipesModule
  ],
  providers: [GunDb],
  bootstrap: [AppComponent]
})
export class AppModule { }
