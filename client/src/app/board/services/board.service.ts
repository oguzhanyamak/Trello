import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BoardInterface } from '../../shared/types/board.interface';
import { SocketService } from '../../shared/services/socket.service';
import { SocketEventsEnum } from '../../shared/types/socketEvents.enum';
import { ColumnInterface } from '../../shared/types/column.interface';
import { TaskInterface } from '../../shared/types/task.interface';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  // Board bilgisini saklamak için BehaviorSubject
  board$ = new BehaviorSubject<BoardInterface |null >(null);
  columns$ = new BehaviorSubject<ColumnInterface[] >([]);
  tasks$ = new BehaviorSubject<TaskInterface[] >([]);
  constructor(private socketService:SocketService) { }

  //Mevcut board bilgisini günceller.
  setBoard(board:BoardInterface):void {
    this.board$.next(board);;
  }
  setTask(tasks:TaskInterface[]):void {
    this.tasks$.next(tasks);;
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

  addTask(task:TaskInterface):void{
    // Mevcut sütunları alıp, yeni sütunu ekleyerek güncellenmiş liste oluşturuyoruz.
    const updatedTasks = [...this.tasks$.getValue(),task];
    // Yeni listeyi yayınlayarak güncellenmesini sağlıyoruz.
    this.tasks$.next(updatedTasks);
  }

  //Board'un başlığını güncelleyen fonksiyon.
  updateBoard(updatedBoard:BoardInterface):void{
    // Mevcut board değerini al
    const board = this.board$.getValue();
     // Eğer board henüz başlatılmamışsa hata fırlat
    if(!board){
      throw new Error('Board is not initialized');
    }
     // Mevcut board'un kopyasını oluştur ve başlığını güncelle, ardından yeni değeri yay
    this.board$.next({...board,title:updatedBoard.title});
  }

  deleteColumn(columnId:string){
    const updatedColumns = this.columns$.getValue().filter(column => column.id !== columnId);
    this.columns$.next(updatedColumns);
  }

  updateColumn(updatedColumn:ColumnInterface):void{
    const updatedColumns = this.columns$.getValue().map((column) => {
      if(column.id === updatedColumn.id){
        return {...column,title:updatedColumn.title};}
        return column
      });
      this.columns$.next(updatedColumns)
  }

}
