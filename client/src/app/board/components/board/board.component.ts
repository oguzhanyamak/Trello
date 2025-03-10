import { Component, OnInit } from '@angular/core';
import { BoardsService } from '../../../shared/services/boards.service';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { BoardService } from '../../services/board.service';
import { BoardInterface } from '../../../shared/types/board.interface';
import { filter, Observable } from 'rxjs';
import { SocketService } from '../../../shared/services/socket.service';
import { SocketEventsEnum } from '../../../shared/types/socketEvents.enum';

@Component({
  selector: 'app-board',
  standalone: false,
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit {
  boardId: string;
  board$:Observable<BoardInterface>;

  constructor(private boardsService: BoardsService, private route: ActivatedRoute,private boardService:BoardService,private socketService:SocketService,private router:Router) {
    this.boardId = this.route.snapshot.paramMap.get('boardId') ?? '';
    if (!this.boardId) {
      throw new Error('Cannot get boardId from URL');
    }

    this.board$ = this.boardService.board$.pipe(filter(Boolean));
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
  }
}
