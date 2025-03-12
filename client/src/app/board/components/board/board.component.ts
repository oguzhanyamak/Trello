import { Component, OnDestroy, OnInit } from '@angular/core';
import { BoardsService } from '../../../shared/services/boards.service';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { BoardService } from '../../services/board.service';
import { BoardInterface } from '../../../shared/types/board.interface';
import { combineLatest, filter, map, Observable, Subject, takeUntil } from 'rxjs';
import { SocketService } from '../../../shared/services/socket.service';
import { SocketEventsEnum } from '../../../shared/types/socketEvents.enum';
import { ColumnsService } from '../../../shared/services/columns.service';
import { ColumnInterface } from '../../../shared/types/column.interface';
import { ColumnInputInterface } from '../../../shared/types/columnIput.interface';
import { TaskInterface } from '../../../shared/types/task.interface';
import { TasksService } from '../../../shared/services/tasks.service';
import { TaskInputInterface } from '../../../shared/types/taskInput.interface';

@Component({
  selector: 'app-board',
  standalone: false,
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit,OnDestroy {
  boardId: string;
  data$:Observable<{board:BoardInterface,columns:ColumnInterface[],tasks:TaskInterface[]}>;
  private unsubscribe$ = new Subject<void>();

  constructor(private boardsService: BoardsService, private route: ActivatedRoute,private boardService:BoardService,private socketService:SocketService,private router:Router,private columnsService:ColumnsService,private tasksService:TasksService) {
    this.boardId = this.route.snapshot.paramMap.get('boardId') ?? '';
    if (!this.boardId) {
      throw new Error('Cannot get boardId from URL');
    }

// this.data$ Observable'ı, boardService içindeki board$ ve columns$ stream'lerini birleştirerek güncellenmiş veriyi oluşturur.
this.data$ = combineLatest([
  this.boardService.board$.pipe(filter(Boolean)),  // board$ stream'ini filtreleyerek sadece geçerli (null veya undefined olmayan) değerleri alırız.
  this.boardService.columns$,
  this.boardService.tasks$  // columns$ stream'ini olduğu gibi alıyoruz.
])  // combineLatest ile gelen veriyi map ile dönüştürerek, board ve columns'u içeren bir nesne haline getiriyoruz.
.pipe(map(([board, columns,tasks]) => ({ board, columns ,tasks})));
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();  // Abonelikleri sonlandır
    this.unsubscribe$.complete(); // Kaynakları temizle
  }
  ngOnInit(): void {
    this.fetchData();
    this.socketService.emit(SocketEventsEnum.boardsJoin,{boardId:this.boardId})
    this.initializeListeners();
  }

  initializeListeners():void{
    this.router.events.pipe(takeUntil(this.unsubscribe$)).subscribe(event => {
      if (event instanceof NavigationStart){
        console.log("leaving page");
        this.boardService.leaveBoard(this.boardId);
      }
    });
    this.socketService.listen<ColumnInterface>(SocketEventsEnum.columnsCreateSuccess).pipe(takeUntil(this.unsubscribe$)).subscribe((column) => {
      this.boardService.addColumn(column);
    });
    this.socketService.listen<TaskInterface>(SocketEventsEnum.tasksCreateSuccess).pipe(takeUntil(this.unsubscribe$)).subscribe((task) => {
      this.boardService.addTask(task);
    });
    this.socketService.listen<BoardInterface>(SocketEventsEnum.boardsUpdateSuccess).pipe(takeUntil(this.unsubscribe$)).subscribe((board) => {
      this.boardService.updateBoard(board);
    });
    this.socketService.listen<void>(SocketEventsEnum.boardsDeleteSuccess).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.router.navigateByUrl('/boards');
    });
    this.socketService.listen<string>(SocketEventsEnum.columnsDeleteSuccess).pipe(takeUntil(this.unsubscribe$)).subscribe((columnId) => {
      this.boardService.deleteColumn(columnId);
    });
    this.socketService.listen<ColumnInterface>(SocketEventsEnum.columnsUpdateSuccess).pipe(takeUntil(this.unsubscribe$)).subscribe((column) => {
      this.boardService.updateColumn(column);
    });
  }

  fetchData(): void {
    this.boardsService.getBoard(this.boardId).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (board) => {
        this.boardService.setBoard(board);
      },
      error: (err) => {
        console.error('Error fetching board data:', err);
      }
    });
    this.columnsService.getColumns(this.boardId).pipe(takeUntil(this.unsubscribe$)).subscribe(columns => {
      this.boardService.setColumns(columns);
    });
    this.tasksService.getTasks(this.boardId).pipe(takeUntil(this.unsubscribe$)).subscribe(tasks => {
      this.boardService.setTask(tasks);
    });
  }

  createColumn(title:string):void{
    const columnInput : ColumnInputInterface = {title,boardId:this.boardId};
    this.columnsService.createColumn(columnInput);
  }

  getTasksByColumn(columnId:string,tasks:TaskInterface[]):TaskInterface[]{
    return tasks.filter((task) => task.columnId === columnId)
  }
  createTask(title: string, columnId: string): void {
    const taskInput: TaskInputInterface = {
      title,
      boardId: this.boardId,
      columnId,
    };
    this.tasksService.createTask(taskInput);
  }

  updateBoardName(boardName:string):void{
    this.boardsService.updateBoard(this.boardId,{title:boardName})
  }

  deleteBoard():void{
    if(confirm('Are you sure want to delete the board ?')){
      this.boardsService.deleteBoard(this.boardId);
    }

  }

  deleteColumn(columnId:string){
    this.columnsService.deleteColumn(this.boardId,columnId)
  }

  updateColumnName(columnName:string,columnId:string){
    this.columnsService.updateColumn(this.boardId,columnId,{title:columnName});
  }
}
