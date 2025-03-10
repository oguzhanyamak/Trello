import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BoardInterface } from '../../shared/types/board.interface';
import { SocketService } from '../../shared/services/socket.service';
import { SocketEventsEnum } from '../../shared/types/socketEvents.enum';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  // Board bilgisini saklamak için BehaviorSubject
  board$ = new BehaviorSubject<BoardInterface |null >(null);

  constructor(private socketService:SocketService) { }

  //Mevcut board bilgisini günceller.
  setBoard(board:BoardInterface):void {
    this.board$.next(board);;
  }
  //Kullanıcı board'dan ayrıldığında board bilgisini sıfırlar ve sunucuya bildirir.
  leaveBoard(boardId:string):void{
    this.board$.next(null);
    this.socketService.emit(SocketEventsEnum.boardsLeave,{boardId})
  }
}
