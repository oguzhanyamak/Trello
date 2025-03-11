import { Component, OnInit } from '@angular/core';
import { BoardsService } from '../../../shared/services/boards.service';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { BoardService } from '../../services/board.service';
import { BoardInterface } from '../../../shared/types/board.interface';
import { combineLatest, filter, map, Observable } from 'rxjs';
import { SocketService } from '../../../shared/services/socket.service';
import { SocketEventsEnum } from '../../../shared/types/socketEvents.enum';
import { ColumnsService } from '../../../shared/services/columns.service';
import { ColumnInterface } from '../../../shared/types/column.interface';
import { ColumnInputInterface } from '../../../shared/types/columnIput.interface';

@Component({
  selector: 'app-board',
  standalone: false,
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit {
  boardId: string;
  data$:Observable<{board:BoardInterface,columns:ColumnInterface[]}>;

  constructor(private boardsService: BoardsService, private route: ActivatedRoute,private boardService:BoardService,private socketService:SocketService,private router:Router,private columnsService:ColumnsService) {
    this.boardId = this.route.snapshot.paramMap.get('boardId') ?? '';
    if (!this.boardId) {
      throw new Error('Cannot get boardId from URL');
    }

// this.data$ Observable'ı, boardService içindeki board$ ve columns$ stream'lerini birleştirerek güncellenmiş veriyi oluşturur.
this.data$ = combineLatest([
  this.boardService.board$.pipe(filter(Boolean)),  // board$ stream'ini filtreleyerek sadece geçerli (null veya undefined olmayan) değerleri alırız.
  this.boardService.columns$,  // columns$ stream'ini olduğu gibi alıyoruz.
])  // combineLatest ile gelen veriyi map ile dönüştürerek, board ve columns'u içeren bir nesne haline getiriyoruz.
.pipe(map(([board, columns]) => ({ board, columns })));
  }
  ngOnInit(): void {
    this.fetchData();
    this.socketService.emit(SocketEventsEnum.boardsJoin,{boardId:this.boardId})
    this.initializeListeners();
  }

  initializeListeners():void{
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart){
        console.log("leaving page");
        this.boardService.leaveBoard(this.boardId);
      }
    });
    this.socketService.listen<ColumnInterface>(SocketEventsEnum.columnsCreateSuccess).subscribe((column) => {
      this.boardService.addColumn(column);
    });
  }

  fetchData(): void {
    this.boardsService.getBoard(this.boardId).subscribe({
      next: (board) => {
        this.boardService.setBoard(board);
      },
      error: (err) => {
        console.error('Error fetching board data:', err);
      }
    });
    this.columnsService.getColumns(this.boardId).subscribe(columns => {
      this.boardService.setColumns(columns);
    });
  }

  createColumn(title:string):void{
    const columnInput : ColumnInputInterface = {title,boardId:this.boardId};
    this.columnsService.createColumn(columnInput);

  }
}
