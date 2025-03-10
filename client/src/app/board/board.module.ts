import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardComponent } from './components/board/board.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../auth/services/authGuard.service';
import { BoardsService } from '../shared/services/boards.service';
import { SocketService } from '../shared/services/socket.service';

const routes : Routes = [
  {
    path:'boards/:boardId',
    component:BoardComponent,
    canActivate:[AuthGuardService]
  }
]


@NgModule({
  declarations: [
    BoardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports:[BoardComponent],
  providers:[BoardsService,SocketService]
})
export class BoardModule { }
