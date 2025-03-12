import { Component, OnDestroy, OnInit } from '@angular/core';
import { BoardsService } from '../../../shared/services/boards.service';
import { BoardInterface } from '../../../shared/types/board.interface';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'boards',
  standalone: false,
  templateUrl: './boards.component.html',
  styleUrl: './boards.component.scss',
})
// BoardsComponent sınıfı, OnInit arayüzünü implement eder (uygular) ve board'ları yönetir.
export class BoardsComponent implements OnInit,OnDestroy {
  private unsubscribe$ = new Subject<void>();
  
  // boards dizisi, BoardInterface tipinde olacak ve boş bir dizi olarak başlatılır.
  boards: BoardInterface[] = [];

  // Constructor: BoardsService servisini enjekte eder. Bu servis, board'ları almak ve oluşturmak için kullanılır.
  constructor(private boardsService: BoardsService) {}
  ngOnDestroy(): void {
    this.unsubscribe$.next();  // Abonelikleri sonlandır
    this.unsubscribe$.complete(); // Kaynakları temizle
  }

  // ngOnInit: Angular yaşam döngüsünde yer alan bir yöntemdir ve bileşen başlatıldığında çalışır.
  ngOnInit(): void {
    // boardsService kullanarak board'ları alır ve response'u 'boards' dizisine atar.
    this.boardsService.getBoards().pipe(takeUntil(this.unsubscribe$)).subscribe(boards => {
      this.boards = boards;  // Gelen board'ları boards dizisine aktarır.
    });
  }

  // createBoard metodu, yeni bir board oluşturmak için kullanılır.
  createBoard(title: string): void {
    // boardsService kullanarak yeni bir board oluşturur ve response'tan gelen board'u 'createdBoard' olarak alır.
    this.boardsService.createBoard(title).pipe(takeUntil(this.unsubscribe$)).subscribe((createdBoard) => {
      // Yeni oluşturulan board'u mevcut board listesine ekler (spread operator ile).
      this.boards = [...this.boards, createdBoard];  // Yeni board, eski board'ların sonuna eklenir.
    });
  }
}
