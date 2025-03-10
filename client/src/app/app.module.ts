import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HomeModule } from './home/home.module';
import { AuthInterceptor } from './auth/services/auth.interceptor.service';
import { BoardsModule } from './boards/boards.module';
import { InlineFormModule } from './shared/modules/inlineForm/inline-form.module';
import { BoardModule } from './board/board.module';
import { SocketService } from './shared/services/socket.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule,
    HomeModule,
    BoardsModule,
    InlineFormModule,
    BoardModule,
    HttpClientModule
  ],
  providers: [
    {
      provide:HTTP_INTERCEPTORS,
      useClass:AuthInterceptor,
      multi:true
    },SocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
