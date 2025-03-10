import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { BoardsComponent } from './components/boards/boards.component';
import { AuthGuardService } from '../auth/services/authGuard.service';
import { BoardsService } from '../shared/services/boards.service';
import { InlineFormModule } from '../shared/modules/inlineForm/inline-form.module';
import { TopbarModule } from '../shared/modules/topbar/topbar.module';

const routes: Routes = [
  {
    path: 'boards',
    component: BoardsComponent,
    canActivate: [AuthGuardService],
  },
];

@NgModule({
  declarations: [BoardsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    InlineFormModule,
    TopbarModule
  ],
  providers: [BoardsService],
})
export class BoardsModule {}
