import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import Gun from 'gun/gun';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [GunDb],
  bootstrap: [AppComponent]
})
export class AppModule { }

@Injectable()
export class GunDb {

  readonly gun = Gun(location.origin + '/gun');
}
