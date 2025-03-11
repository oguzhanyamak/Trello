import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardComponent } from './components/board/board.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../auth/services/authGuard.service';
import { BoardsService } from '../shared/services/boards.service';
import { SocketService } from '../shared/services/socket.service';
import { ColumnsService } from '../shared/services/columns.service';
import { TopbarModule } from '../shared/modules/topbar/topbar.module';
import { InlineFormModule } from '../shared/modules/inlineForm/inline-form.module';

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
    TopbarModule,
    InlineFormModule,
    RouterModule.forChild(routes)
  ],
  exports:[BoardComponent],
  providers:[BoardsService,SocketService,ColumnsService]
})
export class BoardModule { }
