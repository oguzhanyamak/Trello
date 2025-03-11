import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BoardInterface } from '../../shared/types/board.interface';
import { SocketService } from '../../shared/services/socket.service';
import { SocketEventsEnum } from '../../shared/types/socketEvents.enum';
import { ColumnInterface } from '../../shared/types/column.interface';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  // Board bilgisini saklamak için BehaviorSubject
  board$ = new BehaviorSubject<BoardInterface |null >(null);
  columns$ = new BehaviorSubject<ColumnInterface[] >([]);

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
  setColumns(columns:ColumnInterface[]):void {
    this.columns$.next(columns); // Yeni sütun listesini yayınlayarak tüm aboneleri bilgilendirir.
  }
  addColumn(column:ColumnInterface):void{
    // Mevcut sütunları alıp, yeni sütunu ekleyerek güncellenmiş liste oluşturuyoruz.
    const updatedColumns = [...this.columns$.getValue(),column];
    // Yeni listeyi yayınlayarak güncellenmesini sağlıyoruz.
    this.columns$.next(updatedColumns);
  }
}
